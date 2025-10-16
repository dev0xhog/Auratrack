import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpRight, ArrowDownLeft, ExternalLink, Filter, Repeat, Check, CheckCircle2 } from "lucide-react";
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
  const [networkFilter, setNetworkFilter] = useState("");
  const [hideUnknownTokens, setHideUnknownTokens] = useState(false);
  const [hideLowValue, setHideLowValue] = useState(false);
  const [searchParams] = useSearchParams();
  const walletAddress = searchParams.get("address") || undefined;
  
  // Fetch both native transactions and token transfers
  const { data: txsByChain, isLoading: txsLoading, error: txsError } = useMoralisTransactionsByChain(walletAddress);
  const { data: transfersByChain, isLoading: transfersLoading, error: transfersError } = useMoralisTokenTransfersByChain(walletAddress);
  
  const isLoading = txsLoading || transfersLoading;
  const error = txsError || transfersError;

  // Enhanced unified transaction type
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
    token_name?: string;
    token_logo?: string;
    token_decimals?: string;
    token_address?: string;
    from_address_label?: string;
    to_address_label?: string;
    possible_spam?: boolean;
    security_score?: number | null;
    verified_contract?: boolean;
  };

  // Enhanced transaction category type
  type TransactionCategory = 'sent' | 'received' | 'swapped' | 'approved' | 'interaction';

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
            token_name: transfer.token_name,
            token_logo: transfer.token_logo,
            token_decimals: transfer.token_decimals,
            token_address: transfer.token_address,
            possible_spam: transfer.possible_spam,
            security_score: transfer.security_score,
            verified_contract: transfer.verified_contract,
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
      } else if (chain === "cronos") {
        key = "CRO-cronos";
        token = { symbol: "CRO", network: "cronos" };
      } else if (chain === "gnosis") {
        key = "XDAI-gnosis";
        token = { symbol: "XDAI", network: "gnosis" };
      } else if (chain === "chiliz") {
        key = "CHZ-chiliz";
        token = { symbol: "CHZ", network: "chiliz" };
      } else if (chain === "moonbeam") {
        key = "GLMR-moonbeam";
        token = { symbol: "GLMR", network: "moonbeam" };
      } else if (chain === "moonriver") {
        key = "MOVR-moonriver";
        token = { symbol: "MOVR", network: "moonriver" };
      } else if (chain === "flow") {
        key = "FLOW-flow";
        token = { symbol: "FLOW", network: "flow" };
      } else if (chain === "ronin") {
        key = "RON-ronin";
        token = { symbol: "RON", network: "ronin" };
      } else if (chain === "lisk") {
        key = "LSK-lisk";
        token = { symbol: "LSK", network: "lisk" };
      } else if (chain === "pulsechain") {
        key = "PLS-pulsechain";
        token = { symbol: "PLS", network: "pulsechain" };
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
    if (chain === "cronos") return "CRO";
    if (chain === "gnosis") return "XDAI";
    if (chain === "chiliz") return "CHZ";
    if (chain === "moonbeam") return "GLMR";
    if (chain === "moonriver") return "MOVR";
    if (chain === "flow") return "FLOW";
    if (chain === "ronin") return "RON";
    if (chain === "lisk") return "LSK";
    if (chain === "pulsechain") return "PLS";
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
    if (chain === "cronos") return "Cronos";
    if (chain === "gnosis") return "Gnosis";
    if (chain === "chiliz") return "Chiliz";
    if (chain === "moonbeam") return "Moonbeam";
    if (chain === "moonriver") return "Moonriver";
    if (chain === "flow") return "Flow";
    if (chain === "ronin") return "Ronin";
    if (chain === "lisk") return "Lisk";
    if (chain === "pulsechain") return "Pulsechain";
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
    if (chain === "cronos") return `https://cronoscan.com/tx/${hash}`;
    if (chain === "gnosis") return `https://gnosisscan.io/tx/${hash}`;
    if (chain === "chiliz") return `https://chiliscan.com/tx/${hash}`;
    if (chain === "moonbeam") return `https://moonscan.io/tx/${hash}`;
    if (chain === "moonriver") return `https://moonriver.moonscan.io/tx/${hash}`;
    if (chain === "flow") return `https://flowscan.io/tx/${hash}`;
    if (chain === "ronin") return `https://app.roninchain.com/tx/${hash}`;
    if (chain === "lisk") return `https://blockscout.lisk.com/tx/${hash}`;
    if (chain === "pulsechain") return `https://scan.pulsechain.com/tx/${hash}`;
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

  // Enhanced transaction categorization
  const categorizeTransaction = (tx: UnifiedTransaction, walletAddress: string): TransactionCategory => {
    const isSent = tx.from_address.toLowerCase() === walletAddress.toLowerCase();
    const isReceived = tx.to_address.toLowerCase() === walletAddress.toLowerCase();
    const amount = parseFloat(tx.value);
    
    // Check if it's an approval (ERC20 with very low or zero value)
    if (tx.type === 'erc20') {
      const decimals = parseInt(tx.token_decimals || '18');
      const tokenAmount = amount / Math.pow(10, decimals);
      if (tokenAmount === 0 || tokenAmount < 0.000001) {
        return 'approved';
      }
    }
    
    // Check for interactions (contract calls with no value transfer)
    if (tx.type === 'native' && amount === 0) {
      return 'interaction';
    }
    
    // Simple categorization - let swap detection handle complex cases
    return isSent ? 'sent' : 'received';
  };

  const getProtocolName = (tx: UnifiedTransaction): string => {
    // Use address label if available
    if (tx.to_address_label) {
      return tx.to_address_label;
    }
    
    // Common contract addresses for protocols
    const address = tx.to_address.toLowerCase();
    
    // Add common protocol addresses
    if (address.includes('1inch')) return '1inch';
    if (address.includes('uniswap')) return 'Uniswap';
    if (address.includes('sushiswap')) return 'SushiSwap';
    
    // For regular transfers, show shortened address
    if (tx.type === 'erc20') {
      return `${tx.to_address.slice(0, 6)}...${tx.to_address.slice(-4)}`;
    }
    
    return getChainName(tx.chain);
  };

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions;

    // Search filter (hash)
    if (searchQuery) {
      filtered = filtered.filter((tx) =>
        tx.hash.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Network filter
    if (networkFilter) {
      filtered = filtered.filter((tx) =>
        tx.chain.toLowerCase() === networkFilter.toLowerCase()
      );
    }

    // Hide unknown tokens - comprehensive spam detection
    if (hideUnknownTokens) {
      filtered = filtered.filter((tx) => {
        // Always keep native transactions (ETH, MATIC, BNB, etc.)
        if (tx.type === 'native' && parseFloat(tx.value) > 0) {
          return true;
        }
        
        // Use Moralis's possible_spam field (most reliable)
        if (tx.possible_spam === true) {
          console.log('Filtered spam token:', tx.token_symbol, tx.token_name);
          return false;
        }
        
        // Filter unverified contracts with low/no security score
        if (tx.verified_contract === false || 
            (tx.security_score !== null && tx.security_score !== undefined && tx.security_score < 50)) {
          console.log('Filtered low security token:', tx.token_symbol, 'Score:', tx.security_score);
          return false;
        }
        
        // Check for Unicode lookalike characters (common in scams)
        const symbol = tx.token_symbol || '';
        const tokenName = tx.token_name || '';
        
        // Detect non-ASCII characters (lookalikes for USDC, USDT, etc.)
        const hasNonAscii = /[^\x00-\x7F]/.test(symbol) || /[^\x00-\x7F]/.test(tokenName);
        if (hasNonAscii) {
          console.log('Filtered non-ASCII token:', symbol, tokenName);
          return false;
        }
        
        // Additional pattern matching
        const symbolLower = symbol.toLowerCase();
        const tokenNameLower = tokenName.toLowerCase();
        const fromAddress = (tx.from_address || '').toLowerCase();
        const toAddress = (tx.to_address || '').toLowerCase();
        const tokenAddress = (tx.token_address || '').toLowerCase();
        
        const suspiciousPatterns = [
          'fake',
          'phishing',
          'visit',
          'claim',
          'spam',
          'scam',
          'airdrop',
          '.com',
          '.io',
          '.org',
          '.net',
          'http',
          'www.',
          '1004644',
          'reward',
          'bonus',
          'gift',
          'free',
          'winner',
        ];
        
        const isSuspicious = suspiciousPatterns.some(pattern => 
          symbolLower.includes(pattern) ||
          tokenNameLower.includes(pattern) ||
          fromAddress.includes(pattern) ||
          toAddress.includes(pattern) ||
          tokenAddress.includes(pattern)
        );
        
        if (isSuspicious) {
          console.log('Filtered suspicious pattern:', symbol || tokenName);
          return false;
        }
        
        return true;
      });
    }

    // Hide low value transactions
    if (hideLowValue) {
      filtered = filtered.filter((tx) => {
        const { usdValue } = formatValue(tx);
        return usdValue >= 0.1;
      });
    }

    return filtered;
  }, [allTransactions, searchQuery, networkFilter, hideUnknownTokens, hideLowValue, tokenPrices]);

  // Get unique networks from transactions
  const availableNetworks = useMemo(() => {
    const networks = new Set<string>();
    allTransactions.forEach(tx => networks.add(tx.chain));
    return Array.from(networks).sort();
  }, [allTransactions]);

  // Group transactions by hash to detect swaps, then by date
  const groupedTransactions = useMemo(() => {
    if (!walletAddress) return {};
    
    const lowerWallet = walletAddress.toLowerCase();
    
    // First group by hash
    const byHash: { [hash: string]: UnifiedTransaction[] } = {};
    filteredTransactions.forEach((tx) => {
      if (!byHash[tx.hash]) {
        byHash[tx.hash] = [];
      }
      byHash[tx.hash].push(tx);
    });

    // Track which hashes we've already added to avoid duplicates
    const processedHashes = new Set<string>();
    
    // Process each transaction group and organize by date
    const groups: { [date: string]: Array<UnifiedTransaction[] | UnifiedTransaction> } = {};
    
    Object.entries(byHash).forEach(([hash, txGroup]) => {
      // Skip if already processed
      if (processedHashes.has(hash)) return;
      processedHashes.add(hash);
      
      const firstTx = txGroup[0];
      const date = new Date(firstTx.block_timestamp);
      const dateKey = date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      // Filter to only transactions involving the wallet
      const relevantTxs = txGroup.filter(tx => 
        tx.from_address.toLowerCase() === lowerWallet || 
        tx.to_address.toLowerCase() === lowerWallet
      );
      
      if (relevantTxs.length === 0) return;
      
      // Separate sends and receives
      const sentTxs = relevantTxs.filter(tx => tx.from_address.toLowerCase() === lowerWallet);
      const receivedTxs = relevantTxs.filter(tx => tx.to_address.toLowerCase() === lowerWallet);
      
      // Remove approvals (zero value transfers) from consideration
      const nonApprovalSent = sentTxs.filter(tx => {
        if (tx.type === 'erc20') {
          const decimals = parseInt(tx.token_decimals || '18');
          const amount = parseFloat(tx.value) / Math.pow(10, decimals);
          return amount > 0.000001;
        }
        return parseFloat(tx.value) > 0;
      });
      
      const nonApprovalReceived = receivedTxs.filter(tx => {
        if (tx.type === 'erc20') {
          const decimals = parseInt(tx.token_decimals || '18');
          const amount = parseFloat(tx.value) / Math.pow(10, decimals);
          return amount > 0.000001;
        }
        return parseFloat(tx.value) > 0;
      });
      
      // Detect swaps: user both sent AND received non-zero amounts
      // More lenient detection to catch Rabby wallet swaps and DEX aggregators
      if (nonApprovalSent.length > 0 && nonApprovalReceived.length > 0) {
        // This is a swap - create a pair with sent and received
        // For Rabby/complex swaps, include ALL sent and received tokens
        const swapPair: UnifiedTransaction[] = [];
        
        // Add all sent tokens (but limit to 2 for display purposes)
        nonApprovalSent.slice(0, 2).forEach(tx => swapPair.push(tx));
        
        // Add all received tokens (but limit to 2 for display purposes)
        nonApprovalReceived.slice(0, 2).forEach(tx => swapPair.push(tx));
        
        groups[dateKey].push(swapPair);
      } 
      // Only sends (no receives)
      else if (nonApprovalSent.length > 0) {
        // If multiple sends with no receives, show each one
        nonApprovalSent.forEach(tx => groups[dateKey].push(tx));
      }
      // Only receives (no sends)
      else if (nonApprovalReceived.length > 0) {
        // If multiple receives with no sends, show each one
        nonApprovalReceived.forEach(tx => groups[dateKey].push(tx));
      }
      // Only approvals or interactions
      else if (relevantTxs.length > 0) {
        // Show interactions and approvals
        relevantTxs.forEach(tx => groups[dateKey].push(tx));
      }
    });

    return groups;
  }, [filteredTransactions, walletAddress]);

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
        <div className="relative min-w-[180px]">
          <select
            value={networkFilter}
            onChange={(e) => setNetworkFilter(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-border/40 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Networks</option>
            {availableNetworks.map(network => (
              <option key={network} value={network}>
                {getChainName(network)}
              </option>
            ))}
          </select>
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
            Note: Transactions are fetched from 18 networks including Ethereum, Polygon, BSC, Avalanche, Fantom, Arbitrum, Optimism, Base, Linea, Cronos, Gnosis, Chiliz, Moonbeam, Moonriver, Flow, Ronin, Lisk, and Pulsechain
          </p>
        </Card>
      ) : Object.keys(groupedTransactions).length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-2">No transactions found.</p>
          <p className="text-xs text-muted-foreground">
            Checked across 18 networks including Ethereum, Polygon, BSC, Avalanche, Fantom, Arbitrum, Optimism, Base, Linea, Cronos, Gnosis, Chiliz, Moonbeam, Moonriver, Flow, Ronin, Lisk, and Pulsechain
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTransactions).map(([date, txs]) => (
            <div key={date} className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground">{date}</h2>
              {txs.map((txItem, idx) => {
                if (!walletAddress) return null;
                
                // Check if this is a swap (array of transactions) or single transaction
                const isSwap = Array.isArray(txItem);
                const tx = isSwap ? txItem[0] : txItem;
                const swapTxs = isSwap ? txItem : [txItem];
                
                const category = isSwap ? 'swapped' : categorizeTransaction(tx, walletAddress);
                const protocol = getProtocolName(tx);
                
                const getAmountColor = () => {
                  switch (category) {
                    case 'sent':
                      return 'text-destructive';
                    case 'received':
                      return 'text-success';
                    case 'swapped':
                      return 'text-foreground';
                    default:
                      return 'text-foreground';
                  }
                };
                
                return (
                  <Card
                    key={`${tx.hash}-${idx}`}
                    className="border-border/40 p-4 transition-smooth hover:shadow-md bg-card"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Icon with token logos */}
                        <div className="relative flex-shrink-0">
                          {isSwap && swapTxs.length >= 2 ? (
                            // Side-by-side token logos for swaps with arrow
                            <div className="flex items-center gap-1">
                              <div className="rounded-full p-2 bg-background border-2 border-border">
                                {swapTxs[0].type === 'erc20' ? (
                                  <TokenIcon 
                                    logoUrl={swapTxs[0].token_logo} 
                                    symbol={swapTxs[0].token_symbol}
                                    address={swapTxs[0].token_address}
                                    network={swapTxs[0].chain}
                                    className="h-5 w-5"
                                  />
                                ) : (
                                  <NetworkIcon chain={swapTxs[0].chain} className="h-5 w-5" />
                                )}
                              </div>
                              <Repeat className="h-3 w-3 text-muted-foreground" />
                              <div className="rounded-full p-2 bg-background border-2 border-border">
                                {swapTxs[1].type === 'erc20' ? (
                                  <TokenIcon 
                                    logoUrl={swapTxs[1].token_logo} 
                                    symbol={swapTxs[1].token_symbol}
                                    address={swapTxs[1].token_address}
                                    network={swapTxs[1].chain}
                                    className="h-5 w-5"
                                  />
                                ) : (
                                  <NetworkIcon chain={swapTxs[1].chain} className="h-5 w-5" />
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-full p-2.5 bg-background">
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
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Transaction type */}
                          <p className="font-semibold text-base capitalize mb-0.5">
                            {category === 'approved' ? `Approved ${tx.token_symbol || ''}` : category}
                          </p>
                          
                          {/* Hash link with network badge */}
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <NetworkIcon chain={tx.chain} className="h-3.5 w-3.5" />
                            <a
                              href={getExplorerUrl(tx.chain, tx.hash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-primary hover:underline truncate"
                            >
                              {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      {/* Amount section */}
                      <div className="text-right flex-shrink-0">
                        {isSwap ? (
                          <div className="space-y-1">
                            {swapTxs.map((swapTx, i) => {
                              const { amount, usdValue, symbol } = formatValue(swapTx);
                              const isSent = swapTx.from_address.toLowerCase() === walletAddress.toLowerCase();
                              return (
                                <div key={i}>
                                  <p className={`text-sm font-semibold ${isSent ? 'text-destructive' : 'text-success'}`}>
                                    {isSent ? '-' : '+'}
                                    {formatNumber(amount, amount < 1 ? 6 : 2)} {symbol}
                                  </p>
                                  {usdValue > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      {formatUSD(usdValue)}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : category !== 'interaction' && category !== 'approved' ? (
                          <>
                            {(() => {
                              const { amount, usdValue, symbol } = formatValue(tx);
                              return (
                                <>
                                  <div className="flex items-center gap-1 justify-end">
                                    {category === 'sent' && <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />}
                                    {category === 'received' && <ArrowDownLeft className="h-3.5 w-3.5 text-success" />}
                                    <p className={`text-base font-semibold ${getAmountColor()}`}>
                                      {category === 'sent' ? '-' : category === 'received' ? '+' : ''}
                                      {formatNumber(amount, amount < 1 ? 6 : 2)} {symbol}
                                    </p>
                                  </div>
                                  {usdValue > 0 && (
                                    <p className="text-sm text-muted-foreground">
                                      {formatUSD(usdValue)}
                                    </p>
                                  )}
                                </>
                              );
                            })()}
                          </>
                        ) : (
                          <a
                            href={getExplorerUrl(tx.chain, tx.hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            View
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
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
