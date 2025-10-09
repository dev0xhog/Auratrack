import { useQuery } from "@tanstack/react-query";

interface TokenPrice {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface CoinGeckoResponse {
  [key: string]: TokenPrice;
}

// Map common token symbols to CoinGecko IDs
const symbolToGeckoId: { [key: string]: string } = {
  ETH: "ethereum",
  WETH: "weth",
  BTC: "bitcoin",
  WBTC: "wrapped-bitcoin",
  USDT: "tether",
  USDC: "usd-coin",
  DAI: "dai",
  MATIC: "matic-network",
  BNB: "binancecoin",
  AVAX: "avalanche-2",
  FTM: "fantom",
  OP: "optimism",
  ARB: "arbitrum",
  LINK: "chainlink",
  UNI: "uniswap",
  AAVE: "aave",
  CRV: "curve-dao-token",
  SNX: "havven",
  MKR: "maker",
  COMP: "compound-governance-token",
  SUSHI: "sushi",
  YFI: "yearn-finance",
  BAL: "balancer",
  GNO: "gnosis",
  LDO: "lido-dao",
  FRAX: "frax",
  FXS: "frax-share",
  CVX: "convex-finance",
  STG: "stargate-finance",
  GMX: "gmx",
  RDNT: "radiant-capital",
  USDD: "usdd",
  TUSD: "true-usd",
  BUSD: "binance-usd",
};

export const useTokenPrices = (symbols: string[]) => {
  return useQuery<{ [symbol: string]: TokenPrice }>({
    queryKey: ["token-prices", symbols.sort().join(",")],
    queryFn: async () => {
      if (!symbols || symbols.length === 0) return {};

      // Map symbols to CoinGecko IDs
      const geckoIds = symbols
        .map((symbol) => symbolToGeckoId[symbol.toUpperCase()])
        .filter(Boolean);

      if (geckoIds.length === 0) return {};

      const uniqueIds = [...new Set(geckoIds)];
      const idsParam = uniqueIds.join(",");

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd&include_24hr_change=true`
      );

      if (!response.ok) {
        console.warn("Failed to fetch token prices from CoinGecko");
        return {};
      }

      const data = await response.json();

      // Map back to symbols
      const result: { [symbol: string]: TokenPrice } = {};
      symbols.forEach((symbol) => {
        const geckoId = symbolToGeckoId[symbol.toUpperCase()];
        if (geckoId && data[geckoId]) {
          result[symbol.toUpperCase()] = {
            id: geckoId,
            symbol: symbol.toUpperCase(),
            current_price: data[geckoId].usd,
            price_change_percentage_24h: data[geckoId].usd_24h_change || 0,
          };
        }
      });

      return result;
    },
    enabled: symbols.length > 0,
    staleTime: 60000, // 1 minute
    retry: 1,
  });
};

export type { TokenPrice };
