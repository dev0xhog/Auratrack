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

      // Group tokens by chain for batch processing
      const tokensByChain: { [chain: string]: typeof tokens } = {};
      
      tokens.forEach(token => {
        if (token.address && token.network) {
          const chain = token.network.toLowerCase();
          if (!tokensByChain[chain]) {
            tokensByChain[chain] = [];
          }
          tokensByChain[chain].push(token);
        }
      });

      // Process each chain's tokens using batch endpoint
      for (const [chain, chainTokens] of Object.entries(tokensByChain)) {
        try {
          // Prepare token addresses for batch request
          const tokenAddresses = chainTokens.map(t => ({ token_address: t.address }));
          
          const response = await fetch(
            `https://deep-index.moralis.io/api/v2.2/erc20/prices?chain=${chain}`,
            {
              method: 'POST',
              headers: {
                "X-API-Key": apiKey,
                "Content-Type": "application/json",
                "Accept": "application/json",
              },
              body: JSON.stringify({ tokens: tokenAddresses }),
            }
          );

          if (response.ok) {
            const prices = await response.json();
            
            // Map prices back to tokens
            if (Array.isArray(prices)) {
              prices.forEach((priceData: any, index: number) => {
                const token = chainTokens[index];
                if (token && priceData.usdPrice) {
                  const symbol = token.symbol.toUpperCase();
                  result[symbol] = {
                    id: token.address || symbol.toLowerCase(),
                    symbol: symbol,
                    name: priceData.tokenName || symbol,
                    current_price: parseFloat(priceData.usdPrice),
                    price_change_percentage_24h: parseFloat(priceData['24hrPercentChange'] || '0'),
                    logo: priceData.tokenLogo,
                  };
                  console.log(`Fetched price for ${symbol} on ${chain}:`, priceData.usdPrice);
                }
              });
            }
          } else {
            console.error(`Moralis price API error for ${chain}:`, response.status, await response.text());
          }
          
          // Small delay between chain batches
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error fetching prices for ${chain}:`, error);
        }
      }

      console.log('Token prices fetched via Moralis:', Object.keys(result).length, 'of', tokens.length, 'tokens');
      return result;
    },
    enabled: tokens.length > 0,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
};

export type { TokenPrice, TokenInfo };
