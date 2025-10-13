import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpRight, ArrowDownLeft, ExternalLink, Filter } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useMoralisTransactionsByChain } from "@/hooks/useMoralisTransactionsByChain";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatUSD } from "@/lib/formatters";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { NetworkIcon } from "@/components/transactions/NetworkIcon";

const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hideUnknownTokens, setHideUnknownTokens] = useState(false);
  const [hideLowValue, setHideLowValue] = useState(false);
  const [searchParams] = useSearchParams();
  const walletAddress = searchParams.get("address") || undefined;
  
  // Moralis for multi-chain transactions
  const { data: txsByChain, isLoading, error } = useMoralisTransactionsByChain(walletAddress);
  
  // Flatten all transactions from all chains
  const allTransactions = useMemo(() => {
    if (!txsByChain) return [];
    return Object.values(txsByChain).flat();
  }, [txsByChain]);

  // Get unique token infos for price fetching
  const tokenInfos = useMemo(() => {
    const chains = Object.keys(txsByChain || {});
    return [...new Set(chains.map(chain => {
      if (chain === "eth") return JSON.stringify({ symbol: "ETH", network: "ethereum" });
      if (chain === "polygon") return JSON.stringify({ symbol: "MATIC", network: "polygon" });
      if (chain === "bsc") return JSON.stringify({ symbol: "BNB", network: "bsc" });
      if (chain === "avalanche") return JSON.stringify({ symbol: "AVAX", network: "avalanche" });
      if (chain === "fantom") return JSON.stringify({ symbol: "FTM", network: "fantom" });
      if (chain === "arbitrum") return JSON.stringify({ symbol: "ETH", network: "arbitrum" });
      if (chain === "optimism") return JSON.stringify({ symbol: "ETH", network: "optimism" });
      if (chain === "base") return JSON.stringify({ symbol: "ETH", network: "base" });
      return JSON.stringify({ symbol: "ETH", network: "ethereum" });
    }))].map(str => JSON.parse(str));
  }, [txsByChain]);

  const { data: tokenPrices } = useTokenPrices(tokenInfos);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getChainSymbol = (chain: string) => {
    if (chain === "eth") return "ETH";
    if (chain === "polygon") return "MATIC";
    if (chain === "bsc") return "BNB";
    if (chain === "avalanche") return "AVAX";
    if (chain === "fantom") return "FTM";
    if (chain === "arbitrum") return "ETH";
    if (chain === "optimism") return "ETH";
    if (chain === "base") return "ETH";
    return "ETH";
  };

  const getChainName = (chain: string) => {
    if (chain === "eth") return "Ethereum";
    if (chain === "polygon") return "Polygon";
    if (chain === "bsc") return "BSC";
    if (chain === "avalanche") return "Avalanche";
    if (chain === "fantom") return "Fantom";
    if (chain === "arbitrum") return "Arbitrum";
    if (chain === "optimism") return "Optimism";
    if (chain === "base") return "Base";
    return chain;
  };

  const getExplorerUrl = (chain: string, hash: string) => {
    if (chain === "eth") return `https://etherscan.io/tx/${hash}`;
    if (chain === "polygon") return `https://polygonscan.com/tx/${hash}`;
    if (chain === "bsc") return `https://bscscan.com/tx/${hash}`;
    if (chain === "avalanche") return `https://snowtrace.io/tx/${hash}`;
    if (chain === "fantom") return `https://ftmscan.com/tx/${hash}`;
    if (chain === "arbitrum") return `https://arbiscan.io/tx/${hash}`;
    if (chain === "optimism") return `https://optimistic.etherscan.io/tx/${hash}`;
    if (chain === "base") return `https://basescan.org/tx/${hash}`;
    return `https://etherscan.io/tx/${hash}`;
  };

  const formatValue = (value: string, chain: string) => {
    const amount = parseFloat(value) / 1e18;
    const symbol = getChainSymbol(chain);
    const price = tokenPrices?.[symbol]?.current_price || 0;
    const usdValue = amount * price;
    return { amount, usdValue, symbol };
  };

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((tx) =>
        tx.hash.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Hide unknown tokens (value = 0)
    if (hideUnknownTokens) {
      filtered = filtered.filter((tx) => parseFloat(tx.value) > 0);
    }

    // Hide low value transactions
    if (hideLowValue) {
      filtered = filtered.filter((tx) => {
        const { usdValue } = formatValue(tx.value, tx.chain);
        return usdValue >= 0.1;
      });
    }

    return filtered;
  }, [allTransactions, searchQuery, hideUnknownTokens, hideLowValue, tokenPrices]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [date: string]: typeof filteredTransactions } = {};
    
    filteredTransactions.forEach((tx) => {
      const date = new Date(tx.block_timestamp);
      const dateKey = date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(tx);
    });

    return groups;
  }, [filteredTransactions]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Transactions</h1>
        <p className="text-muted-foreground">View all your on-chain activity</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass border-border/40"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={hideUnknownTokens ? "default" : "outline"}
            onClick={() => setHideUnknownTokens(!hideUnknownTokens)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Hide Unknown Tokens
          </Button>
          <Button
            variant={hideLowValue ? "default" : "outline"}
            onClick={() => setHideLowValue(!hideLowValue)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Hide TXs &lt;$0.1
          </Button>
        </div>
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
          <p className="text-destructive mb-4">
            Failed to load transactions. Please check your connection and try again.
          </p>
          <p className="text-xs text-muted-foreground">
            Note: Transactions are fetched from 8 networks: Ethereum, Polygon, BSC, Avalanche, Fantom, Arbitrum, Optimism, and Base
          </p>
        </Card>
      ) : Object.keys(groupedTransactions).length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-2">No transactions found.</p>
          <p className="text-xs text-muted-foreground">
            Checked across 8 networks: Ethereum, Polygon, BSC, Avalanche, Fantom, Arbitrum, Optimism, and Base
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTransactions).map(([date, txs]) => (
            <div key={date} className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground">{date}</h2>
              {txs.map((tx) => {
                const isSent = tx.from_address.toLowerCase() === walletAddress?.toLowerCase();
                const { amount, usdValue, symbol } = formatValue(tx.value, tx.chain);
                
                return (
                  <Card
                    key={tx.hash}
                    className="gradient-card border-border/40 p-6 transition-smooth hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Transaction direction icon */}
                        <div className={`rounded-full p-3 ${isSent ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                          {isSent ? (
                            <ArrowDownLeft className="h-5 w-5 text-red-500" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-base">
                              {isSent ? "Sent" : "Received"}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {tx.receipt_status === "1" ? "Success" : "Failed"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            {/* Network icon and name */}
                            <div className="flex items-center gap-1.5">
                              <NetworkIcon chain={tx.chain} className="h-4 w-4" />
                              <span className="font-medium">{getChainName(tx.chain)}</span>
                            </div>
                            <span>•</span>
                            <span>
                              {new Date(tx.block_timestamp).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          
                          <a
                            href={getExplorerUrl(tx.chain, tx.hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          {/* Token icon */}
                          <NetworkIcon chain={tx.chain} className="h-5 w-5" />
                          <p className={`text-xl font-bold ${isSent ? 'text-red-500' : 'text-green-500'}`}>
                            {isSent ? "-" : "+"}
                            {formatNumber(amount, 6)}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {symbol}
                        </p>
                        <p className="text-sm text-foreground/70">
                          {formatUSD(usdValue)}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Transactions;
