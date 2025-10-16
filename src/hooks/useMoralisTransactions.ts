import { useQuery } from "@tanstack/react-query";

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
      
      const apiKey = import.meta.env.VITE_MORALIS_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYxYjUxMzI5LTRiOGUtNDg0Mi04MDRiLTFiMDYwYjAxOTBmYyIsIm9yZ0lkIjoiNDc0NzMxIiwidXNlcklkIjoiNDg4Mzc2IiwidHlwZUlkIjoiMjU4NjVkNGItMDQzYi00MjQ4LThmNGEtMzUxNzIxOTlkNjM1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk5MDQxOTYsImV4cCI6NDkxNTY2NDE5Nn0.e9nc8F3W4pCQCw-25-dRuam_IQsiEjd6ENEm9PLYjzQ";
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
