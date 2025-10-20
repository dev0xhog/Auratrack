import { useQuery } from "@tanstack/react-query";
import { validateAndSanitizeAddress } from "@/lib/validation";
import { fetchWithTimeout } from "@/lib/apiClient";

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
      // Security: Validate and sanitize address input
      const validAddress = validateAndSanitizeAddress(address);
      if (!validAddress) {
        throw new Error("Invalid Ethereum address format");
      }
      
      const response = await fetchWithTimeout(
        `https://aura.adex.network/api/portfolio/balances?address=${validAddress}`,
        {
          timeout: 20000,
          retries: 2,
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch portfolio balances: ${response.status}`);
      }
      
      return response.json();
    },
    enabled: !!address && validateAndSanitizeAddress(address) !== null,
    staleTime: 120000, // Cache for 2 minutes
    retry: 2,
  });
};

export type { Token, Network, PortfolioItem, PortfolioBalancesResponse };
