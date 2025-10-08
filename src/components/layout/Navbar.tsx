import { Button } from "@/components/ui/button";
import { Moon, Sun, Search } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSearch, setShowSearch] = useState(false);
  const [searchAddress, setSearchAddress] = useState("");

  const currentAddress = searchParams.get("address") || "";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchAddress.trim()) {
      navigate(`${location.pathname}?address=${searchAddress.trim()}`);
      setShowSearch(false);
      setSearchAddress("");
    }
  };

  const navLinks = [
    { path: `/portfolio?address=${currentAddress}`, label: "Portfolio" },
    { path: `/strategies?address=${currentAddress}`, label: "Strategies" },
    { path: `/transactions?address=${currentAddress}`, label: "Transactions" },
    { path: `/nfts?address=${currentAddress}`, label: "NFTs" },
  ];

  const isActive = (path: string) => location.pathname + location.search === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 glass">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">CryptoTracker</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant="ghost"
                  className={`transition-smooth ${
                    isActive(link.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {!showSearch ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSearch(true)}
                  className="rounded-full"
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="rounded-full"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
                <ConnectButton />
              </>
            ) : (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Search address..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="w-64"
                  autoFocus
                />
                <Button type="submit" size="sm">
                  Search
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowSearch(false);
                    setSearchAddress("");
                  }}
                >
                  Cancel
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
