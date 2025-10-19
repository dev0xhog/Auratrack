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
      if (!address) throw new Error("Address is required");
      
      const apiKey = import.meta.env.VITE_MORALIS_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYxYjUxMzI5LTRiOGUtNDg0Mi04MDRiLTFiMDYwYjAxOTBmYyIsIm9yZ0lkIjoiNDc0NzMxIiwidXNlcklkIjoiNDg4Mzc2IiwidHlwZUlkIjoiMjU4NjVkNGItMDQzYi00MjQ4LThmNGEtMzUxNzIxOTlkNjM1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk5MDQxOTYsImV4cCI6NDkxNTY2NDE5Nn0.e9nc8F3W4pCQCw-25-dRuam_IQsiEjd6ENEm9PLYjzQ";
      
      // Fetch transactions sequentially with delay to avoid rate limiting
      const results: Array<{ chain: string; transactions: MoralisTransaction[] }> = [];
      
      for (let i = 0; i < SUPPORTED_CHAINS.length; i++) {
        const chain = SUPPORTED_CHAINS[i];
        
        try {
          // Add delay between requests (except first one)
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          const response = await fetch(
            `https://deep-index.moralis.io/api/v2.2/${address}?chain=${chain}&limit=20`,
            {
              headers: {
                "X-API-Key": apiKey,
              },
            }
          );
          
          if (!response.ok) {
            console.warn(`Failed to fetch transactions for ${chain}: ${response.status}`);
            results.push({ chain, transactions: [] });
            continue;
          }
          
          const data: MoralisTransactionsResponse = await response.json();
          // Add chain info to each transaction
          const transactionsWithChain = data.result.map(tx => ({
            ...tx,
            chain,
          }));
          results.push({ chain, transactions: transactionsWithChain });
        } catch (error) {
          console.warn(`Error fetching transactions for ${chain}:`, error);
          results.push({ chain, transactions: [] });
        }
      }
      
      // Convert to object with chain as key
      const transactionsByChain: { [chain: string]: MoralisTransaction[] } = {};
      results.forEach(({ chain, transactions }) => {
        if (transactions.length > 0) {
          transactionsByChain[chain] = transactions;
        }
      });
      
      return transactionsByChain;
    },
    enabled: !!address,
    staleTime: 60000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export type { MoralisTransaction };
export { SUPPORTED_CHAINS };
