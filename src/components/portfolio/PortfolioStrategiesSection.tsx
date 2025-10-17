import { usePortfolioStrategies } from "@/hooks/usePortfolioStrategies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, AlertCircle, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PortfolioStrategiesSectionProps {
  address?: string;
}

export const PortfolioStrategiesSection = ({ address }: PortfolioStrategiesSectionProps) => {
  const { data, isLoading, error } = usePortfolioStrategies(address);
  const [loadingStep, setLoadingStep] = useState(0);

  // Strategies are already flattened by the hook
  const strategies = data?.strategies || [];

  // Shortened address for display
  const shortenedAddress = address 
    ? `${address.slice(0, 5)}...${address.slice(-3)}` 
    : "0x0ed...413";

  const loadingSteps = [
    `Start processing ${shortenedAddress}...`,
    "Analyzing portfolio...",
    "Checking risk factors...",
    "Looking for suitable dApps or platforms...",
    "Assessing best strategies...",
    "Processing, please wait..."
  ];

  // Cycle through loading steps
  useEffect(() => {
    if (isLoading) {
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoading, loadingSteps.length]);

  // Loading state with step-by-step messages
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-card border-border">
          <CardContent className="p-8">
            <div className="space-y-4">
              {loadingSteps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 transition-all duration-300 ${
                    index <= loadingStep 
                      ? "opacity-100 text-foreground" 
                      : "opacity-30 text-muted-foreground"
                  }`}
                >
                  {index === loadingStep ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : index < loadingStep ? (
                    <Sparkles className="h-4 w-4 text-success" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted" />
                  )}
                  <span className="text-sm font-medium">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
                {strategy.actions?.map((action, actionIdx) => {
                  // Normalize tokens and networks to arrays
                  const tokens = Array.isArray(action.tokens) 
                    ? action.tokens 
                    : typeof action.tokens === 'string' 
                    ? [action.tokens] 
                    : [];
                  
                  const networks = Array.isArray(action.networks) 
                    ? action.networks 
                    : typeof action.networks === 'string' 
                    ? [action.networks] 
                    : [];
                  
                  return (
                    <div
                      key={actionIdx}
                      className="bg-secondary rounded-lg p-4 border border-border space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-foreground">
                            {tokens.join(", ")}
                          </span>
                          {action.operation && (
                            <div className="mt-2">
                              <Badge variant="default" className="text-xs font-medium">
                                Operation: {action.operation}
                              </Badge>
                            </div>
                          )}
                        </div>
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
                        Networks: {networks.join(", ")}
                      </p>
                    </div>
                  );
                })}
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
