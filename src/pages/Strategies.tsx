import { PortfolioStrategiesSection } from "@/components/portfolio/PortfolioStrategiesSection";
import { useSearchParams } from "react-router-dom";
import { useAccount } from "wagmi";

const Strategies = () => {
  const [searchParams] = useSearchParams();
  const { address: connectedAddress } = useAccount();
  
  // Use address from URL search params, or fall back to connected wallet
  const walletAddress = searchParams.get("address") || connectedAddress;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">AI Strategies</h1>
        <p className="text-muted-foreground">
          Personalized DeFi strategies based on your portfolio
        </p>
      </div>

      <PortfolioStrategiesSection address={walletAddress} />
    </div>
  );
};

export default Strategies;
