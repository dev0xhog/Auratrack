import { useQuery } from "@tanstack/react-query";

interface TokenPrice {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  logo?: string;
  name?: string;
}

interface TokenInfo {
  symbol: string;
  address?: string;
  network?: string;
  balance?: number;
  balanceUSD?: number;
}

export const useTokenPrices = (tokens: TokenInfo[]) => {
  return useQuery<{ [symbol: string]: TokenPrice }>({
    queryKey: ["token-prices", JSON.stringify(tokens.map(t => ({ s: t.symbol, a: t.address, n: t.network })))],
    queryFn: async () => {
      if (!tokens || tokens.length === 0) return {};

      const result: { [symbol: string]: TokenPrice } = {};
      
      // Map common symbols to CoinGecko IDs
      const symbolToCoinGeckoId: { [key: string]: string } = {
        'ETH': 'ethereum',
        'BTC': 'bitcoin',
        'BNB': 'binancecoin',
        'MATIC': 'matic-network',
        'AVAX': 'avalanche-2',
        'FTM': 'fantom',
        'CRO': 'crypto-com-chain',
        'XDAI': 'xdai',
        'CHZ': 'chiliz',
        'GLMR': 'moonbeam',
        'MOVR': 'moonriver',
        'FLOW': 'flow',
        'RON': 'ronin',
        'LSK': 'lisk',
        'PLS': 'pulsechain',
        'USDT': 'tether',
        'USDC': 'usd-coin',
        'DAI': 'dai',
        'WETH': 'weth',
        'WBTC': 'wrapped-bitcoin',
      };

      // Get unique symbols and their CoinGecko IDs
      const uniqueSymbols = [...new Set(tokens.map(t => t.symbol.toUpperCase()))];
      const ids = uniqueSymbols
        .map(symbol => symbolToCoinGeckoId[symbol] || symbol.toLowerCase())
        .join(',');

      try {
        // Fetch from CoinGecko
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('CoinGecko response:', data);

          // Map results back to symbols
          uniqueSymbols.forEach(symbol => {
            const coinId = symbolToCoinGeckoId[symbol] || symbol.toLowerCase();
            const priceData = data[coinId];
            
            if (priceData && priceData.usd) {
              result[symbol] = {
                id: coinId,
                symbol: symbol,
                name: symbol,
                current_price: priceData.usd,
                price_change_percentage_24h: priceData.usd_24h_change || 0,
              };
              console.log(`✓ Price for ${symbol}: $${priceData.usd}`);
            } else {
              console.log(`✗ No price for ${symbol} (${coinId})`);
            }
          });
        } else {
          console.error('CoinGecko API error:', response.status, await response.text());
        }
      } catch (error) {
        console.error('Error fetching prices:', error);
      }

      console.log(`✓ Prices fetched: ${Object.keys(result).length} of ${uniqueSymbols.length}`);
      return result;
    },
    enabled: tokens.length > 0,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
};

export type { TokenPrice, TokenInfo };
