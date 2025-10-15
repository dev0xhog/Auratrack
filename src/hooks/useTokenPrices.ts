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

      // Separate native tokens and ERC-20 tokens
      const nativeTokens = tokens.filter(t => 
        (!t.address || t.address === '0x0000000000000000000000000000000000000000') && 
        symbolToGeckoId[t.symbol.toUpperCase()]
      );
      const erc20Tokens = tokens.filter(t => 
        t.address && 
        t.address !== '0x0000000000000000000000000000000000000000'
      );

      // Fetch native token prices
      const uniqueIds = [...new Set(nativeTokens.map(t => symbolToGeckoId[t.symbol.toUpperCase()]))];
      
      if (uniqueIds.length > 0) {
        try {
          const idsParam = uniqueIds.join(',');
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd&include_24hr_change=true`,
            {
              headers: {
                'Accept': 'application/json'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            
            // Map the response back to symbols
            Object.entries(symbolToGeckoId).forEach(([symbol, geckoId]) => {
              if (data[geckoId]) {
                result[symbol] = {
                  id: geckoId,
                  symbol: symbol,
                  name: symbol,
                  current_price: data[geckoId].usd || 0,
                  price_change_percentage_24h: data[geckoId].usd_24h_change || 0,
                };
              }
            });
          }
        } catch (error) {
          console.error("CoinGecko native token API error:", error);
        }
      }

      // Fetch ERC-20 token prices by contract address
      // Group tokens by network for batch fetching
      const tokensByNetwork: { [network: string]: TokenInfo[] } = {};
      erc20Tokens.forEach(token => {
        const network = (token.network || '').toLowerCase();
        if (!tokensByNetwork[network]) {
          tokensByNetwork[network] = [];
        }
        tokensByNetwork[network].push(token);
      });

      // Fetch prices for each network
      for (const [network, networkTokens] of Object.entries(tokensByNetwork)) {
        const platformId = Object.entries(networkToPlatformId).find(([key]) => 
          network.includes(key)
        )?.[1];

        if (platformId && networkTokens.length > 0) {
          // Batch requests in groups of 30 addresses (CoinGecko limit)
          const batchSize = 30;
          for (let i = 0; i < networkTokens.length; i += batchSize) {
            const batch = networkTokens.slice(i, i + batchSize);
            const addresses = batch.map(t => t.address).join(',');
            
            try {
              const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/token_price/${platformId}?contract_addresses=${addresses}&vs_currencies=usd&include_24hr_change=true`,
                {
                  headers: {
                    'Accept': 'application/json'
                  }
                }
              );
              
              if (response.ok) {
                const data = await response.json();
                
                // Map response back to token symbols
                batch.forEach(token => {
                  const addressLower = token.address?.toLowerCase();
                  if (addressLower && data[addressLower]) {
                    result[token.symbol.toUpperCase()] = {
                      id: addressLower,
                      symbol: token.symbol.toUpperCase(),
                      name: token.symbol,
                      current_price: data[addressLower].usd || 0,
                      price_change_percentage_24h: data[addressLower].usd_24h_change || 0,
                    };
                  }
                });
              }
            } catch (error) {
              console.error(`CoinGecko ERC-20 token API error for ${platformId}:`, error);
            }
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
