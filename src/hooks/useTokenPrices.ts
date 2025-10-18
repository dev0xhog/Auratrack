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

      console.log('Starting price fetch for tokens:', tokens.length);

      // Process each token individually
      for (const token of tokens) {
        if (!token.address || !token.network) {
          console.log(`Skipping token ${token.symbol} - missing address or network`);
          continue;
        }

        const symbol = token.symbol.toUpperCase();
        
        // Skip if we already have this price
        if (result[symbol]) {
          console.log(`Already have price for ${symbol}`);
          continue;
        }

        try {
          const chain = token.network.toLowerCase();
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
            console.log(`Price data for ${symbol}:`, priceData);
            
            if (priceData.usdPrice !== undefined && priceData.usdPrice !== null) {
              result[symbol] = {
                id: token.address || symbol.toLowerCase(),
                symbol: symbol,
                name: priceData.tokenName || symbol,
                current_price: parseFloat(priceData.usdPrice),
                price_change_percentage_24h: parseFloat(priceData['24hrPercentChange'] || '0'),
                logo: priceData.tokenLogo,
              };
              console.log(`✓ Fetched price for ${symbol}: $${priceData.usdPrice}`);
            } else {
              console.log(`✗ No usdPrice in response for ${symbol}`);
            }
          } else {
            const errorText = await response.text();
            console.error(`Moralis API error for ${symbol} (${chain}):`, response.status, errorText);
          }
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 150));
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error);
        }
      }

      console.log(`✓ Token prices fetched: ${Object.keys(result).length} of ${tokens.length} tokens`);
      return result;
    },
    enabled: tokens.length > 0,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
};

export type { TokenPrice, TokenInfo };
