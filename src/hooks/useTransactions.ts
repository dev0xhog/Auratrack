import { useQuery } from "@tanstack/react-query";

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  gasUsed: string;
  gasPrice: string;
  isError: string;
}

interface TransactionsResponse {
  status: string;
  message: string;
  result: Transaction[];
}

export const useTransactions = (address: string | undefined) => {
  return useQuery<Transaction[]>({
    queryKey: ["transactions", address],
    queryFn: async () => {
      if (!address) throw new Error("Address is required");
      
      const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY || "YourApiKeyToken";
      const response = await fetch(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      
      const data: TransactionsResponse = await response.json();
      
      if (data.status !== "1") {
        throw new Error(data.message || "Failed to fetch transactions");
      }
      
      return data.result;
    },
    enabled: !!address,
    staleTime: 60000,
    retry: 2,
  });
};

export type { Transaction };
