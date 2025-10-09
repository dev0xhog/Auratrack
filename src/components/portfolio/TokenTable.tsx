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

interface TokenTableProps {
  tokens: Token[];
}

type SortField = "symbol" | "balance" | "balanceUSD" | "priceChange";
type SortDirection = "asc" | "desc";

export const TokenTable = ({ tokens }: TokenTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("balanceUSD");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Get unique token symbols for price fetching
  const tokenSymbols = useMemo(
    () => [...new Set(tokens.map((t) => t.symbol))],
    [tokens]
  );
  const { data: priceData } = useTokenPrices(tokenSymbols);

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
      let aValue: any;
      let bValue: any;

      if (sortField === "priceChange") {
        aValue = priceData?.[a.symbol.toUpperCase()]?.price_change_percentage_24h || 0;
        bValue = priceData?.[b.symbol.toUpperCase()]?.price_change_percentage_24h || 0;
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
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
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("priceChange")}
                  className="hover:bg-transparent font-medium"
                >
                  24h Change
                  <SortIcon field="priceChange" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTokens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No tokens found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTokens.map((token, index) => {
                const tokenPrice = priceData?.[token.symbol.toUpperCase()];
                const priceChange = tokenPrice?.price_change_percentage_24h;
                const currentPrice = tokenPrice?.current_price;
                const isPositive = priceChange && priceChange > 0;
                const isNegative = priceChange && priceChange < 0;

                return (
                  <TableRow key={`${token.address}-${index}`} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{token.symbol}</p>
                          <p className="text-xs text-muted-foreground">{token.network}</p>
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
                    <TableCell>
                      {priceChange !== undefined ? (
                        <span
                          className={`font-semibold ${
                            isPositive
                              ? "text-green-600 dark:text-green-500"
                              : isNegative
                              ? "text-red-600 dark:text-red-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatPercentage(priceChange)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
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
