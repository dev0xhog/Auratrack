import { useQuery } from "@tanstack/react-query";
import { getApiKey } from "@/config/api";

interface MoralisTransaction {
  hash: string;
  from_address: string;
  to_address: string;
  value: string;
  block_timestamp: string;
  block_number: string;
  gas: string;
  gas_price: string;
  receipt_status?: string;
}

interface MoralisTransactionsResponse {
  result: MoralisTransaction[];
  cursor?: string;
}

export const useMoralisTransactions = (address: string | undefined, chain: string = "eth") => {
  return useQuery<MoralisTransaction[]>({
    queryKey: ["moralis-transactions", address, chain],
    queryFn: async () => {
      if (!address) throw new Error("Address is required");
      
      const apiKey = getApiKey('MORALIS');
      const response = await fetch(
        `https://deep-index.moralis.io/api/v2.2/${address}?chain=${chain}&limit=20`,
        {
          headers: {
            "X-API-Key": apiKey,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch transactions from Moralis");
      }
      
      const data: MoralisTransactionsResponse = await response.json();
      return data.result;
    },
    enabled: !!address,
    staleTime: 60000,
    retry: 1,
  });
};

export type { MoralisTransaction };
