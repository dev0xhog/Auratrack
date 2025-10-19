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
  possible_spam?: boolean;
  security_score?: number | null;
  verified_contract?: boolean;
}

interface MoralisTokenTransfersResponse {
  result: MoralisTokenTransfer[];
  cursor?: string;
}

const SUPPORTED_CHAINS = [
  "eth",           // Ethereum
  "polygon",       // Polygon
  "bsc",           // Binance Smart Chain
  "avalanche",     // Avalanche
  "fantom",        // Fantom
  "arbitrum",      // Arbitrum
  "optimism",      // Optimism
  "base",          // Base
  "linea",         // Linea
  "cronos",        // Cronos
  "gnosis",        // Gnosis
  "chiliz",        // Chiliz
  "moonbeam",      // Moonbeam
  "moonriver",     // Moonriver
  "flow",          // Flow
  "ronin",         // Ronin
  "lisk",          // Lisk
  "pulsechain",    // Pulsechain
];

export const useMoralisTokenTransfersByChain = (address: string | undefined) => {
  return useQuery<Record<string, MoralisTokenTransfer[]>>({
    queryKey: ["moralis-token-transfers-by-chain", address],
    queryFn: async () => {
      if (!address) throw new Error("Address is required");
      
      const apiKey = import.meta.env.VITE_MORALIS_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYxYjUxMzI5LTRiOGUtNDg0Mi04MDRiLTFiMDYwYjAxOTBmYyIsIm9yZ0lkIjoiNDc0NzMxIiwidXNlcklkIjoiNDg4Mzc2IiwidHlwZUlkIjoiMjU4NjVkNGItMDQzYi00MjQ4LThmNGEtMzUxNzIxOTlkNjM1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk5MDQxOTYsImV4cCI6NDkxNTY2NDE5Nn0.e9nc8F3W4pCQCw-25-dRuam_IQsiEjd6ENEm9PLYjzQ";
      
      // Fetch all chains in parallel for faster initial load - limit to 3 transfers per chain
      const fetchPromises = SUPPORTED_CHAINS.map(async (chain) => {
        try {
          const response = await fetch(
            `https://deep-index.moralis.io/api/v2.2/${address}/erc20/transfers?chain=${chain}&limit=3`,
            {
              headers: {
                "X-API-Key": apiKey,
              },
            }
          );
          
          if (!response.ok) {
            return { chain, transfers: [] };
          }
          
          const data: MoralisTokenTransfersResponse = await response.json();
          return { chain, transfers: data.result.map(tx => ({ ...tx, chain })) };
        } catch (error) {
          return { chain, transfers: [] };
        }
      });

      const results = await Promise.all(fetchPromises);

      const transfersByChain: Record<string, MoralisTokenTransfer[]> = {};
      results.forEach(({ chain, transfers }) => {
        if (transfers.length > 0) {
          transfersByChain[chain] = transfers;
        }
      });

      return transfersByChain;
    },
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
