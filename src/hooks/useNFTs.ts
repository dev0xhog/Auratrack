import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

      const { data, error } = await supabase.functions.invoke('alchemy-proxy', {
        body: { address, chain: 'eth' }
      });

      if (error) throw error;
      if (!data) throw new Error("Failed to fetch NFTs");

      return data.ownedNfts;
    },
    enabled: !!address,
    staleTime: 300000,
    retry: 2,
  });
};

export type { NFT };
