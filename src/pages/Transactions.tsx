import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpRight, ExternalLink } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useTransactions } from "@/hooks/useTransactions";
import { Skeleton } from "@/components/ui/skeleton";

const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const walletAddress = searchParams.get("address") || undefined;
  const { data: transactions, isLoading, error } = useTransactions(walletAddress);

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString();
  };

  const formatValue = (value: string) => {
    const eth = parseFloat(value) / 1e18;
    return eth.toFixed(6);
  };

  const filteredTransactions = transactions?.filter((tx) =>
    tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.from.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {!walletAddress ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No wallet address provided</p>
        </Card>
      ) : isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-12 text-center border-destructive">
          <p className="text-destructive">Failed to load transactions. Please try again.</p>
        </Card>
      ) : !filteredTransactions || filteredTransactions.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No transactions found for this wallet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((tx) => (
            <Card
              key={tx.hash}
              className="gradient-card border-border/40 p-6 transition-smooth hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full p-3 bg-primary/10">
                    <ArrowUpRight className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">
                        {tx.isError === "0" ? "Success" : "Failed"}
                      </Badge>
                      <span className="font-semibold">ETH</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(tx.timeStamp)} • Ethereum
                    </p>
                    <a
                      href={`https://etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">
                    {tx.from.toLowerCase() === walletAddress?.toLowerCase() ? "-" : "+"}
                    {formatValue(tx.value)}
                  </p>
                  <p className="text-sm text-muted-foreground">ETH</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Transactions;
