import { useQuery } from "@tanstack/react-query";

export interface MoralisTokenTransfer {
  transaction_hash: string;
  from_address: string;
  to_address: string;
  value: string;
  block_timestamp: string;
  block_number: string;
  token_address: string;
  token_name?: string;
  token_symbol?: string;
  token_logo?: string;
  token_decimals?: string;
  chain: string;
}

interface AlchemyAssetTransfer {
  uniqueId: string;
  category: string;
  blockNum: string;
  from: string;
  to: string | null;
  value: number | null;
  asset: string | null;
  hash: string;
  rawContract: {
    value: string;
    address: string | null;
    decimal: string | null;
  };
  metadata: {
    blockTimestamp: string;
  };
}

interface AlchemyTransfersResponse {
  transfers: AlchemyAssetTransfer[];
  pageKey?: string;
}

const SUPPORTED_CHAINS = [
  { id: "eth-mainnet", name: "eth" },
  { id: "polygon-mainnet", name: "polygon" },
  { id: "arb-mainnet", name: "arbitrum" },
  { id: "opt-mainnet", name: "optimism" },
  { id: "base-mainnet", name: "base" },
  { id: "linea-mainnet", name: "linea" },
  { id: "scroll-mainnet", name: "scroll" },
  { id: "shape-mainnet", name: "shape" },
  { id: "arb-nova-mainnet", name: "arbitrum-nova" },
];

// Helper to fetch all token transfers with pagination
const fetchAllTokenTransfersForChain = async (
  chain: { id: string; name: string },
  address: string,
  apiKey: string
): Promise<MoralisTokenTransfer[]> => {
  const allTransfers: MoralisTokenTransfer[] = [];
  let pageKey: string | undefined;
  let hasMore = true;
  const maxPages = 3; // Limit to 3 pages per chain
  let pageCount = 0;

  while (hasMore && pageCount < maxPages) {
    try {
      const response = await fetch(
        `https://${chain.id}.g.alchemy.com/v2/${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "alchemy_getAssetTransfers",
            params: [
              {
                fromAddress: address,
                category: ["erc20", "erc721", "erc1155"],
                maxCount: "0x64", // 100 transfers
                order: "desc",
                withMetadata: true,
                excludeZeroValue: false,
                ...(pageKey && { pageKey }),
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        console.warn(`Failed to fetch token transfers from ${chain.name}: ${response.status}`);
        break;
      }

      const data = await response.json();
      const result: AlchemyTransfersResponse = data.result;

      if (result.transfers && result.transfers.length > 0) {
        const transfers = result.transfers.map((transfer) => ({
          transaction_hash: transfer.hash,
          from_address: transfer.from,
          to_address: transfer.to || "",
          value: transfer.rawContract.value || "0",
          block_timestamp: transfer.metadata.blockTimestamp,
          block_number: transfer.blockNum,
          token_address: transfer.rawContract.address || "",
          token_symbol: transfer.asset || undefined,
          token_decimals: transfer.rawContract.decimal || undefined,
          chain: chain.name,
        }));

        allTransfers.push(...transfers);
      }

      pageKey = result.pageKey;
      hasMore = !!pageKey;
      pageCount++;
    } catch (error) {
      console.warn(`Error fetching token transfers from ${chain.name}:`, error);
      break;
    }
  }

  return allTransfers;
};

export const useMoralisTokenTransfersByChain = (address: string | undefined) => {
  return useQuery<Record<string, MoralisTokenTransfer[]>>({
    queryKey: ["alchemy-token-transfers-by-chain", address],
    queryFn: async () => {
      if (!address) throw new Error("Address is required");

      const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY || "Y6xWxPYl6VWoSXskte0gPJL1oDe9m9kS";
      const transfersByChain: Record<string, MoralisTokenTransfer[]> = {};

      // Fetch token transfers from all supported chains in parallel
      await Promise.all(
        SUPPORTED_CHAINS.map(async (chain) => {
          const transfers = await fetchAllTokenTransfersForChain(chain, address, apiKey);
          if (transfers.length > 0) {
            transfersByChain[chain.name] = transfers;
          }
        })
      );

      return transfersByChain;
    },
    enabled: !!address,
    staleTime: 60000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
