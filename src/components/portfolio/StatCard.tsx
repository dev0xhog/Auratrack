import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down";
}

export const StatCard = ({ title, value, change, icon: Icon, trend }: StatCardProps) => {
  return (
    <Card className="p-6 transition-smooth hover:border-primary/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-bold">{value}</h3>
          {change && (
            <p
              className={`mt-1 text-sm font-medium ${
                trend === "up" ? "text-success" : "text-destructive"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-muted p-3">
          <Icon className="h-6 w-6 text-foreground" />
        </div>
      </div>
    </Card>
  );
};
