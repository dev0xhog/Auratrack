import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Shield, Zap, ExternalLink, Target } from "lucide-react";
import { usePortfolioStrategies } from "@/hooks/usePortfolioStrategies";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "react-router-dom";

const Strategies = () => {
  const [searchParams] = useSearchParams();
  const walletAddress = searchParams.get("address") || undefined;
  const { data, isLoading, error } = usePortfolioStrategies(walletAddress);

  console.log("Strategies Debug:", { walletAddress, data, isLoading, error });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">AI Strategies</h1>
        <p className="text-muted-foreground">
          Personalized DeFi strategies based on your portfolio
        </p>
      </div>

      {!walletAddress ? (
        <Card className="p-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Wallet Connected</h3>
          <p className="text-muted-foreground">
            Enter a wallet address to view AI-generated strategies
          </p>
        </Card>
      ) : isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-32 w-full" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-12 text-center border-destructive">
          <p className="text-destructive mb-4">
            Failed to load strategies. The API might be temporarily unavailable.
          </p>
          <p className="text-sm text-muted-foreground">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </Card>
      ) : !data?.strategies || data.strategies.length === 0 ? (
        <Card className="p-12 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Strategies Available</h3>
          <p className="text-muted-foreground">
            {data?.portfolio && data.portfolio.length > 0
              ? "We couldn't generate any optimization strategies for this portfolio at the moment."
              : "Connect a wallet or search an address to view portfolio strategies."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(data?.strategies ?? []).map((strategy, index) => (
            <Card
              key={index}
              className="p-6 transition-smooth hover:border-primary/40"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{strategy.name}</h3>
                </div>
                <div className="rounded-lg bg-primary/10 p-2">
                  {strategy.risk === "Low" ? (
                    <Shield className="h-5 w-5 text-success" />
                  ) : strategy.risk === "High" ? (
                    <Zap className="h-5 w-5 text-destructive" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline">
                  Risk: {strategy.risk}
                </Badge>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Actions:</h4>
                {(strategy.actions ?? []).map((action, actionIndex) => (
                  <div key={actionIndex} className="rounded-lg bg-secondary p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold">
                        {action.tokens.join(", ")}
                      </span>
                      <Badge variant="secondary">{action.operation}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{action.description}</p>
                    {action.apy && (
                      <div className="flex items-center gap-1 mb-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-sm font-semibold text-success">
                          APY: {action.apy}%
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {(action.platforms ?? []).map((platform, platformIndex) => (
                        <Button
                          key={platformIndex}
                          variant="ghost"
                          size="sm"
                          className="h-auto py-1 px-2"
                          asChild
                        >
                          <a
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <span className="text-xs">{platform.name}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Networks: {action.networks.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Strategies;
