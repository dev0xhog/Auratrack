import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Token } from "@/hooks/usePortfolioBalances";
import { formatBalance, formatUSD, formatPercentage } from "@/lib/formatters";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { TokenLogo } from "./TokenLogo";
import { Skeleton } from "@/components/ui/skeleton";

interface TokenTableProps {
  tokens: Token[];
}

type SortField = "symbol" | "balance" | "balanceUSD";
type SortDirection = "asc" | "desc";

export const TokenTable = ({ tokens }: TokenTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("balanceUSD");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Prepare tokens with address and network info for price fetching
  const tokenInfos = useMemo(() => {
    const infos = tokens.map(token => ({
      symbol: token.symbol,
      address: token.address,
      network: token.network,
      balance: token.balance,
      balanceUSD: token.balanceUSD
    }));
    
    // Also add network native tokens
    const nativeTokens = new Set<string>();
    tokens.forEach(token => {
      if (token.network) {
        const network = token.network.toLowerCase();
        if (network.includes('ethereum') && !nativeTokens.has('ETH')) {
          infos.push({ symbol: 'ETH', network: 'ethereum', address: undefined, balance: 0, balanceUSD: 0 });
          nativeTokens.add('ETH');
        }
        if (network.includes('polygon') && !nativeTokens.has('MATIC')) {
          infos.push({ symbol: 'MATIC', network: 'polygon', address: undefined, balance: 0, balanceUSD: 0 });
          nativeTokens.add('MATIC');
        }
        if ((network.includes('bsc') || network.includes('binance')) && !nativeTokens.has('BNB')) {
          infos.push({ symbol: 'BNB', network: 'bsc', address: undefined, balance: 0, balanceUSD: 0 });
          nativeTokens.add('BNB');
        }
        if (network.includes('avalanche') && !nativeTokens.has('AVAX')) {
          infos.push({ symbol: 'AVAX', network: 'avalanche', address: undefined, balance: 0, balanceUSD: 0 });
          nativeTokens.add('AVAX');
        }
      }
    });
    
    return infos;
  }, [tokens]);

  const { data: priceData, isLoading: isPriceLoading } = useTokenPrices(tokenInfos);
  
  // Create a mapping for token prices - use calculated price from balance if API data unavailable
  const getTokenPrice = (symbol: string, network: string, balance: number, balanceUSD: number, address?: string) => {
    if (!symbol) return undefined;
    
    // Try direct match first from API
    let price = priceData?.[symbol.toUpperCase()];
    if (price) {
      // Add logo from TrustWallet assets
      price.logo = getTokenLogo(symbol, network, address);
      return price;
    }
    
    // Try wrapped token variations
    if (symbol === 'WETH') price = priceData?.['ETH'];
    if (symbol === 'WMATIC') price = priceData?.['MATIC'];
    if (symbol === 'WBNB') price = priceData?.['BNB'];
    if (symbol === 'WAVAX') price = priceData?.['AVAX'];
    
    if (price) {
      price.logo = getTokenLogo(symbol, network, address);
      return price;
    }
    
    // If still no price but we have balance data, calculate the price
    if (!price && balance > 0 && balanceUSD > 0) {
      const calculatedPrice = balanceUSD / balance;
      return {
        id: symbol.toLowerCase(),
        symbol: symbol.toUpperCase(),
        name: symbol,
        current_price: calculatedPrice,
        price_change_percentage_24h: 0, // Can't calculate without historical data
        logo: getTokenLogo(symbol, network, address),
      };
    }
    
    return price;
  };

  // Get token logo from TrustWallet assets based on contract address
  const getTokenLogo = (symbol: string, network: string, address?: string): string => {
    // Map network names to TrustWallet blockchain identifiers
    const networkToTrustWallet: { [key: string]: string } = {
      'ethereum': 'ethereum',
      'polygon': 'polygon',
      'op mainnet': 'optimism',
      'optimism': 'optimism',
      'bsc': 'smartchain',
      'binance': 'smartchain',
      'avalanche': 'avalanchec',
      'arbitrum': 'arbitrum',
      'base': 'base',
      'fantom': 'fantom',
      'mantle': 'mantle',
      'linea': 'linea',
      'scroll': 'scroll',
      'zksync': 'zksync',
    };
    
    const networkLower = (network || '').toLowerCase();
    
    // Find matching TrustWallet network
    const trustWalletNetwork = Object.entries(networkToTrustWallet).find(([key]) => 
      networkLower.includes(key)
    )?.[1] || 'ethereum'; // Default to ethereum if no match
    
    // For native tokens (no address or zero address), use network logo
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${trustWalletNetwork}/info/logo.png`;
    }
    
    // TrustWallet expects checksummed addresses - convert to proper case
    // For now, just use the address as-is since most APIs return checksummed addresses
    const checksummedAddress = address;
    
    // For ERC-20 tokens, construct URL using contract address
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${trustWalletNetwork}/assets/${checksummedAddress}/logo.png`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredAndSortedTokens = useMemo(() => {
    let result = [...tokens];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (token) =>
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.network.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      let aComp: any = aValue;
      let bComp: any = bValue;

      if (typeof aComp === "string") aComp = aComp.toLowerCase();
      if (typeof bComp === "string") bComp = bComp.toLowerCase();

      if (sortDirection === "asc") {
        return aComp > bComp ? 1 : -1;
      } else {
        return aComp < bComp ? 1 : -1;
      }
    });

    return result;
  }, [tokens, searchQuery, sortField, sortDirection, priceData]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("symbol")}
                  className="hover:bg-transparent font-medium"
                >
                  Token
                  <SortIcon field="symbol" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("balance")}
                  className="hover:bg-transparent font-medium"
                >
                  Balance
                  <SortIcon field="balance" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-transparent font-medium"
                >
                  Price
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("balanceUSD")}
                  className="hover:bg-transparent font-medium"
                >
                  Value (USD)
                  <SortIcon field="balanceUSD" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTokens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No tokens found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTokens.map((token, index) => {
                const tokenPrice = getTokenPrice(token.symbol, token.network, token.balance, token.balanceUSD, token.address);
                const currentPrice = tokenPrice?.current_price;

                return (
                  <TableRow key={`${token.address}-${index}`} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {isPriceLoading ? (
                          <Skeleton className="h-8 w-8 rounded-full" />
                        ) : (
                          <TokenLogo
                            src={tokenPrice?.logo}
                            symbol={token.symbol}
                            size="md"
                            address={token.address}
                            network={token.network}
                          />
                        )}
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold text-base">{token.symbol}</p>
                          <p className="text-xs font-semibold text-foreground/70">
                            {token.network}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatBalance(token.balance)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {currentPrice !== undefined ? (
                        formatUSD(currentPrice)
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatUSD(token.balanceUSD)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
