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
      
      const apiKey = import.meta.env.VITE_MORALIS_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjAxODNkNzAwLWU5MDgtNDY5Yi1hODdjLWVlYzcwYjA5ZTk5NiIsIm9yZ0lkIjoiNDc2MDAyIiwidXNlcklkIjoiNDg5NzAxIiwidHlwZUlkIjoiYmMyZDExYjEtY2E1ZS00ZmYyLTkzMDQtZmIwZWE1ZmFiNDYzIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NjA1MDI5MDIsImV4cCI6NDkxNjI2MjkwMn0.Y5JRrStTce-FY7Sg0EHSIpa2O-ZutRHoy8DaK_ZWj1M";
      
      // Fetch transfers sequentially with delay to avoid rate limiting
      const results: MoralisTokenTransfer[][] = [];
      
      for (let i = 0; i < SUPPORTED_CHAINS.length; i++) {
        const chain = SUPPORTED_CHAINS[i];
        
        try {
          // Add delay between requests (except first one)
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 300));
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
    staleTime: 60000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
