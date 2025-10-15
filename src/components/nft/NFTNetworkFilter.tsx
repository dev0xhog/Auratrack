import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NetworkData {
  network: string;
  count: number;
}

interface NFTNetworkFilterProps {
  networks: NetworkData[];
  selectedNetwork: string | null;
  onNetworkSelect: (network: string | null) => void;
}

export const NFTNetworkFilter = ({ 
  networks, 
  selectedNetwork, 
  onNetworkSelect 
}: NFTNetworkFilterProps) => {
  if (networks.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Networks</h2>
        {selectedNetwork && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNetworkSelect(null)}
          >
            Clear filter
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {networks.map((network) => (
          <Card
            key={network.network}
            className={`p-4 cursor-pointer transition-smooth hover:border-primary/50 hover:shadow-md ${
              selectedNetwork === network.network ? "border-primary shadow-md" : ""
            }`}
            onClick={() =>
              onNetworkSelect(
                selectedNetwork === network.network ? null : network.network
              )
            }
          >
            <p className="text-sm font-medium mb-1">{network.network}</p>
            <p className="text-lg font-bold">{network.count} NFTs</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
