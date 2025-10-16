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
      
      const apiKey = import.meta.env.VITE_MORALIS_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYxYjUxMzI5LTRiOGUtNDg0Mi04MDRiLTFiMDYwYjAxOTBmYyIsIm9yZ0lkIjoiNDc0NzMxIiwidXNlcklkIjoiNDg4Mzc2IiwidHlwZUlkIjoiMjU4NjVkNGItMDQzYi00MjQ4LThmNGEtMzUxNzIxOTlkNjM1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk5MDQxOTYsImV4cCI6NDkxNTY2NDE5Nn0.e9nc8F3W4pCQCw-25-dRuam_IQsiEjd6ENEm9PLYjzQ";
      const response = await fetch(
        `https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=${chain}&format=decimal`,
        {
          headers: {
            "X-API-Key": apiKey,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch NFTs from Moralis");
      }
      
      const data: MoralisNFTsResponse = await response.json();
      return data.result;
    },
    enabled: !!address,
    staleTime: 300000,
    retry: 1,
  });
};

export type { MoralisNFT, NFTMetadata };
