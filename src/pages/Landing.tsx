import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useEffect } from "react";

const Landing = () => {
  const [address, setAddress] = useState("");
  const navigate = useNavigate();
  const { address: connectedAddress } = useAccount();

  useEffect(() => {
    if (connectedAddress) {
      navigate(`/portfolio?address=${connectedAddress}`);
    }
  }, [connectedAddress, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      navigate(`/portfolio?address=${address.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Your Go To Portfolio Tracker for EVM
          </h1>
          <p className="text-xl text-muted-foreground">
            powered by AdEX AURA
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <p className="text-lg font-medium">Connect wallet or Search address</p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Input
              type="text"
              placeholder="search address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 max-w-md h-12 rounded-full"
            />
            <Button 
              type="submit" 
              size="lg"
              className="rounded-full px-8 h-12"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>

          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="h-px flex-1 bg-border max-w-[100px]" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border max-w-[100px]" />
          </div>

          <div className="flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
