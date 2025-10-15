import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/portfolio/StatCard";
import { TokenTable } from "@/components/portfolio/TokenTable";
import { PortfolioChart } from "@/components/portfolio/PortfolioChart";
import { Wallet, TrendingUp, PieChart, DollarSign } from "lucide-react";
import { usePortfolioBalances } from "@/hooks/usePortfolioBalances";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "react-router-dom";
import { formatUSD } from "@/lib/formatters";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

const Portfolio = () => {
  const [searchParams] = useSearchParams();
  const walletAddress = searchParams.get("address") || undefined;
  const { data, isLoading, error } = usePortfolioBalances(walletAddress);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);

  // Prepare tokens for price fetching
  const allTokens = useMemo(() => 
    data?.portfolio.flatMap(p => p.tokens) || [], 
    [data]
  );

  const tokenInfos = useMemo(() => 
    allTokens.map(token => ({
      symbol: token.symbol,
      address: token.address,
      network: token.network,
      balance: token.balance,
      balanceUSD: token.balanceUSD
    })),
    [allTokens]
  );

  const { data: priceData } = useTokenPrices(tokenInfos);

  // Calculate total portfolio value
  const totalValue = data?.portfolio.reduce(
    (sum, item) => sum + item.tokens.reduce((tokenSum, token) => tokenSum + token.balanceUSD, 0),
    0
  ) || 0;

  // Calculate 24hr change for total portfolio
  const portfolio24hrChange = useMemo(() => {
    if (!priceData || !allTokens.length) return { change: 0, changePercent: 0 };

    let totalChange = 0;
    allTokens.forEach(token => {
      const tokenPrice = priceData[token.symbol.toUpperCase()];
      if (tokenPrice && tokenPrice.price_change_percentage_24h) {
        // Calculate what this token was worth 24h ago
        const currentValue = token.balanceUSD;
        const priceChange = tokenPrice.price_change_percentage_24h;
        // value24hAgo = currentValue / (1 + priceChange/100)
        const value24hAgo = currentValue / (1 + priceChange / 100);
        totalChange += (currentValue - value24hAgo);
      }
    });

    const changePercent = totalValue > 0 ? (totalChange / totalValue) * 100 : 0;
    return { change: totalChange, changePercent };
  }, [priceData, allTokens, totalValue]);

  // Fetch historical prices for accurate 24hr PnL calculation using CoinGecko
  const { data: historicalPnL, isLoading: isPnLLoading } = useQuery({
    queryKey: ["portfolio-24hr-pnl", walletAddress, totalValue, allTokens.length],
    queryFn: async () => {
      if (!allTokens.length || totalValue === 0) {
        return { change: 0, changePercent: 0 };
      }

      try {
        // Map common symbols to CoinGecko IDs
        const symbolMap: { [key: string]: string } = {
          'ETH': 'ethereum',
          'WETH': 'weth',
          'BTC': 'bitcoin',
          'WBTC': 'wrapped-bitcoin',
          'USDC': 'usd-coin',
          'USDT': 'tether',
          'DAI': 'dai',
          'MATIC': 'matic-network',
          'POL': 'matic-network',
          'AVAX': 'avalanche-2',
          'BNB': 'binancecoin',
          'SOL': 'solana',
          'USDT0': 'tether',
        };

        // Get unique token IDs
        const coinIds = [...new Set(
          allTokens
            .map(t => symbolMap[t.symbol.toUpperCase()])
            .filter(Boolean)
        )].slice(0, 50).join(','); // CoinGecko free tier limit

        if (!coinIds) {
          return { change: 0, changePercent: 0 };
        }

        // Fetch 24hr market data from CoinGecko
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`,
          { headers: { Accept: 'application/json' } }
        );

        if (!response.ok) {
          console.error('CoinGecko API error:', response.status);
          return { change: 0, changePercent: 0 };
        }

        const priceData = await response.json();

        // Calculate portfolio value 24h ago
        let totalValue24hAgo = 0;

        allTokens.forEach(token => {
          const coinId = symbolMap[token.symbol.toUpperCase()];
          
          if (coinId && priceData[coinId]?.usd_24h_change !== undefined) {
            const changePercent = priceData[coinId].usd_24h_change;
            const value24hAgo = token.balanceUSD / (1 + changePercent / 100);
            totalValue24hAgo += value24hAgo;
          } else {
            // For unmapped tokens, assume no change
            totalValue24hAgo += token.balanceUSD;
          }
        });

        const change = totalValue - totalValue24hAgo;
        const changePercent = totalValue24hAgo > 0 ? (change / totalValue24hAgo) * 100 : 0;

        console.log('24hr PnL:', { change, changePercent });

        return { change, changePercent };
      } catch (error) {
        console.error('Error calculating 24hr PnL:', error);
        return { change: 0, changePercent: 0 };
      }
    },
    enabled: !!walletAddress && allTokens.length > 0 && totalValue > 0,
    staleTime: 60000,
    retry: 2,
  });

  // Count total tokens
  const totalAssets = data?.portfolio.reduce((count, item) => count + item.tokens.length, 0) || 0;

  // Get network balances for top section, sorted by USD value
  const networkBalances = (data?.portfolio.map((item) => ({
    network: item.network.name,
    balance: item.tokens.reduce((sum, token) => sum + token.balanceUSD, 0),
    icon: item.network.iconUrls[0],
  })) || []).sort((a, b) => b.balance - a.balance);

  // Filter tokens by selected network and add network name to each token
  const filteredTokens = selectedNetwork
    ? (data?.portfolio.find((p) => p.network.name === selectedNetwork)?.tokens.map(token => ({
        ...token,
        network: data.portfolio.find((p) => p.network.name === selectedNetwork)!.network.name
      })) || [])
    : (data?.portfolio.flatMap((p) => 
        p.tokens.map(token => ({
          ...token,
          network: p.network.name
        }))
      ) || []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Portfolio Overview</h1>
        <p className="text-muted-foreground">
          Track your crypto holdings across multiple chains
        </p>
      </div>

      {!walletAddress ? (
        <Card className="p-12 text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Wallet Connected</h3>
          <p className="text-muted-foreground">
            Enter a wallet address to view portfolio details
          </p>
        </Card>
      ) : isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-16" />
              </Card>
            ))}
          </div>
        </div>
      ) : error ? (
        <Card className="p-12 text-center border-destructive">
          <p className="text-destructive">Failed to load portfolio data. Please try again.</p>
        </Card>
      ) : (
        <>
          {/* Network Balances */}
          {networkBalances.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Networks</h2>
                {selectedNetwork && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNetwork(null)}
                  >
                    Clear filter
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {networkBalances.map((network) => (
                  <Card
                    key={network.network}
                    className={`p-4 cursor-pointer transition-smooth hover:border-primary/40 ${
                      selectedNetwork === network.network ? "border-primary" : ""
                    }`}
                    onClick={() =>
                      setSelectedNetwork(
                        selectedNetwork === network.network ? null : network.network
                      )
                    }
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {network.icon && (
                        <img src={network.icon} alt={network.network} className="h-5 w-5" />
                      )}
                      <p className="text-sm font-medium">{network.network}</p>
                    </div>
                    <p className="text-lg font-bold">{formatUSD(network.balance)}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Portfolio Value"
              value={formatUSD(totalValue)}
              icon={DollarSign}
              trend={historicalPnL?.change || 0}
              trendPercentage={historicalPnL?.changePercent || 0}
            />
            <StatCard
              title="Total Assets"
              value={totalAssets.toString()}
              icon={Wallet}
            />
            <StatCard
              title="Networks"
              value={data?.portfolio.length.toString() || "0"}
              icon={TrendingUp}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TokenTable tokens={filteredTokens} />
            </div>
            <div className="lg:col-span-1">
              <PortfolioChart tokens={filteredTokens} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Portfolio;
