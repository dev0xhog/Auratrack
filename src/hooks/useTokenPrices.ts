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
      const apiKey = import.meta.env.VITE_MORALIS_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYxYjUxMzI5LTRiOGUtNDg0Mi04MDRiLTFiMDYwYjAxOTBmYyIsIm9yZ0lkIjoiNDc0NzMxIiwidXNlcklkIjoiNDg4Mzc2IiwidHlwZUlkIjoiMjU4NjVkNGItMDQzYi00MjQ4LThmNGEtMzUxNzIxOTlkNjM1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk5MDQxOTYsImV4cCI6NDkxNTY2NDE5Nn0.e9nc8F3W4pCQCw-25-dRuam_IQsiEjd6ENEm9PLYjzQ";

      // First, fetch prices for native tokens using CoinCap (better rate limits)
      const nativeTokens = tokens.filter(t => !t.address);
      if (nativeTokens.length > 0) {
        try {
          const response = await fetch('https://api.coincap.io/v2/assets?limit=100');
          if (response.ok) {
            const data = await response.json();
            const assets = data.data || [];
            
            nativeTokens.forEach(token => {
              const symbol = token.symbol.toUpperCase();
              const asset = assets.find((a: any) => a.symbol?.toUpperCase() === symbol);
              
              if (asset && asset.priceUsd) {
                result[symbol] = {
                  id: asset.id,
                  symbol: symbol,
                  name: asset.name || symbol,
                  current_price: parseFloat(asset.priceUsd),
                  price_change_percentage_24h: parseFloat(asset.changePercent24Hr || '0'),
                };
                console.log(`✓ Native token ${symbol}: $${asset.priceUsd}`);
              }
            });
          }
        } catch (error) {
          console.error('CoinCap error:', error);
        }
      }

      // Then fetch prices for ERC-20 tokens using Moralis
      const erc20Tokens = tokens.filter(t => t.address && t.network);
      for (const token of erc20Tokens) {
        const symbol = token.symbol.toUpperCase();
        
        if (result[symbol]) continue; // Skip if already fetched
        
        try {
          const chain = token.network!.toLowerCase();
          const response = await fetch(
            `https://deep-index.moralis.io/api/v2.2/erc20/${token.address}/price?chain=${chain}`,
            {
              headers: {
                "X-API-Key": apiKey,
                "Accept": "application/json",
              },
            }
          );

          if (response.ok) {
            const priceData = await response.json();
            
            if (priceData.usdPrice !== undefined && priceData.usdPrice !== null) {
              result[symbol] = {
                id: token.address!,
                symbol: symbol,
                name: priceData.tokenName || symbol,
                current_price: parseFloat(priceData.usdPrice),
                price_change_percentage_24h: parseFloat(priceData['24hrPercentChange'] || '0'),
                logo: priceData.tokenLogo,
              };
              console.log(`✓ ERC-20 ${symbol}: $${priceData.usdPrice}`);
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 150));
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
        }
      }

      console.log(`✓ Total prices fetched: ${Object.keys(result).length} of ${tokens.length}`);
      return result;
    },
    enabled: tokens.length > 0,
    staleTime: 60000,
    retry: 2,
  });
};

export type { TokenPrice, TokenInfo };
