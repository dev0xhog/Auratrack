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

interface MoralisTokenTransfersResponse {
  result: MoralisTokenTransfer[];
  cursor?: string;
}

const SUPPORTED_CHAINS = [
  "eth",
  "polygon",
  "bsc",
  "avalanche",
  "fantom",
  "arbitrum",
  "optimism",
  "base",
];

export const useMoralisTokenTransfersByChain = (address: string | undefined) => {
  return useQuery<Record<string, MoralisTokenTransfer[]>>({
    queryKey: ["moralis-token-transfers-by-chain", address],
    queryFn: async () => {
      if (!address) throw new Error("Address is required");
      
      const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYxYjUxMzI5LTRiOGUtNDg0Mi04MDRiLTFiMDYwYjAxOTBmYyIsIm9yZ0lkIjoiNDc0NzMxIiwidXNlcklkIjoiNDg4Mzc2IiwidHlwZUlkIjoiMjU4NjVkNGItMDQzYi00MjQ4LThmNGEtMzUxNzIxOTlkNjM1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk5MDQxOTYsImV4cCI6NDkxNTY2NDE5Nn0.e9nc8F3W4pCQCw-25-dRuam_IQsiEjd6ENEm9PLYjzQ";
      
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
  });
};
