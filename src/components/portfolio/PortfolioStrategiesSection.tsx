import { usePortfolioStrategies } from "@/hooks/usePortfolioStrategies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, AlertCircle, Sparkles, ExternalLink } from "lucide-react";

interface PortfolioStrategiesSectionProps {
  address?: string;
}

export const PortfolioStrategiesSection = ({ address }: PortfolioStrategiesSectionProps) => {
  const { data, isLoading, error } = usePortfolioStrategies(address);

  // Strategies are already normalized by the hook
  const strategies = data?.strategies || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span className="text-sm">Analyzing wallet...</span>
        </div>
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-card border-destructive">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            ⚠️ Failed to load portfolio strategies
          </h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!data || strategies.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No strategies available for this wallet
          </h3>
          <p className="text-sm text-muted-foreground">
            Try a different address or check back later
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return 'bg-success text-success-foreground';
      case 'medium':
        return 'bg-chart-2 text-foreground';
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Section */}
      {data.portfolio && data.portfolio.length > 0 && (
        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground">Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.portfolio.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground capitalize">
                  {item.network.name}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {item.tokens.map((token, tokenIdx) => (
                    <div
                      key={tokenIdx}
                      className="bg-secondary rounded-lg p-3 border border-border"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground">
                          {token.symbol}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {item.network.name}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Balance: {token.balance.toFixed(4)}
                      </p>
                      <p className="text-sm font-medium text-success">
                        ${token.balanceUSD.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Strategy Recommendations Section */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">
          Strategy Recommendations
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {strategies.map((strategy, idx) => (
            <Card
              key={idx}
              className="bg-card border-border shadow-lg transition-smooth hover:border-primary/40"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-foreground">{strategy.name}</CardTitle>
                  <Badge className={getRiskColor(strategy.risk)}>
                    {strategy.risk}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {strategy.actions?.map((action, actionIdx) => (
                  <div
                    key={actionIdx}
                    className="bg-secondary rounded-lg p-4 border border-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">
                        {action.tokens.join(", ")}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {action.operation}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>

                    {action.apy && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-sm font-semibold text-success">
                          APY: {action.apy}
                        </span>
                      </div>
                    )}

                    {action.platforms && action.platforms.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {action.platforms.map((platform, platformIdx) => (
                          <a
                            key={platformIdx}
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 underline transition-smooth"
                          >
                            {platform.name}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Networks: {action.networks.join(", ")}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">
          🔮 Powered by Aura Portfolio Strategies API
        </p>
      </div>
    </div>
  );
};
