import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/portfolio/StatCard";
import { TokenTable } from "@/components/portfolio/TokenTable";
import { PortfolioChart } from "@/components/portfolio/PortfolioChart";
import { Wallet, TrendingUp, PieChart, DollarSign } from "lucide-react";
import { usePortfolioBalances } from "@/hooks/usePortfolioBalances";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "react-router-dom";

const Portfolio = () => {
  const [searchParams] = useSearchParams();
  const walletAddress = searchParams.get("address") || undefined;
  const { data, isLoading, error } = usePortfolioBalances(walletAddress);

  // Calculate total portfolio value
  const totalValue = data?.portfolio.reduce(
    (sum, item) => sum + item.tokens.reduce((tokenSum, token) => tokenSum + token.balanceUSD, 0),
    0
  ) || 0;

  // Count total tokens
  const totalAssets = data?.portfolio.reduce((count, item) => count + item.tokens.length, 0) || 0;

  // Get network balances for top section
  const networkBalances = data?.portfolio.map((item) => ({
    network: item.network.name,
    balance: item.tokens.reduce((sum, token) => sum + token.balanceUSD, 0),
    icon: item.network.iconUrls[0],
  })) || [];

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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {networkBalances.map((network) => (
                <Card key={network.network} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {network.icon && (
                      <img src={network.icon} alt={network.network} className="h-5 w-5" />
                    )}
                    <p className="text-sm font-medium">{network.network}</p>
                  </div>
                  <p className="text-lg font-bold">${network.balance.toFixed(2)}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Portfolio Value"
              value={`$${totalValue.toFixed(2)}`}
              icon={DollarSign}
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
              <TokenTable tokens={data?.portfolio.flatMap(p => p.tokens) || []} />
            </div>
            <div className="lg:col-span-1">
              <PortfolioChart tokens={data?.portfolio.flatMap(p => p.tokens) || []} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Portfolio;
