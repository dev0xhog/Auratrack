import { useQuery } from "@tanstack/react-query";
import { getApiKey } from "@/config/api";

interface NFT {
  contract: {
    address: string;
    name: string;
  };
  tokenId: string;
  title: string;
  description: string;
  media: {
    gateway: string;
    thumbnail: string;
  }[];
  metadata: {
    name: string;
    description: string;
    image: string;
  };
}

interface NFTsResponse {
  ownedNfts: NFT[];
  totalCount: number;
}

export const useNFTs = (address: string | undefined) => {
  return useQuery<NFT[]>({
    queryKey: ["nfts", address],
    queryFn: async () => {
      if (!address) throw new Error("Address is required");

      const apiKey = getApiKey("ALCHEMY");
      const response = await fetch(
        `https://eth-mainnet.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner?owner=${address}&withMetadata=true&pageSize=20`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch NFTs");
      }

      const data: NFTsResponse = await response.json();
      return data.ownedNfts;
    },
    enabled: !!address,
    staleTime: 300000,
    retry: 2,
  });
};

export type { NFT };
