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

// Map network names to Moralis chain IDs
const networkToMoralisChain: { [key: string]: string } = {
  'ethereum': '0x1',
  'polygon': '0x89',
  'bsc': '0x38',
  'binance': '0x38',
  'avalanche': '0xa86a',
  'arbitrum': '0xa4b1',
  'optimism': '0xa',
  'op mainnet': '0xa',
  'base': '0x2105',
  'fantom': '0xfa',
  'mantle': '0x1388',
  'linea': '0xe708',
};

export const useTokenPrices = (tokens: TokenInfo[]) => {
  return useQuery<{ [symbol: string]: TokenPrice }>({
    queryKey: ["token-prices", JSON.stringify(tokens.map(t => ({ s: t.symbol, a: t.address, n: t.network })))],
    queryFn: async () => {
      if (!tokens || tokens.length === 0) return {};

      const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYxYjUxMzI5LTRiOGUtNDg0Mi04MDRiLTFiMDYwYjAxOTBmYyIsIm9yZ0lkIjoiNDc0NzMxIiwidXNlcklkIjoiNDg4Mzc2IiwidHlwZUlkIjoiMjU4NjVkNGItMDQzYi00MjQ4LThmNGEtMzUxNzIxOTlkNjM1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk5MDQxOTYsImV4cCI6NDkxNTY2NDE5Nn0.e9nc8F3W4pCQCw-25-dRuam_IQsiEjd6ENEm9PLYjzQ";
      const result: { [symbol: string]: TokenPrice } = {};

      // Group tokens by network
      const tokensByNetwork: { [network: string]: TokenInfo[] } = {};
      tokens.forEach(token => {
        const network = (token.network || '').toLowerCase();
        if (!tokensByNetwork[network]) {
          tokensByNetwork[network] = [];
        }
        tokensByNetwork[network].push(token);
      });

      // Fetch prices for each network
      for (const [network, networkTokens] of Object.entries(tokensByNetwork)) {
        const chainId = Object.entries(networkToMoralisChain).find(([key]) => 
          network.includes(key)
        )?.[1];

        if (!chainId) {
          console.log(`No Moralis chain ID found for network: ${network}`);
          continue;
        }

        // Process tokens in batches (Moralis supports multiple addresses)
        const batchSize = 25;
        for (let i = 0; i < networkTokens.length; i += batchSize) {
          const batch = networkTokens.slice(i, i + batchSize);
          
          // Separate native tokens and ERC-20 tokens
          const nativeToken = batch.find(t => !t.address || t.address === '0x0000000000000000000000000000000000000000');
          const erc20Tokens = batch.filter(t => t.address && t.address !== '0x0000000000000000000000000000000000000000');

          // Fetch native token price if present
          if (nativeToken) {
            try {
              const response = await fetch(
                `https://deep-index.moralis.io/api/v2.2/erc20/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE/price?chain=${chainId}`,
                {
                  headers: {
                    "X-API-Key": apiKey,
                  },
                }
              );

              if (response.ok) {
                const data = await response.json();
                result[nativeToken.symbol.toUpperCase()] = {
                  id: 'native',
                  symbol: nativeToken.symbol.toUpperCase(),
                  name: nativeToken.symbol,
                  current_price: data.usdPrice || 0,
                  price_change_percentage_24h: data.usdPriceFormatted ? parseFloat(data['24hrPercentChange'] || '0') : 0,
                };
              }
            } catch (error) {
              console.error(`Moralis native token price error for ${network}:`, error);
            }
          }

          // Fetch ERC-20 token prices
          if (erc20Tokens.length > 0) {
            const addresses = erc20Tokens.map(t => t.address).filter(Boolean).join(',');
            
            try {
              const response = await fetch(
                `https://deep-index.moralis.io/api/v2.2/erc20/prices?chain=${chainId}&include=percent_change`,
                {
                  method: 'POST',
                  headers: {
                    "X-API-Key": apiKey,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    tokens: erc20Tokens.map(t => ({ token_address: t.address }))
                  })
                }
              );

              if (response.ok) {
                const data = await response.json();
                
                // Map response back to token symbols
                erc20Tokens.forEach(token => {
                  const priceData = data.find((d: any) => 
                    d.tokenAddress?.toLowerCase() === token.address?.toLowerCase()
                  );
                  
                  if (priceData) {
                    result[token.symbol.toUpperCase()] = {
                      id: token.address?.toLowerCase() || '',
                      symbol: token.symbol.toUpperCase(),
                      name: priceData.tokenName || token.symbol,
                      current_price: priceData.usdPrice || 0,
                      price_change_percentage_24h: parseFloat(priceData['24hrPercentChange'] || '0'),
                    };
                  }
                });
              }
            } catch (error) {
              console.error(`Moralis ERC-20 token prices error for ${network}:`, error);
            }
          }
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
