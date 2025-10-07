import { useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";
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

interface Token {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  chain: string;
  balance: string;
  balanceUSD: string;
}

const mockTokens: Token[] = [
  {
    id: "1",
    name: "Ethereum",
    symbol: "ETH",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    chain: "Ethereum",
    balance: "5.2534",
    balanceUSD: "$10,234.50",
  },
  {
    id: "2",
    name: "USD Coin",
    symbol: "USDC",
    logo: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
    chain: "Ethereum",
    balance: "15,000",
    balanceUSD: "$15,000.00",
  },
];

export const TokenTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"balance" | "balanceUSD" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: "balance" | "balanceUSD") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
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
            className="pl-10 glass border-border/40"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border/40 glass overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead>Token</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("balance")}
                  className="hover:bg-transparent"
                >
                  Balance
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("balanceUSD")}
                  className="hover:bg-transparent"
                >
                  Holdings Value (USD)
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTokens.map((token) => (
              <TableRow key={token.id} className="border-border/40 hover:bg-white/5">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={token.logo} alt={token.name} className="h-8 w-8 rounded-full" />
                    <div>
                      <p className="font-medium">{token.symbol}</p>
                      <p className="text-xs text-muted-foreground">{token.name}</p>
                      <p className="text-xs text-muted-foreground">{token.chain}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono">{token.balance}</TableCell>
                <TableCell className="font-semibold">{token.balanceUSD}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
