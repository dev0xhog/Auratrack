import { useQuery } from "@tanstack/react-query";
import type { Network, PortfolioItem } from "./usePortfolioBalances";

interface Platform {
  name: string;
  url: string;
}

interface StrategyAction {
  tokens: string[];
  description: string;
  platforms: Platform[];
  networks: string[];
  operation: string;
  apy?: number;
}

interface Strategy {
  name: string;
  risk: string;
  actions: StrategyAction[];
}

interface LLMInfo {
  model: string;
  provider: string;
}

interface PortfolioStrategiesResponse {
  address: string;
  portfolio: PortfolioItem[];
  strategies: Strategy[];
  llm?: LLMInfo;
  cached: boolean;
  version: string;
}

export const usePortfolioStrategies = (address: string | undefined) => {
  return useQuery<PortfolioStrategiesResponse>({
    queryKey: ["portfolio-strategies", address],
    queryFn: async () => {
      if (!address) throw new Error("Address is required");
      
      const response = await fetch(
        `https://aura.adex.network/api/portfolio/strategies?address=${address}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch portfolio strategies");
      }
      
      return response.json();
    },
    enabled: !!address,
    staleTime: 300000, // 5 minutes
    retry: 2,
  });
};

export type { Strategy, StrategyAction, Platform, LLMInfo, PortfolioStrategiesResponse };
