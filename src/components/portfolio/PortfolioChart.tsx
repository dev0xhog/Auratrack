import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Token } from "@/hooks/usePortfolioBalances";

interface PortfolioChartProps {
  tokens: Token[];
}

export const PortfolioChart = ({ tokens }: PortfolioChartProps) => {
  // Aggregate by symbol and calculate total value
  const chartData = tokens.reduce((acc, token) => {
    const existing = acc.find((item) => item.name === token.symbol);
    if (existing) {
      existing.value += token.balanceUSD;
    } else {
      acc.push({
        name: token.symbol,
        value: token.balanceUSD,
      });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  // Sort by value and take top 5
  const topTokens = chartData
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const totalValue = topTokens.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Composition</CardTitle>
      </CardHeader>
      <CardContent>
        {topTokens.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No token data available
          </div>
        ) : (
          <>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topTokens}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {topTokens.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {topTokens.map((token, index) => {
                const percentage = ((token.value / totalValue) * 100).toFixed(1);
                return (
                  <div key={token.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{token.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{percentage}%</span>
                      <span className="font-semibold">${token.value.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
