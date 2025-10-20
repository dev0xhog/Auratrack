import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Token } from "@/hooks/usePortfolioBalances";
import { formatBalance, formatPercentage } from "@/lib/formatters";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { TokenLogo } from "./TokenLogo";
import { Skeleton } from "@/components/ui/skeleton";

interface TokenTableProps {
  tokens: Token[];
}

type SortField = "symbol" | "balance" | "balanceUSD";
type SortDirection = "asc" | "desc";

//  Fixed USD formatter – handles small values gracefully
const formatUSD = (value: number) => {
  if (!value || isNaN(value)) return "$0.00";

  // Use adaptive precision: more decimals for tiny prices
  if (value < 0.01) {
    return `$${value.toFixed(6)}`;
  } else if (value < 1) {
    return `$${value.toFixed(4)}`;
  } else if (value < 1000) {
    return `$${value.toFixed(2)}`;
  } else if (value < 1_000_000) {
    return `$${(value / 1000).toFixed(2)}K`;
  } else {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
};

export const TokenTable = ({ tokens }: TokenTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("balanceUSD");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Prepare tokens with address and network info for price fetching
  const tokenInfos = useMemo(() => {
    return tokens.map((token) => ({
      symbol: token.symbol,
      address: token.address,
      network: token.network,
      balance: token.balance,
      balanceUSD: token.balanceUSD,
    }));
  }, [tokens]);

  const { data: priceData, isLoading: isPriceLoading } = useTokenPrices(tokenInfos);

  // Get token logo from TrustWallet assets or fallback sources
  const getTokenLogo = (symbol: string, network: string, address?: string): string => {
    const networkToTrustWallet: { [key: string]: string } = {
      ethereum: "ethereum",
      polygon: "polygon",
      "op mainnet": "optimism",
      optimism: "optimism",
      bsc: "smartchain",
      binance: "smartchain",
      avalanche: "avalanchec",
      arbitrum: "arbitrum",
      base: "base",
      fantom: "fantom",
      mantle: "mantle",
      linea: "linea",
      scroll: "scroll",
      zksync: "zksync",
    };

    const networkLower = (network || "").toLowerCase();
    const trustWalletNetwork = Object.entries(networkToTrustWallet).find(([key]) => networkLower.includes(key))?.[1];

    const isNativeOrSpecial =
      !address || address === "0x0000000000000000000000000000000000000000" || address.toLowerCase().includes("dead");

    if (isNativeOrSpecial && trustWalletNetwork) {
      return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${trustWalletNetwork}/info/logo.png`;
    }
    if (trustWalletNetwork && address) {
      return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${trustWalletNetwork}/assets/${address}/logo.png`;
    }
    return "";
  };

  // Create a mapping for token prices - use calculated price from balance if API data unavailable
  const getTokenPrice = (symbol: string, network: string, balance: number, balanceUSD: number, address?: string) => {
    if (!symbol) return undefined;

    let price = priceData?.[symbol.toUpperCase()];
    if (price) {
      price.logo = getTokenLogo(symbol, network, address);
      return price;
    }

    if (symbol === "WETH") price = priceData?.["ETH"];
    if (symbol === "WMATIC") price = priceData?.["MATIC"];
    if (symbol === "WBNB") price = priceData?.["BNB"];
    if (symbol === "WAVAX") price = priceData?.["AVAX"];

    if (price) {
      price.logo = getTokenLogo(symbol, network, address);
      return price;
    }

    if (!price && balance > 0 && balanceUSD > 0) {
      const calculatedPrice = balanceUSD / balance;
      return {
        id: symbol.toLowerCase(),
        symbol: symbol.toUpperCase(),
        name: symbol,
        current_price: calculatedPrice,
        price_change_percentage_24h: 0,
        logo: getTokenLogo(symbol, network, address),
      };
    }

    return price;
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

    const tokenMap = new Map<string, Token>();
    result.forEach((token) => {
      const key = `${token.symbol}-${token.network}`;
      const existing = tokenMap.get(key);
      if (!existing || token.balanceUSD > existing.balanceUSD) {
        tokenMap.set(key, token);
      }
    });
    result = Array.from(tokenMap.values());

    if (searchQuery) {
      result = result.filter(
        (token) =>
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.network.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

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
    return sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
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
                <Button variant="ghost" size="sm" className="hover:bg-transparent font-medium">
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
                const tokenPrice = getTokenPrice(
                  token.symbol,
                  token.network,
                  token.balance,
                  token.balanceUSD,
                  token.address,
                );
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
                          <p className="text-xs font-semibold text-foreground/70">{token.network}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{formatBalance(token.balance)}</TableCell>
                    <TableCell className="font-medium">
                      {currentPrice !== undefined ? (
                        formatUSD(currentPrice)
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">{formatUSD(token.balanceUSD)}</TableCell>
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
