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
        // Map common symbols to CoinGecko coin IDs
        const coinIdMap: { [symbol: string]: string } = {
          'ETH': 'ethereum',
          'BTC': 'bitcoin',
          'USDT': 'tether',
          'USDC': 'usd-coin',
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
          'DAI': 'dai',
          'WETH': 'weth',
          'WBTC': 'wrapped-bitcoin',
          'LINK': 'chainlink',
          'UNI': 'uniswap',
          'AAVE': 'aave',
          'SUSHI': 'sushi',
          'CRV': 'curve-dao-token',
          'MKR': 'maker',
          'SNX': 'havven',
          'COMP': 'compound-governance-token',
          'YFI': 'yearn-finance',
          'BAL': 'balancer',
          'GRT': 'the-graph',
          'LDO': 'lido-dao',
          'APE': 'apecoin',
          'SAND': 'the-sandbox',
          'MANA': 'decentraland',
          'AXS': 'axie-infinity',
          'SHIB': 'shiba-inu',
          'DOGE': 'dogecoin',
          'DOT': 'polkadot',
          'SOL': 'solana',
          'ADA': 'cardano',
          'XRP': 'ripple',
          'LTC': 'litecoin',
          'ATOM': 'cosmos',
          'NEAR': 'near',
          'ARB': 'arbitrum',
          'OP': 'optimism',
        };

        // Build list of coin IDs to fetch
        const coinIds = uniqueSymbols
          .map(symbol => coinIdMap[symbol])
          .filter(id => id !== undefined);

        if (coinIds.length > 0) {
          // Fetch prices in batches (CoinGecko allows up to 250 at once)
          const batchSize = 250;
          for (let i = 0; i < coinIds.length; i += batchSize) {
            const batch = coinIds.slice(i, i + batchSize);
            const idsParam = batch.join(',');
            
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
              
              // Map response back to symbols
              Object.entries(coinIdMap).forEach(([symbol, coinId]) => {
                if (uniqueSymbols.includes(symbol) && data[coinId] && data[coinId].usd) {
                  result[symbol] = {
                    id: coinId,
                    symbol: symbol,
                    name: symbol,
                    current_price: data[coinId].usd,
                    price_change_percentage_24h: data[coinId].usd_24h_change || 0,
                  };
                }
              });
            }

            // Add small delay between batches to respect rate limits
            if (i + batchSize < coinIds.length) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        }
        
        console.log('Token prices fetched from CoinGecko:', Object.keys(result).length, 'of', uniqueSymbols.length, 'tokens');
      } catch (error) {
        console.error("Token price fetch error:", error);
      }

      return result;
    },
    enabled: tokens.length > 0,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
};

export type { TokenPrice, TokenInfo };
