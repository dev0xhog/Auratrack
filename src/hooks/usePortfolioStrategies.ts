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
      
      console.log("Fetching strategies for:", address);
      const url = `https://aura.adex.network/api/portfolio/strategies?address=${address}`;
      console.log("Strategy URL:", url);
      
      const response = await fetch(url);
      
      console.log("Strategy response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Strategy API error:", errorText);
        throw new Error(`Failed to fetch portfolio strategies: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Strategy data:", data);
      
      // Normalize the response to ensure it always has the expected structure
      return {
        address: data.address || address,
        portfolio: Array.isArray(data.portfolio) ? data.portfolio : [],
        strategies: Array.isArray(data.strategies) ? data.strategies : [],
        llm: data.llm,
        cached: data.cached || false,
        version: data.version || "1.0",
      };
    },
    enabled: !!address,
    staleTime: 300000, // 5 minutes
    retry: 2,
  });
};

export type { Strategy, StrategyAction, Platform, LLMInfo, PortfolioStrategiesResponse };
