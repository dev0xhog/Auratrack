import { useQuery } from "@tanstack/react-query";

interface TokenPrice {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  logo?: string;
  name?: string;
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

// Map network names to CoinGecko platform IDs
const networkToPlatformId: { [key: string]: string } = {
  ethereum: "ethereum",
  polygon: "polygon-pos",
  bsc: "binance-smart-chain",
  binance: "binance-smart-chain",
  avalanche: "avalanche",
  fantom: "fantom",
  arbitrum: "arbitrum-one",
  optimism: "optimistic-ethereum",
  base: "base",
};

export const useTokenPrices = (tokens: TokenInfo[]) => {
  return useQuery<{ [symbol: string]: TokenPrice }>({
    queryKey: ["token-prices", JSON.stringify(tokens.map(t => ({ s: t.symbol, a: t.address, n: t.network })))],
    queryFn: async () => {
      if (!tokens || tokens.length === 0) return {};

      const result: { [symbol: string]: TokenPrice } = {};

      // Step 1: Fetch native tokens with full details including logos
      const nativeTokens = tokens.filter(t => !t.address && symbolToGeckoId[t.symbol.toUpperCase()]);
      
      if (nativeTokens.length > 0) {
        const uniqueIds = [...new Set(nativeTokens.map(t => symbolToGeckoId[t.symbol.toUpperCase()]))];
        
        // Fetch detailed data for each native token
        for (const geckoId of uniqueIds) {
          try {
            const response = await fetch(
              `https://api.coingecko.com/api/v3/coins/${geckoId}?localization=false&tickers=false&community_data=false&developer_data=false`
            );
            
            if (response.ok) {
              const data = await response.json();
              const symbol = data.symbol.toUpperCase();
              
              result[symbol] = {
                id: geckoId,
                symbol: symbol,
                name: data.name,
                current_price: data.market_data?.current_price?.usd || 0,
                price_change_percentage_24h: data.market_data?.price_change_percentage_24h || 0,
                logo: data.image?.large || data.image?.small,
              };
            }
          } catch (error) {
            console.warn(`CoinGecko API error for ${geckoId}:`, error);
          }
        }
      }

      // Step 2: Fetch ERC-20 tokens using contract addresses
      const erc20Tokens = tokens.filter(t => t.address && t.network);
      
      for (const token of erc20Tokens) {
        if (result[token.symbol.toUpperCase()]) continue; // Skip if already fetched
        
        const platformId = networkToPlatformId[token.network.toLowerCase()];
        if (!platformId || !token.address) continue;
        
        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${platformId}/contract/${token.address}`
          );
          
          if (response.ok) {
            const data = await response.json();
            
            result[token.symbol.toUpperCase()] = {
              id: data.id,
              symbol: token.symbol.toUpperCase(),
              name: data.name,
              current_price: data.market_data?.current_price?.usd || 0,
              price_change_percentage_24h: data.market_data?.price_change_percentage_24h || 0,
              logo: data.image?.large || data.image?.small,
            };
          }
        } catch (error) {
          console.warn(`CoinGecko API error for ${token.symbol} on ${token.network}:`, error);
        }
      }

      // Step 3: Fallback - Try simple price endpoint for any remaining tokens
      const tokensWithoutPrice = tokens.filter(t => !result[t.symbol.toUpperCase()]);
      const symbols = tokensWithoutPrice.map(t => t.symbol);
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
              if (geckoId && data[geckoId] && !result[symbol.toUpperCase()]) {
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
          console.warn("CoinGecko simple price API error:", error);
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
