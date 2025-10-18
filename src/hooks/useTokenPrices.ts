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

      // Get unique symbols
      const uniqueSymbols = [...new Set(tokens.map(t => t.symbol.toUpperCase()))];
      
      try {
        // Fetch all assets from CoinCap v2 API (free, no key needed, better rate limits)
        const response = await fetch(
          `https://api.coincap.io/v2/assets?limit=2000`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        );
        
        if (response.ok) {
          const responseData = await response.json();
          const assets = responseData.data || [];
          
          // Map assets to our token symbols
          uniqueSymbols.forEach(symbol => {
            const asset = assets.find((a: any) => 
              a.symbol?.toUpperCase() === symbol.toUpperCase()
            );
            
            if (asset) {
              result[symbol] = {
                id: asset.id || symbol.toLowerCase(),
                symbol: symbol,
                name: asset.name || symbol,
                current_price: parseFloat(asset.priceUsd || '0'),
                price_change_percentage_24h: parseFloat(asset.changePercent24Hr || '0'),
              };
            }
          });
          
          console.log('Token prices fetched via CoinCap:', Object.keys(result).length, 'of', tokens.length, 'tokens');
        } else {
          console.error(`CoinCap API error: ${response.status}`);
        }
      } catch (error) {
        console.error("CoinCap API fetch error:", error);
      }

      return result;
    },
    enabled: tokens.length > 0,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
};

export type { TokenPrice, TokenInfo };
