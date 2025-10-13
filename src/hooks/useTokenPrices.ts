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

interface TokenInfo {
  symbol: string;
  address?: string;
  network?: string;
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

// Map network names to DexScreener chain IDs
const networkToChainId: { [key: string]: string } = {
  ethereum: "ethereum",
  polygon: "polygon",
  bsc: "bsc",
  binance: "bsc",
  avalanche: "avalanche",
  fantom: "fantom",
  arbitrum: "arbitrum",
  optimism: "optimism",
  base: "base",
};

export const useTokenPrices = (tokens: TokenInfo[]) => {
  return useQuery<{ [symbol: string]: TokenPrice }>({
    queryKey: ["token-prices", JSON.stringify(tokens.map(t => ({ s: t.symbol, a: t.address })))],
    queryFn: async () => {
      if (!tokens || tokens.length === 0) return {};

      const result: { [symbol: string]: TokenPrice } = {};

      // Step 1: Try CoinGecko for known symbols
      const symbols = tokens.map(t => t.symbol);
      const geckoIds = symbols
        .map((symbol) => symbolToGeckoId[symbol.toUpperCase()])
        .filter(Boolean);

      if (geckoIds.length > 0) {
        const uniqueIds = [...new Set(geckoIds)];
        const idsParam = uniqueIds.join(",");

        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd&include_24hr_change=true`
          );

          if (response.ok) {
            const data = await response.json();
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
          }
        } catch (error) {
          console.warn("CoinGecko API error:", error);
        }
      }

      // Step 2: Use DexScreener for tokens without CoinGecko data
      const tokensWithoutPrice = tokens.filter(
        (token) => !result[token.symbol.toUpperCase()] && token.address && token.network
      );

      if (tokensWithoutPrice.length > 0) {
        // Group by network for efficient batching
        const tokensByNetwork: { [network: string]: TokenInfo[] } = {};
        tokensWithoutPrice.forEach((token) => {
          const networkKey = token.network!.toLowerCase();
          if (!tokensByNetwork[networkKey]) {
            tokensByNetwork[networkKey] = [];
          }
          tokensByNetwork[networkKey].push(token);
        });

        // Fetch from DexScreener
        for (const [network, networkTokens] of Object.entries(tokensByNetwork)) {
          const addresses = networkTokens.map(t => t.address).filter(Boolean);
          if (addresses.length === 0) continue;

          try {
            // DexScreener accepts comma-separated addresses
            const addressesParam = addresses.join(",");
            const response = await fetch(
              `https://api.dexscreener.com/latest/dex/tokens/${addressesParam}`
            );

            if (response.ok) {
              const data = await response.json();
              
              // DexScreener returns { pairs: [...] }
              if (data.pairs && Array.isArray(data.pairs)) {
                networkTokens.forEach((token) => {
                  // Find the pair for this token
                  const pair = data.pairs.find((p: any) => 
                    p.baseToken?.address?.toLowerCase() === token.address?.toLowerCase()
                  );

                  if (pair && pair.priceUsd) {
                    result[token.symbol.toUpperCase()] = {
                      id: token.address || token.symbol,
                      symbol: token.symbol.toUpperCase(),
                      current_price: parseFloat(pair.priceUsd),
                      price_change_percentage_24h: parseFloat(pair.priceChange?.h24 || "0"),
                    };
                  }
                });
              }
            }
          } catch (error) {
            console.warn(`DexScreener API error for ${network}:`, error);
          }
        }
      }

      return result;
    },
    enabled: tokens.length > 0,
    staleTime: 60000, // 1 minute
    retry: 1,
  });
};

export type { TokenPrice, TokenInfo };
