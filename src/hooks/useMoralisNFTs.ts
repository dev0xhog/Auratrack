import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
}

interface MoralisNFTsResponse {
  result: MoralisNFT[];
  cursor?: string;
}

export const useMoralisNFTs = (address: string | undefined, chain: string = "eth") => {
  return useQuery<MoralisNFT[]>({
    queryKey: ["moralis-nfts", address, chain],
    queryFn: async () => {
      if (!address) throw new Error("Address is required");
      
      const { data, error } = await supabase.functions.invoke('moralis-proxy', {
        body: { endpoint: `/${address}/nft`, chain }
      });
      
      if (error) throw error;
      if (!data) throw new Error("Failed to fetch NFTs from Moralis");
      
      return data.result;
    },
    enabled: !!address,
    staleTime: 300000,
    retry: 1,
  });
};

export type { MoralisNFT, NFTMetadata };
