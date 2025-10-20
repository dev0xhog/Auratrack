import { useQuery } from "@tanstack/react-query";
import { validateAndSanitizeAddress, isValidChain } from "@/lib/validation";
import { fetchWithTimeout, batchFetch, getApiKey } from "@/lib/apiClient";

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
      // Security: Validate and sanitize address input
      const validAddress = validateAndSanitizeAddress(address);
      if (!validAddress) {
        throw new Error("Invalid Ethereum address format");
      }
      
      const apiKey = getApiKey('moralis') || 
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYxYjUxMzI5LTRiOGUtNDg0Mi04MDRiLTFiMDYwYjAxOTBmYyIsIm9yZ0lkIjoiNDc0NzMxIiwidXNlcklkIjoiNDg4Mzc2IiwidHlwZUlkIjoiMjU4NjVkNGItMDQzYi00MjQ4LThmNGEtMzUxNzIxOTlkNjM1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk5MDQxOTYsImV4cCI6NDkxNTY2NDE5Nn0.e9nc8F3W4pCQCw-25-dRuam_IQsiEjd6ENEm9PLYjzQ";
      
      // Performance: Fetch chains in parallel batches
      const fetchChainTransfers = async (chain: string) => {
        // Security: Validate chain parameter
        if (!isValidChain(chain, SUPPORTED_CHAINS)) {
          console.warn(`Invalid chain identifier: ${chain}`);
          return { chain, transfers: [] };
        }

        try {
          const response = await fetchWithTimeout(
            `https://deep-index.moralis.io/api/v2.2/${validAddress}/erc20/transfers?chain=${chain}&limit=50`,
            {
              headers: { "X-API-Key": apiKey },
              timeout: 15000,
              retries: 1,
            }
          );
          
          if (!response.ok) {
            console.warn(`Failed to fetch token transfers for ${chain}: ${response.status}`);
            return { chain, transfers: [] };
          }
          
          const data: MoralisTokenTransfersResponse = await response.json();
          return { 
            chain, 
            transfers: data.result.map(tx => ({ ...tx, chain })) 
          };
        } catch (error) {
          console.warn(`Error fetching token transfers for ${chain}:`, error);
          return { chain, transfers: [] };
        }
      };

      // Performance: Batch requests with concurrency control (5 chains at a time)
      const requests = SUPPORTED_CHAINS.map(chain => () => fetchChainTransfers(chain));
      const results = await batchFetch(requests, 5);

      // Only include chains with actual transfers
      const transfersByChain: Record<string, MoralisTokenTransfer[]> = {};
      results.forEach(({ chain, transfers }) => {
        if (transfers.length > 0) {
          transfersByChain[chain] = transfers;
        }
      });

      return transfersByChain;
    },
    enabled: !!address && validateAndSanitizeAddress(address) !== null,
    staleTime: 300000, // Cache for 5 minutes for better performance
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
