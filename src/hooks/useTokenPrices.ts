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

      // Get unique symbols for batch fetching
      const uniqueSymbols = [...new Set(tokens.map(t => t.symbol.toUpperCase()))];
      
      // CoinCap supports up to 100 symbols per request
      const batchSize = 100;
      for (let i = 0; i < uniqueSymbols.length; i += batchSize) {
        const batch = uniqueSymbols.slice(i, i + batchSize);
        const symbolsParam = batch.join(',');
        
        try {
          // Using CoinCap v3 API - no API key needed for basic usage
          const response = await fetch(
            `https://rest.coincap.io/v3/price/bysymbol/${symbolsParam}`,
            {
              headers: {
                'Accept': 'application/json'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            
            // CoinCap v3 returns: { symbol: { price: number, change24Hr: number } }
            Object.entries(data).forEach(([symbol, priceData]: [string, any]) => {
              if (priceData && typeof priceData === 'object') {
                result[symbol.toUpperCase()] = {
                  id: symbol.toLowerCase(),
                  symbol: symbol.toUpperCase(),
                  name: symbol,
                  current_price: parseFloat(priceData.price || '0'),
                  price_change_percentage_24h: parseFloat(priceData.change24Hr || '0'),
                };
              }
            });
          } else {
            console.error(`CoinCap API error: ${response.status}`);
          }
        } catch (error) {
          console.error("CoinCap API fetch error:", error);
        }
      }

      console.log('Token prices fetched via CoinCap:', Object.keys(result).length, 'of', tokens.length, 'tokens');
      return result;
    },
    enabled: tokens.length > 0,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
};

export type { TokenPrice, TokenInfo };
