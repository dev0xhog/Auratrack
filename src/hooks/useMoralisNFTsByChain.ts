import { useQuery } from "@tanstack/react-query";

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

interface MoralisNFTResponse {
  token_address: string;
  token_id: string;
  name?: string;
  symbol?: string;
  token_uri?: string;
  metadata?: string | NFTMetadata;
  normalized_metadata?: NFTMetadata;
  amount?: string;
  contract_type: string;
  possible_spam?: boolean;
  verified_collection?: boolean;
}

interface MoralisNFT extends MoralisNFTResponse {
  floor_price?: number;
  floor_price_usd?: number;
  image?: {
    cachedUrl?: string;
    thumbnailUrl?: string;
    originalUrl?: string;
  };
}

// Moralis supported chains (matching portfolio and transaction chains)
const SUPPORTED_CHAINS = [
  { id: "eth", name: "Ethereum" },
  { id: "polygon", name: "Polygon" },
  { id: "bsc", name: "BSC" },
  { id: "avalanche", name: "Avalanche" },
  { id: "fantom", name: "Fantom" },
  { id: "arbitrum", name: "Arbitrum" },
  { id: "optimism", name: "Optimism" },
  { id: "base", name: "Base" },
];

// Helper to parse metadata string to object
const parseMetadata = (metadata: string | NFTMetadata | undefined): NFTMetadata | undefined => {
  if (!metadata) return undefined;
  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata);
    } catch {
      return undefined;
    }
  }
  return metadata;
};

// Helper to fetch all NFTs with pagination
const fetchAllNFTsForChain = async (
  chain: { id: string; name: string },
  address: string,
  apiKey: string
): Promise<MoralisNFT[]> => {
  const allNFTs: MoralisNFT[] = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    try {
      const url = new URL(`https://deep-index.moralis.io/api/v2.2/${address}/nft`);
      url.searchParams.set("chain", chain.id);
      url.searchParams.set("format", "decimal");
      url.searchParams.set("media_items", "false");
      url.searchParams.set("limit", "100");
      
      if (cursor) {
        url.searchParams.set("cursor", cursor);
      }

      const response = await fetch(url.toString(), {
        headers: {
          "Accept": "application/json",
          "X-API-Key": apiKey,
        },
      });

      if (!response.ok) {
        console.warn(`Failed to fetch NFTs from ${chain.name}: ${response.status}`);
        break;
      }

      const data = await response.json();
      
      if (data.result && data.result.length > 0) {
        const nfts = data.result.map((nft: MoralisNFTResponse) => {
          const parsedMetadata = parseMetadata(nft.metadata) || parseMetadata(nft.normalized_metadata);
          return {
            ...nft,
            metadata: parsedMetadata,
            normalized_metadata: parsedMetadata,
            image: parsedMetadata?.image ? {
              cachedUrl: parsedMetadata.image,
              thumbnailUrl: parsedMetadata.image,
              originalUrl: parsedMetadata.image,
            } : undefined,
          } as MoralisNFT;
        }).filter((nft: MoralisNFT) => !nft.possible_spam);
        
        allNFTs.push(...nfts);
      }

      // Check if there are more pages
      cursor = data.cursor;
      hasMore = !!cursor;
      
    } catch (error) {
      console.warn(`Error fetching NFTs from ${chain.name}:`, error);
      break;
    }
  }

  return allNFTs;
};

export const useMoralisNFTsByChain = (address: string | undefined) => {
  return useQuery<{ [chainName: string]: MoralisNFT[] }>({
    queryKey: ["moralis-nfts-by-chain", address],
    queryFn: async () => {
      if (!address) throw new Error("Address is required");

      const apiKey = import.meta.env.VITE_MORALIS_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjAxODNkNzAwLWU5MDgtNDY5Yi1hODdjLWVlYzcwYjA5ZTk5NiIsIm9yZ0lkIjoiNDc2MDAyIiwidXNlcklkIjoiNDg5NzAxIiwidHlwZUlkIjoiYmMyZDExYjEtY2E1ZS00ZmYyLTkzMDQtZmIwZWE1ZmFiNDYzIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NjA1MDI5MDIsImV4cCI6NDkxNjI2MjkwMn0.Y5JRrStTce-FY7Sg0EHSIpa2O-ZutRHoy8DaK_ZWj1M";
      const results: { [chainName: string]: MoralisNFT[] } = {};

      // Fetch NFTs sequentially with delay to avoid rate limiting
      for (let i = 0; i < SUPPORTED_CHAINS.length; i++) {
        const chain = SUPPORTED_CHAINS[i];
        
        try {
          // Add delay between requests (except first one)
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          const nfts = await fetchAllNFTsForChain(chain, address, apiKey);
          if (nfts.length > 0) {
            results[chain.name] = nfts;
          }
        } catch (error) {
          console.warn(`Error fetching NFTs for ${chain.name}:`, error);
        }
      }

      return results;
    },
    enabled: !!address,
    staleTime: 300000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export type { MoralisNFT, NFTMetadata };
export { SUPPORTED_CHAINS };
