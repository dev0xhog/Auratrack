import { useQuery } from "@tanstack/react-query";

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

interface MoralisNFT {
  token_address: string;
  token_id: string;
  name?: string;
  symbol?: string;
  token_uri?: string;
  metadata?: string | NFTMetadata;
  normalized_metadata?: NFTMetadata;
  amount?: string;
  contract_type: string;
  floor_price?: number;
  floor_price_usd?: number;
  possible_spam?: boolean;
  verified_collection?: boolean;
}

interface MoralisNFTsResponse {
  result: MoralisNFT[];
  cursor?: string;
}

// Supported EVM chains for Moralis
const SUPPORTED_CHAINS = [
  { id: "eth", name: "Ethereum" },
  { id: "polygon", name: "Polygon" },
  { id: "bsc", name: "BNB Chain" },
  { id: "avalanche", name: "Avalanche" },
  { id: "fantom", name: "Fantom" },
  { id: "arbitrum", name: "Arbitrum" },
  { id: "optimism", name: "Optimism" },
  { id: "base", name: "Base" },
];

export const useMoralisNFTsByChain = (address: string | undefined) => {
  return useQuery<{ [chainName: string]: MoralisNFT[] }>({
    queryKey: ["moralis-nfts-by-chain", address],
    queryFn: async () => {
      if (!address) throw new Error("Address is required");

      const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYxYjUxMzI5LTRiOGUtNDg0Mi04MDRiLTFiMDYwYjAxOTBmYyIsIm9yZ0lkIjoiNDc0NzMxIiwidXNlcklkIjoiNDg4Mzc2IiwidHlwZUlkIjoiMjU4NjVkNGItMDQzYi00MjQ4LThmNGEtMzUxNzIxOTlkNjM1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk5MDQxOTYsImV4cCI6NDkxNTY2NDE5Nn0.e9nc8F3W4pCQCw-25-dRuam_IQsiEjd6ENEm9PLYjzQ";
      
      const results: { [chainName: string]: MoralisNFT[] } = {};

      // Fetch NFTs from all supported chains in parallel
      await Promise.all(
        SUPPORTED_CHAINS.map(async (chain) => {
          try {
            const response = await fetch(
              `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=${chain.id}&format=decimal&media_items=true`,
              {
                headers: {
                  "X-API-Key": apiKey,
                },
              }
            );

            if (response.ok) {
              const data: MoralisNFTsResponse = await response.json();
              if (data.result && data.result.length > 0) {
                results[chain.name] = data.result;
              }
            }
          } catch (error) {
            console.warn(`Failed to fetch NFTs from ${chain.name}:`, error);
          }
        })
      );

      return results;
    },
    enabled: !!address,
    staleTime: 300000, // 5 minutes
    retry: 1,
  });
};

export type { MoralisNFT, NFTMetadata };
export { SUPPORTED_CHAINS };
