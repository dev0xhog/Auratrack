import { useQuery } from "@tanstack/react-query";

interface Token {
  address: string;
  symbol: string;
  network: string;
  balance: number;
  balanceUSD: number;
}

interface Network {
  name: string;
  chainId: string;
  platformId: string;
  explorerUrl: string;
  iconUrls: string[];
}

interface PortfolioItem {
  network: Network;
  tokens: Token[];
}

interface PortfolioBalancesResponse {
  address: string;
  portfolio: PortfolioItem[];
  cached: boolean;
  version: string;
}

export const usePortfolioBalances = (address: string | undefined) => {
  return useQuery<PortfolioBalancesResponse>({
    queryKey: ["portfolio-balances", address],
    queryFn: async () => {
      if (!address) throw new Error("Address is required");
      
      const response = await fetch(
        `https://aura.adex.network/api/portfolio/balances?address=${address}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch portfolio balances");
      }
      
      return response.json();
    },
    enabled: !!address,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
};

export type { Token, Network, PortfolioItem, PortfolioBalancesResponse };
