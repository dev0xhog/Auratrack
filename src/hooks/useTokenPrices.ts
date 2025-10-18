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

      // Map chain names to Moralis chain identifiers
      const chainMap: { [key: string]: string } = {
        'ethereum': '0x1',
        'eth': '0x1',
        'polygon': '0x89',
        'bsc': '0x38',
        'avalanche': '0xa86a',
        'fantom': '0xfa',
        'arbitrum': '0xa4b1',
        'optimism': '0xa',
        'base': '0x2105',
        'linea': '0xe708',
      };

      // Process each token
      for (const token of tokens) {
        const symbol = token.symbol.toUpperCase();
        
        // Skip if we already have this price
        if (result[symbol]) continue;

        try {
          // For ERC20 tokens with address
          if (token.address && token.network) {
            const chain = chainMap[token.network.toLowerCase()] || '0x1';
            
            const response = await fetch(
              `https://deep-index.moralis.io/api/v2.2/erc20/${token.address}/price?chain=${chain}`,
              {
                headers: {
                  "X-API-Key": apiKey,
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data.usdPrice) {
                result[symbol] = {
                  id: token.address,
                  symbol: symbol,
                  name: data.tokenName || symbol,
                  current_price: parseFloat(data.usdPrice),
                  price_change_percentage_24h: parseFloat(data.usdPriceFormatted || '0'),
                  logo: data.tokenLogo,
                };
                console.log(`Fetched price for ${symbol}:`, data.usdPrice);
              }
            }
            
            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error);
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
