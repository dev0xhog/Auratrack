import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpRight, ArrowDownLeft, ExternalLink } from "lucide-react";

const mockTransactions = [
  {
    id: "1",
    type: "send",
    token: "ETH",
    amount: "0.5",
    usd: "$1,234.50",
    date: "2024-01-15",
    hash: "0x1234...5678",
    chain: "Ethereum",
  },
  {
    id: "2",
    type: "receive",
    token: "USDC",
    amount: "1,000",
    usd: "$1,000.00",
    date: "2024-01-14",
    hash: "0xabcd...efgh",
    chain: "Ethereum",
  },
];

const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Transactions</h1>
        <p className="text-muted-foreground">View all your on-chain activity</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by token, hash, or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 glass border-border/40"
        />
      </div>

      <div className="space-y-4">
        {mockTransactions.map((tx) => (
          <Card
            key={tx.id}
            className="gradient-card border-border/40 p-6 transition-smooth hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`rounded-full p-3 ${
                    tx.type === "send"
                      ? "bg-destructive/10"
                      : "bg-success/10"
                  }`}
                >
                  {tx.type === "send" ? (
                    <ArrowUpRight
                      className={`h-5 w-5 ${
                        tx.type === "send" ? "text-destructive" : "text-success"
                      }`}
                    />
                  ) : (
                    <ArrowDownLeft className="h-5 w-5 text-success" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="capitalize">
                      {tx.type}
                    </Badge>
                    <span className="font-semibold">{tx.token}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tx.date} • {tx.chain}
                  </p>
                  <a
                    href="#"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    {tx.hash}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">
                  {tx.type === "send" ? "-" : "+"}
                  {tx.amount}
                </p>
                <p className="text-sm text-muted-foreground">{tx.usd}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Transactions;
