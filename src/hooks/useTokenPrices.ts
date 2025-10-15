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
  balance?: number;
  balanceUSD?: number;
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

      // Use CoinCap API as fallback (more reliable, no rate limits on basic tier)
      const nativeTokenSymbols = tokens
        .filter(t => !t.address && symbolToGeckoId[t.symbol.toUpperCase()])
        .map(t => t.symbol.toUpperCase());

      const uniqueSymbols = [...new Set(nativeTokenSymbols)];
      
      if (uniqueSymbols.length > 0) {
        try {
          // Fetch prices from CoinCap (more reliable)
          const symbolsParam = uniqueSymbols.join(',');
          const response = await fetch(
            `https://api.coincap.io/v2/assets?ids=${uniqueSymbols.map(s => symbolToGeckoId[s] || s.toLowerCase()).join(',')}`,
            {
              headers: {
                'Accept': 'application/json'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.data) {
              data.data.forEach((coin: any) => {
                const symbol = coin.symbol.toUpperCase();
                result[symbol] = {
                  id: coin.id,
                  symbol: symbol,
                  name: coin.name,
                  current_price: parseFloat(coin.priceUsd) || 0,
                  price_change_percentage_24h: parseFloat(coin.changePercent24Hr) || 0,
                  logo: `https://assets.coincap.io/assets/icons/${coin.symbol.toLowerCase()}@2x.png`,
                };
              });
              
              console.log('Token prices fetched from CoinCap:', data.data.length);
            }
          } else {
            console.error('CoinCap API error:', response.status);
          }
        } catch (error) {
          console.error("CoinCap API error:", error);
        }
      }

      console.log('Token prices fetched:', Object.keys(result).length, 'of', tokens.length, 'tokens');
      return result;
    },
    enabled: tokens.length > 0,
    staleTime: 60000, // 1 minute
    retry: 1,
  });
};

export type { TokenPrice, TokenInfo };
