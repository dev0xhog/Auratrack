import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

// Alchemy NFT API supported chains - mapped to moralis format
const SUPPORTED_CHAINS = [
  { id: "eth", name: "Ethereum" },
  { id: "polygon", name: "Polygon" },
  { id: "optimism", name: "Optimism" },
  { id: "arbitrum", name: "Arbitrum" },
  { id: "base", name: "Base" },
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
    floor_price_usd: floorPriceEth ? floorPriceEth * 4400 : undefined,
    possible_spam: nft.spamInfo?.isSpam || false,
    verified_collection: nft.contract.openSeaMetadata?.safelistRequestStatus === "verified",
    image: nft.image
      ? {
          cachedUrl: nft.image.cachedUrl,
          thumbnailUrl: nft.image.thumbnailUrl,
          originalUrl: nft.image.originalUrl,
        }
      : undefined,
  };
};

// Helper to fetch first page of NFTs (100 max per chain)
const fetchNFTsForChain = async (
  chain: { id: string; name: string },
  address: string,
): Promise<MoralisNFT[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('alchemy-proxy', {
      body: { address, chain: chain.id }
    });

    if (error) {
      console.warn(`Failed to fetch NFTs from ${chain.name}:`, error);
      return [];
    }

    if (data && data.ownedNfts && data.ownedNfts.length > 0) {
      return data.ownedNfts
        .map((nft: AlchemyNFT) => convertAlchemyToMoralisFormat(nft))
        .filter((nft: MoralisNFT) => !nft.possible_spam);
    }

    return [];
  } catch (error) {
    console.warn(`Error fetching NFTs from ${chain.name}:`, error);
    return [];
  }
};

export const useMoralisNFTsByChain = (address: string | undefined) => {
  return useQuery<{ [chainName: string]: MoralisNFT[] }>({
    queryKey: ["alchemy-nfts-by-chain", address],
    queryFn: async () => {
      if (!address) throw new Error("Address is required");

      const results: { [chainName: string]: MoralisNFT[] } = {};

      // Fetch NFTs from all supported chains in parallel
      const chainResults = await Promise.all(
        SUPPORTED_CHAINS.map((chain) => fetchNFTsForChain(chain, address)),
      );

      // Map results to chain names
      SUPPORTED_CHAINS.forEach((chain, index) => {
        if (chainResults[index].length > 0) {
          results[chain.name] = chainResults[index];
        }
      });

      return results;
    },
    enabled: !!address,
    staleTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export type { MoralisNFT, NFTMetadata };
export { SUPPORTED_CHAINS };
