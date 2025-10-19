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

// Priority chains load first with minimal delay
const PRIORITY_CHAINS = [
  "eth",           // Ethereum
  "bsc",           // Binance Smart Chain
  "polygon",       // Polygon
  "arbitrum",      // Arbitrum
  "optimism",      // Optimism
  "base",          // Base
];

// Secondary chains load after with more delay
const SECONDARY_CHAINS = [
  "avalanche",     // Avalanche
  "linea",         // Linea
  "fantom",        // Fantom
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

const SUPPORTED_CHAINS = [...PRIORITY_CHAINS, ...SECONDARY_CHAINS];

export const useMoralisTokenTransfersByChain = (address: string | undefined) => {
  return useQuery<Record<string, MoralisTokenTransfer[]>>({
    queryKey: ["moralis-token-transfers-by-chain", address],
    queryFn: async () => {
      if (!address) throw new Error("Address is required");
      
      const apiKey = import.meta.env.VITE_MORALIS_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYxYjUxMzI5LTRiOGUtNDg0Mi04MDRiLTFiMDYwYjAxOTBmYyIsIm9yZ0lkIjoiNDc0NzMxIiwidXNlcklkIjoiNDg4Mzc2IiwidHlwZUlkIjoiMjU4NjVkNGItMDQzYi00MjQ4LThmNGEtMzUxNzIxOTlkNjM1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk5MDQxOTYsImV4cCI6NDkxNTY2NDE5Nn0.e9nc8F3W4pCQCw-25-dRuam_IQsiEjd6ENEm9PLYjzQ";
      
      // Fetch transfers sequentially with delay to avoid rate limiting
      const results: MoralisTokenTransfer[][] = [];
      
      for (let i = 0; i < SUPPORTED_CHAINS.length; i++) {
        const chain = SUPPORTED_CHAINS[i];
        const isPriority = PRIORITY_CHAINS.includes(chain);
        
        try {
          // Minimal delay for priority chains, more for secondary
          if (i > 0) {
            const delay = isPriority ? 50 : 150;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          const response = await fetch(
            `https://deep-index.moralis.io/api/v2.2/${address}/erc20/transfers?chain=${chain}&limit=50`,
            {
              headers: {
                "X-API-Key": apiKey,
              },
            }
          );
          
          if (!response.ok) {
            console.warn(`Failed to fetch token transfers for ${chain}: ${response.status}`);
            results.push([]);
            continue;
          }
          
          const data: MoralisTokenTransfersResponse = await response.json();
          results.push(data.result.map(tx => ({ ...tx, chain })));
        } catch (error) {
          console.warn(`Error fetching token transfers for ${chain}:`, error);
          results.push([]);
        }
      }

      const transfersByChain: Record<string, MoralisTokenTransfer[]> = {};
      SUPPORTED_CHAINS.forEach((chain, index) => {
        transfersByChain[chain] = results[index];
      });

      return transfersByChain;
    },
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
