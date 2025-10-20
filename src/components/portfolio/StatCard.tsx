import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatUSD, formatPercentage } from "@/lib/formatters";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  trend?: number;
  trendPercentage?: number;
}

export const StatCard = ({ title, value, change, icon: Icon, trend, trendPercentage }: StatCardProps) => {
  const isPositive = trendPercentage && trendPercentage > 0;
  const isNegative = trendPercentage && trendPercentage < 0;

  return (
    <Card className="p-6 transition-smooth hover:border-primary/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">{value}</h3>
            {trendPercentage !== undefined && (
              <span
                className={`text-base font-semibold ${
                  isPositive
                    ? "text-green-600 dark:text-green-500"
                    : isNegative
                      ? "text-red-600 dark:text-red-500"
                      : "text-muted-foreground"
                }`}
              >
                {formatPercentage(trendPercentage)}
              </span>
            )}
          </div>
          {change && <p className="mt-1 text-sm font-medium text-muted-foreground">{change}</p>}
        </div>
        <div className="rounded-lg bg-muted p-3">
          <Icon className="h-6 w-6 text-foreground" />
        </div>
      </div>
    </Card>
  );
};
