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

      // Step 1: Batch fetch native tokens using markets endpoint (more reliable)
      const nativeTokens = tokens.filter(t => !t.address && symbolToGeckoId[t.symbol.toUpperCase()]);
      
      if (nativeTokens.length > 0) {
        const uniqueIds = [...new Set(nativeTokens.map(t => symbolToGeckoId[t.symbol.toUpperCase()]))];
        const idsParam = uniqueIds.join(",");
        
        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`,
            { 
              mode: 'cors',
              headers: {
                'Accept': 'application/json'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            
            data.forEach((coin: any) => {
              const symbol = coin.symbol.toUpperCase();
              result[symbol] = {
                id: coin.id,
                symbol: symbol,
                name: coin.name,
                current_price: coin.current_price || 0,
                price_change_percentage_24h: coin.price_change_percentage_24h || 0,
                logo: coin.image,
              };
            });
            
            console.log('Native tokens fetched:', data.length);
          } else {
            console.error('CoinGecko markets API error:', response.status, await response.text());
          }
        } catch (error) {
          console.error("CoinGecko batch native tokens API error:", error);
        }
      }

      // Step 2: Fetch ERC-20 tokens (skip for now to avoid rate limiting)
      // Focus on native tokens which are the most important
      const erc20Tokens = tokens.filter(t => t.address && t.network);
      
      // Only fetch top 10 ERC-20 tokens by balance to avoid rate limiting
      const sortedErc20 = erc20Tokens
        .sort((a, b) => {
          // Assuming tokens might have some balance info, otherwise fetch all
          return 0; // Keep original order for now
        })
        .slice(0, 10);
      
      if (sortedErc20.length > 0) {
        // Limit concurrent requests to avoid rate limiting
        const batchSize = 3;
        for (let i = 0; i < sortedErc20.length; i += batchSize) {
          const batch = sortedErc20.slice(i, i + batchSize);
          
          await Promise.all(
            batch.map(async (token) => {
              if (result[token.symbol.toUpperCase()]) return; // Skip if already fetched
              
              const platformId = networkToPlatformId[token.network?.toLowerCase() || ''];
              if (!platformId || !token.address) return;
              
              try {
                const response = await fetch(
                  `https://api.coingecko.com/api/v3/coins/${platformId}/contract/${token.address}`,
                  { 
                    mode: 'cors',
                    headers: {
                      'Accept': 'application/json'
                    }
                  }
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
                console.warn(`CoinGecko API error for ${token.symbol}:`, error);
              }
            })
          );
          
          // Add delay between batches to avoid rate limiting
          if (i + batchSize < sortedErc20.length) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
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
