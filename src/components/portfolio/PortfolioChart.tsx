import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "ETH", value: 10234, color: "hsl(var(--chart-1))" },
  { name: "USDC", value: 15000, color: "hsl(var(--chart-2))" },
  { name: "MATIC", value: 3420, color: "hsl(var(--chart-3))" },
  { name: "LINK", value: 5680, color: "hsl(var(--chart-4))" },
];

export const PortfolioChart = () => {
  return (
    <div className="rounded-lg border border-border/40 gradient-card p-6">
      <h3 className="text-lg font-semibold mb-4">Portfolio Composition</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        {data.map((token, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: token.color }} />
              <span>{token.name}</span>
            </div>
            <span className="font-semibold">${token.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
