import { useQuery } from "@tanstack/react-query";

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}

interface AlchemyNFT {
  contract: {
    address: string;
    name?: string;
    symbol?: string;
    tokenType: string;
    openSeaMetadata?: {
      floorPrice?: number;
      collectionName?: string;
      safelistRequestStatus?: string;
      imageUrl?: string;
      description?: string;
      externalUrl?: string;
    };
  };
  tokenId: string;
  tokenType: string;
  name?: string;
  description?: string;
  image?: {
    cachedUrl?: string;
    thumbnailUrl?: string;
    pngUrl?: string;
    contentType?: string;
    size?: number;
    originalUrl?: string;
  };
  raw?: {
    metadata?: NFTMetadata;
    tokenUri?: string;
  };
  tokenUri?: string;
  metadata?: NFTMetadata;
  balance?: string;
  collection?: {
    name?: string;
    slug?: string;
    externalUrl?: string;
    bannerImageUrl?: string;
  };
  mint?: {
    mintAddress?: string;
    blockNumber?: number;
    timestamp?: string;
  };
  spamInfo?: {
    isSpam: boolean;
    classifications: string[];
  };
}

interface MoralisNFT {
  token_address: string;
  token_id: string;
  name?: string;
  symbol?: string;
  token_uri?: string;
  metadata?: NFTMetadata;
  normalized_metadata?: NFTMetadata;
  amount?: string;
  contract_type: string;
  floor_price?: number;
  floor_price_usd?: number;
  possible_spam?: boolean;
  verified_collection?: boolean;
  image?: {
    cachedUrl?: string;
    thumbnailUrl?: string;
    originalUrl?: string;
  };
}

// Alchemy NFT API supported chains (free tier compatible)
const SUPPORTED_CHAINS = [
  { id: "eth-mainnet", name: "Ethereum" },
  { id: "polygon-mainnet", name: "Polygon" },
  { id: "arb-mainnet", name: "Arbitrum" },
  { id: "opt-mainnet", name: "Optimism" },
  { id: "base-mainnet", name: "Base" },
  { id: "linea-mainnet", name: "Linea" },
  { id: "scroll-mainnet", name: "Scroll" },
  { id: "shape-mainnet", name: "Shape" },
  { id: "arb-nova-mainnet", name: "Arbitrum Nova" },
];

// Helper to convert Alchemy NFT to our format
const convertAlchemyToMoralisFormat = (nft: AlchemyNFT): MoralisNFT => {
  const metadata = nft.metadata || nft.raw?.metadata;
  const floorPriceEth = nft.contract.openSeaMetadata?.floorPrice || 0;
  
  return {
    token_address: nft.contract.address,
    token_id: nft.tokenId,
    name: nft.name || metadata?.name || nft.contract.name,
    symbol: nft.contract.symbol,
    token_uri: nft.tokenUri || nft.raw?.tokenUri,
    metadata: metadata,
    normalized_metadata: metadata,
    amount: nft.balance || "1",
    contract_type: nft.tokenType,
    floor_price: floorPriceEth,
    floor_price_usd: floorPriceEth ? floorPriceEth * 4400 : undefined, // Rough ETH price
    possible_spam: nft.spamInfo?.isSpam || false,
    verified_collection: nft.contract.openSeaMetadata?.safelistRequestStatus === "verified",
    image: nft.image ? {
      cachedUrl: nft.image.cachedUrl,
      thumbnailUrl: nft.image.thumbnailUrl,
      originalUrl: nft.image.originalUrl,
    } : undefined,
  };
};

// Helper to fetch all NFTs with pagination
const fetchAllNFTsForChain = async (
  chain: { id: string; name: string },
  address: string,
  apiKey: string
): Promise<MoralisNFT[]> => {
  const allNFTs: MoralisNFT[] = [];
  let pageKey: string | undefined;
  let hasMore = true;

  while (hasMore) {
    try {
      const url = new URL(`https://${chain.id}.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner`);
      url.searchParams.set("owner", address);
      url.searchParams.set("withMetadata", "true");
      url.searchParams.set("pageSize", "100");
      
      // Add spam filter (works on paid tiers, gracefully ignored on free tier)
      url.searchParams.set("excludeFilters[]", "SPAM");
      
      if (pageKey) {
        url.searchParams.set("pageKey", pageKey);
      }

      const response = await fetch(url.toString(), {
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        console.warn(`Failed to fetch NFTs from ${chain.name}: ${response.status}`);
        break;
      }

      const data = await response.json();
      
      if (data.ownedNfts && data.ownedNfts.length > 0) {
        const nfts = data.ownedNfts
          .map((nft: AlchemyNFT) => convertAlchemyToMoralisFormat(nft))
          .filter((nft: MoralisNFT) => !nft.possible_spam);
        
        allNFTs.push(...nfts);
      }

      // Check if there are more pages
      pageKey = data.pageKey;
      hasMore = !!pageKey;
      
    } catch (error) {
      console.warn(`Error fetching NFTs from ${chain.name}:`, error);
      break;
    }
  }

  return allNFTs;
};

export const useMoralisNFTsByChain = (address: string | undefined) => {
  return useQuery<{ [chainName: string]: MoralisNFT[] }>({
    queryKey: ["alchemy-nfts-by-chain", address],
    queryFn: async () => {
      if (!address) throw new Error("Address is required");

      const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY || "Y6xWxPYl6VWoSXskte0gPJL1oDe9m9kS";
      const results: { [chainName: string]: MoralisNFT[] } = {};

      // Fetch NFTs from all supported chains in parallel with full pagination
      await Promise.all(
        SUPPORTED_CHAINS.map(async (chain) => {
          const nfts = await fetchAllNFTsForChain(chain, address, apiKey);
          if (nfts.length > 0) {
            results[chain.name] = nfts;
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
