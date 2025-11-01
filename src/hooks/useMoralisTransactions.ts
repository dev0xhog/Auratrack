import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      
      const { data, error } = await supabase.functions.invoke('moralis-proxy', {
        body: { endpoint: `/${address}`, chain }
      });
      
      if (error) throw error;
      if (!data) throw new Error("Failed to fetch transactions from Moralis");
      
      return data.result;
    },
    enabled: !!address,
    staleTime: 60000,
    retry: 1,
  });
};

export type { MoralisTransaction };
