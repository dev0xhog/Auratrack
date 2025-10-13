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

interface StrategyWrapper {
  llm?: LLMInfo;
  response: Strategy[];
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

interface RawAPIResponse {
  address: string;
  portfolio: PortfolioItem[];
  strategies: StrategyWrapper[];
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
      
      const rawData: RawAPIResponse = await response.json();
      console.log("Strategy data:", rawData);
      
      // Flatten nested response structure from Aura API
      // API returns: strategies: [{ llm: {...}, response: [Strategy, Strategy] }]
      // We want: strategies: [Strategy, Strategy]
      const flattenedStrategies = rawData.strategies?.flatMap(
        wrapper => wrapper.response || []
      ) || [];
      
      // Normalize the response to ensure it always has the expected structure
      return {
        address: rawData.address || address,
        portfolio: Array.isArray(rawData.portfolio) ? rawData.portfolio : [],
        strategies: flattenedStrategies,
        llm: rawData.strategies?.[0]?.llm, // Use LLM info from first strategy wrapper
        cached: rawData.cached || false,
        version: rawData.version || "1.0",
      };
    },
    enabled: !!address,
    staleTime: 300000, // 5 minutes
    retry: 2,
  });
};

export type { Strategy, StrategyAction, Platform, LLMInfo, PortfolioStrategiesResponse };
