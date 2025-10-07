import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, Zap } from "lucide-react";

const mockStrategies = [
  {
    id: "1",
    name: "Yield Optimization",
    risk: "Low",
    apy: "8.5%",
    description: "Optimize your stablecoin holdings across multiple DeFi protocols",
    actions: [
      {
        token: "USDC",
        platform: "Aave",
        operation: "Supply",
        description: "Supply USDC to Aave on Ethereum for stable yield",
      },
    ],
  },
  {
    id: "2",
    name: "ETH Staking",
    risk: "Medium",
    apy: "4.2%",
    description: "Stake your ETH through liquid staking providers",
    actions: [
      {
        token: "ETH",
        platform: "Lido",
        operation: "Stake",
        description: "Stake ETH and receive stETH for liquidity",
      },
    ],
  },
];

const Strategies = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">AI Strategies</h1>
        <p className="text-muted-foreground">
          Personalized DeFi strategies based on your portfolio
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockStrategies.map((strategy) => (
          <Card
            key={strategy.id}
            className="gradient-card border-border/40 p-6 transition-smooth hover:border-primary/40"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{strategy.name}</h3>
                <p className="text-sm text-muted-foreground">{strategy.description}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2">
                {strategy.risk === "Low" ? (
                  <Shield className="h-5 w-5 text-success" />
                ) : (
                  <Zap className="h-5 w-5 text-primary" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <Badge variant="outline" className="border-primary/40 text-primary">
                Risk: {strategy.risk}
              </Badge>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm font-semibold text-success">APY: {strategy.apy}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">Actions:</h4>
              {strategy.actions.map((action, index) => (
                <div key={index} className="rounded-lg bg-background/50 p-3 border border-border/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{action.token}</span>
                    <Badge variant="secondary">{action.operation}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{action.description}</p>
                  <p className="text-xs text-primary">Platform: {action.platform}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Strategies;
