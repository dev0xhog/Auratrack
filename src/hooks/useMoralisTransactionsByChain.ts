import { useQuery } from "@tanstack/react-query";

interface MoralisTransaction {
  hash: string;
  from_address: string;
  to_address: string;
  value: string;
  block_timestamp: string;
  block_number: string;
  gas: string;
  gas_price: string;
  receipt_status?: string;
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

// Alchemy chain identifiers for transaction fetching
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

// Helper to fetch all transactions with pagination
const fetchAllTransactionsForChain = async (
  chain: { id: string; name: string },
  address: string,
  apiKey: string
): Promise<MoralisTransaction[]> => {
  const allTransactions: MoralisTransaction[] = [];
  let pageKey: string | undefined;
  let hasMore = true;
  const maxPages = 3; // Limit to 3 pages per chain to avoid long load times
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
                category: ["external", "internal"],
                maxCount: "0x64", // 100 transactions
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
        console.warn(`Failed to fetch transactions from ${chain.name}: ${response.status}`);
        break;
      }

      const data = await response.json();
      const result: AlchemyTransfersResponse = data.result;

      if (result.transfers && result.transfers.length > 0) {
        const transactions = result.transfers.map((transfer) => ({
          hash: transfer.hash,
          from_address: transfer.from,
          to_address: transfer.to || "",
          value: transfer.rawContract.value || "0",
          block_timestamp: transfer.metadata.blockTimestamp,
          block_number: transfer.blockNum,
          gas: "0",
          gas_price: "0",
          receipt_status: "1",
          chain: chain.name,
        }));

        allTransactions.push(...transactions);
      }

      pageKey = result.pageKey;
      hasMore = !!pageKey;
      pageCount++;
    } catch (error) {
      console.warn(`Error fetching transactions from ${chain.name}:`, error);
      break;
    }
  }

  return allTransactions;
};

export const useMoralisTransactionsByChain = (address: string | undefined) => {
  return useQuery<{ [chain: string]: MoralisTransaction[] }>({
    queryKey: ["alchemy-transactions-multi-chain", address],
    queryFn: async () => {
      if (!address) throw new Error("Address is required");

      const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY || "Y6xWxPYl6VWoSXskte0gPJL1oDe9m9kS";
      const results: { [chain: string]: MoralisTransaction[] } = {};

      // Fetch transactions from all supported chains in parallel
      await Promise.all(
        SUPPORTED_CHAINS.map(async (chain) => {
          const transactions = await fetchAllTransactionsForChain(chain, address, apiKey);
          if (transactions.length > 0) {
            results[chain.name] = transactions;
          }
        })
      );

      return results;
    },
    enabled: !!address,
    staleTime: 60000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export type { MoralisTransaction };
export { SUPPORTED_CHAINS };
