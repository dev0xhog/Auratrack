import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpRight, ArrowDownLeft, ExternalLink, Filter, Repeat } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useMoralisTransactionsByChain } from "@/hooks/useMoralisTransactionsByChain";
import { useMoralisTokenTransfersByChain } from "@/hooks/useMoralisTokenTransfersByChain";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatUSD } from "@/lib/formatters";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { NetworkIcon } from "@/components/transactions/NetworkIcon";
import { TokenIcon } from "@/components/transactions/TokenIcon";

const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hideUnknownTokens, setHideUnknownTokens] = useState(false);
  const [hideLowValue, setHideLowValue] = useState(false);
  const [searchParams] = useSearchParams();
  const walletAddress = searchParams.get("address") || undefined;
  
  // Fetch both native transactions and token transfers
  const { data: txsByChain, isLoading: txsLoading, error: txsError } = useMoralisTransactionsByChain(walletAddress);
  const { data: transfersByChain, isLoading: transfersLoading, error: transfersError } = useMoralisTokenTransfersByChain(walletAddress);
  
  const isLoading = txsLoading || transfersLoading;
  const error = txsError || transfersError;

  // Unified transaction type
  type UnifiedTransaction = {
    hash: string;
    from_address: string;
    to_address: string;
    value: string;
    block_timestamp: string;
    chain: string;
    receipt_status?: string;
    type: 'native' | 'erc20';
    token_symbol?: string;
    token_logo?: string;
    token_decimals?: string;
    token_address?: string;
  };

  // Merge native transactions and token transfers
  const allTransactions = useMemo(() => {
    const unified: UnifiedTransaction[] = [];
    
    // Add native transactions
    if (txsByChain) {
      Object.entries(txsByChain).forEach(([chain, txs]) => {
        txs.forEach(tx => {
          unified.push({
            hash: tx.hash,
            from_address: tx.from_address,
            to_address: tx.to_address,
            value: tx.value,
            block_timestamp: tx.block_timestamp,
            chain,
            receipt_status: tx.receipt_status,
            type: 'native',
          });
        });
      });
    }
    
    // Add token transfers
    if (transfersByChain) {
      Object.entries(transfersByChain).forEach(([chain, transfers]) => {
        transfers.forEach(transfer => {
          unified.push({
            hash: transfer.transaction_hash,
            from_address: transfer.from_address,
            to_address: transfer.to_address,
            value: transfer.value,
            block_timestamp: transfer.block_timestamp,
            chain,
            type: 'erc20',
            token_symbol: transfer.token_symbol,
            token_logo: transfer.token_logo,
            token_decimals: transfer.token_decimals,
            token_address: transfer.token_address,
          });
        });
      });
    }
    
    // Sort by timestamp (newest first)
    return unified.sort((a, b) => 
      new Date(b.block_timestamp).getTime() - new Date(a.block_timestamp).getTime()
    );
  }, [txsByChain, transfersByChain]);

  // Get unique token infos for price fetching (both native and ERC-20)
  const tokenInfos = useMemo(() => {
    const tokenSet = new Map<string, { symbol: string; address?: string; network?: string }>();
    
    // Add native tokens for each chain
    const chains = Object.keys(txsByChain || {});
    chains.forEach(chain => {
      let key: string;
      let token: { symbol: string; network?: string };
      
      if (chain === "eth") {
        key = "ETH-ethereum";
        token = { symbol: "ETH", network: "ethereum" };
      } else if (chain === "polygon") {
        key = "MATIC-polygon";
        token = { symbol: "MATIC", network: "polygon" };
      } else if (chain === "bsc") {
        key = "BNB-bsc";
        token = { symbol: "BNB", network: "bsc" };
      } else if (chain === "avalanche") {
        key = "AVAX-avalanche";
        token = { symbol: "AVAX", network: "avalanche" };
      } else if (chain === "fantom") {
        key = "FTM-fantom";
        token = { symbol: "FTM", network: "fantom" };
      } else if (chain === "arbitrum") {
        key = "ETH-arbitrum";
        token = { symbol: "ETH", network: "arbitrum" };
      } else if (chain === "optimism") {
        key = "ETH-optimism";
        token = { symbol: "ETH", network: "optimism" };
      } else if (chain === "base") {
        key = "ETH-base";
        token = { symbol: "ETH", network: "base" };
      } else if (chain === "linea") {
        key = "ETH-linea";
        token = { symbol: "ETH", network: "linea" };
      } else if (chain === "scroll") {
        key = "ETH-scroll";
        token = { symbol: "ETH", network: "scroll" };
      } else if (chain === "shape") {
        key = "ETH-shape";
        token = { symbol: "ETH", network: "shape" };
      } else if (chain === "arbitrum-nova") {
        key = "ETH-arbitrum-nova";
        token = { symbol: "ETH", network: "arbitrum-nova" };
      } else {
        key = "ETH-ethereum";
        token = { symbol: "ETH", network: "ethereum" };
      }
      
      tokenSet.set(key, token);
    });
    
    // Add all unique ERC-20 tokens from transactions
    allTransactions.forEach(tx => {
      if (tx.type === 'erc20' && tx.token_address && tx.token_symbol) {
        const key = `${tx.token_symbol}-${tx.token_address}`;
        tokenSet.set(key, {
          symbol: tx.token_symbol,
          address: tx.token_address,
          network: tx.chain,
        });
      }
    });
    
    return Array.from(tokenSet.values());
  }, [txsByChain, allTransactions]);

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
    if (chain === "linea") return "ETH";
    if (chain === "scroll") return "ETH";
    if (chain === "shape") return "ETH";
    if (chain === "arbitrum-nova") return "ETH";
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
    if (chain === "linea") return "Linea";
    if (chain === "scroll") return "Scroll";
    if (chain === "shape") return "Shape";
    if (chain === "arbitrum-nova") return "Arbitrum Nova";
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
    if (chain === "linea") return `https://lineascan.build/tx/${hash}`;
    if (chain === "scroll") return `https://scrollscan.com/tx/${hash}`;
    if (chain === "shape") return `https://shapescan.xyz/tx/${hash}`;
    if (chain === "arbitrum-nova") return `https://nova.arbiscan.io/tx/${hash}`;
    return `https://etherscan.io/tx/${hash}`;
  };

  const formatValue = (tx: UnifiedTransaction) => {
    let amount: number;
    let symbol: string;
    
    if (tx.type === 'erc20') {
      const decimals = parseInt(tx.token_decimals || '18');
      amount = parseFloat(tx.value) / Math.pow(10, decimals);
      symbol = tx.token_symbol || 'Unknown';
    } else {
      amount = parseFloat(tx.value) / 1e18;
      symbol = getChainSymbol(tx.chain);
    }
    
    // Uppercase symbol for price lookup (prices are stored with uppercase keys)
    const price = tokenPrices?.[symbol.toUpperCase()]?.current_price || 0;
    const usdValue = amount * price;
    return { amount, usdValue, symbol };
  };

  const getTransactionType = (tx: UnifiedTransaction, walletAddress: string): 'sent' | 'received' | 'swap' => {
    const isSent = tx.from_address.toLowerCase() === walletAddress.toLowerCase();
    const isReceived = tx.to_address.toLowerCase() === walletAddress.toLowerCase();
    
    // If both from and to are the same address, it could be a swap or self-transfer
    if (isSent && isReceived) return 'swap';
    return isSent ? 'sent' : 'received';
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
        const { usdValue } = formatValue(tx);
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
            Note: Transactions are fetched from 9 networks: Ethereum, Polygon, Arbitrum, Optimism, Base, Linea, Scroll, Shape, and Arbitrum Nova
          </p>
        </Card>
      ) : Object.keys(groupedTransactions).length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-2">No transactions found.</p>
          <p className="text-xs text-muted-foreground">
            Checked across 9 networks: Ethereum, Polygon, Arbitrum, Optimism, Base, Linea, Scroll, Shape, and Arbitrum Nova
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTransactions).map(([date, txs]) => (
            <div key={date} className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground">{date}</h2>
              {txs.map((tx) => {
                if (!walletAddress) return null;
                
                const txType = getTransactionType(tx, walletAddress);
                const { amount, usdValue, symbol } = formatValue(tx);
                
                return (
                  <Card
                    key={`${tx.hash}-${tx.token_address || 'native'}`}
                    className="gradient-card border-border/40 p-6 transition-smooth hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Transaction direction icon */}
                        <div className={`rounded-full p-3 ${
                          txType === 'sent' ? 'bg-destructive/10' : 
                          txType === 'swap' ? 'bg-accent' : 
                          'bg-success/10'
                        }`}>
                          {txType === 'sent' ? (
                            <ArrowUpRight className="h-5 w-5 text-destructive" />
                          ) : txType === 'swap' ? (
                            <Repeat className="h-5 w-5 text-accent-foreground" />
                          ) : (
                            <ArrowDownLeft className="h-5 w-5 text-success" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-base capitalize">
                              {txType}
                            </span>
                            {tx.type === 'erc20' && (
                              <Badge variant="secondary" className="text-xs">
                                ERC-20
                              </Badge>
                            )}
                            {tx.receipt_status && (
                              <Badge variant="outline" className="text-xs">
                                {tx.receipt_status === "1" ? "Success" : "Failed"}
                              </Badge>
                            )}
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
                          {/* Token icon - use proper token logo for ERC-20 */}
                          {tx.type === 'erc20' ? (
                            <TokenIcon 
                              logoUrl={tx.token_logo} 
                              symbol={tx.token_symbol}
                              address={tx.token_address}
                              network={tx.chain}
                              className="h-6 w-6"
                            />
                          ) : (
                            <NetworkIcon chain={tx.chain} className="h-6 w-6" />
                          )}
                          <p className={`text-xl font-bold ${
                            txType === 'sent' ? 'text-destructive' : 
                            txType === 'swap' ? 'text-foreground' : 
                            'text-success'
                          }`}>
                            {txType === 'sent' ? '-' : txType === 'swap' ? '' : '+'}
                            {formatNumber(amount, amount < 1 ? 6 : 2)}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {symbol}
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
