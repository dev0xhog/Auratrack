import { Wallet, TrendingUp, Clock, DollarSign } from "lucide-react";
import { StatCard } from "@/components/portfolio/StatCard";
import { TokenTable } from "@/components/portfolio/TokenTable";
import { PortfolioChart } from "@/components/portfolio/PortfolioChart";

const Portfolio = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Portfolio</h1>
        <p className="text-muted-foreground">
          Track your crypto assets across multiple chains
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Portfolio Value"
          value="$34,334.50"
          change="+12.5%"
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          title="24h P&L"
          value="+$1,234.50"
          change="+3.73%"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard title="Total Assets" value="42" icon={Wallet} />
        <StatCard title="Wallet Age" value="365 days" icon={Clock} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TokenTable />
        </div>
        <div className="lg:col-span-1">
          <PortfolioChart />
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
