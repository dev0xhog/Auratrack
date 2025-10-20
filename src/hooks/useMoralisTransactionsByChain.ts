import { useQuery } from "@tanstack/react-query";
import { validateAndSanitizeAddress, isValidChain } from "@/lib/validation";
import { fetchWithTimeout, batchFetch, getApiKey } from "@/lib/apiClient";

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

interface MoralisTransactionsResponse {
  result: MoralisTransaction[];
  cursor?: string;
}

// Supported EVM chains for multi-chain transaction fetching
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

export const useMoralisTransactionsByChain = (address: string | undefined) => {
  return useQuery<{ [chain: string]: MoralisTransaction[] }>({
    queryKey: ["moralis-transactions-multi-chain", address],
    queryFn: async () => {
      // Security: Validate and sanitize address input
      const validAddress = validateAndSanitizeAddress(address);
      if (!validAddress) {
        throw new Error("Invalid Ethereum address format");
      }
      
      const apiKey = getApiKey('moralis') || 
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYxYjUxMzI5LTRiOGUtNDg0Mi04MDRiLTFiMDYwYjAxOTBmYyIsIm9yZ0lkIjoiNDc0NzMxIiwidXNlcklkIjoiNDg4Mzc2IiwidHlwZUlkIjoiMjU4NjVkNGItMDQzYi00MjQ4LThmNGEtMzUxNzIxOTlkNjM1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk5MDQxOTYsImV4cCI6NDkxNTY2NDE5Nn0.e9nc8F3W4pCQCw-25-dRuam_IQsiEjd6ENEm9PLYjzQ";
      
      // Performance: Fetch chains in parallel batches to reduce load time
      const fetchChainTransactions = async (chain: string) => {
        // Security: Validate chain parameter
        if (!isValidChain(chain, SUPPORTED_CHAINS)) {
          console.warn(`Invalid chain identifier: ${chain}`);
          return { chain, transactions: [] };
        }

        try {
          const response = await fetchWithTimeout(
            `https://deep-index.moralis.io/api/v2.2/${validAddress}?chain=${chain}&limit=50`,
            {
              headers: { "X-API-Key": apiKey },
              timeout: 15000,
              retries: 1,
            }
          );
          
          if (!response.ok) {
            console.warn(`Failed to fetch transactions for ${chain}: ${response.status}`);
            return { chain, transactions: [] };
          }
          
          const data: MoralisTransactionsResponse = await response.json();
          const transactionsWithChain = data.result.map(tx => ({
            ...tx,
            chain,
          }));
          
          return { chain, transactions: transactionsWithChain };
        } catch (error) {
          console.warn(`Error fetching transactions for ${chain}:`, error);
          return { chain, transactions: [] };
        }
      };

      // Performance: Batch requests with concurrency control (5 chains at a time)
      const requests = SUPPORTED_CHAINS.map(chain => () => fetchChainTransactions(chain));
      const results = await batchFetch(requests, 5);
      
      // Convert to object with chain as key (only include chains with data)
      const transactionsByChain: { [chain: string]: MoralisTransaction[] } = {};
      results.forEach(({ chain, transactions }) => {
        if (transactions.length > 0) {
          transactionsByChain[chain] = transactions;
        }
      });
      
      return transactionsByChain;
    },
    enabled: !!address && validateAndSanitizeAddress(address) !== null,
    staleTime: 300000, // Cache for 5 minutes for better performance
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export type { MoralisTransaction };
export { SUPPORTED_CHAINS };
