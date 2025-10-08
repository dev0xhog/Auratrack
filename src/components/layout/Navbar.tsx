import { Button } from "@/components/ui/button";
import { Moon, Sun, Search } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchAddress, setSearchAddress] = useState("");
  const { address: connectedAddress } = useAccount();

  const currentAddress = searchParams.get("address") || "";

  // Handle wallet connection/disconnection
  useEffect(() => {
    if (connectedAddress && !currentAddress) {
      // If wallet connects and no search address, use wallet address
      navigate(`${location.pathname}?address=${connectedAddress}`);
    } else if (connectedAddress && currentAddress && connectedAddress !== currentAddress) {
      // If wallet is connected and different from current search, update to wallet address
      navigate(`${location.pathname}?address=${connectedAddress}`);
    }
  }, [connectedAddress, location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchAddress.trim()) {
      navigate(`${location.pathname}?address=${searchAddress.trim()}`);
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
            <span className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Auratrack</span>
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
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Search address..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="w-48 md:w-64"
              />
              <Button type="submit" size="sm" variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </form>
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
          </div>
        </div>
      </div>
    </nav>
  );
};
