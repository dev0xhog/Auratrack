import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useNFTs } from "@/hooks/useNFTs";
import { Skeleton } from "@/components/ui/skeleton";

const NFTs = () => {
  const [searchParams] = useSearchParams();
  const walletAddress = searchParams.get("address") || undefined;
  const { data: nfts, isLoading, error } = useNFTs(walletAddress);
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">NFT Collection</h1>
        <p className="text-muted-foreground">Your digital art and collectibles</p>
      </div>

      {!walletAddress ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No wallet address provided</p>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-12 text-center border-destructive">
          <p className="text-destructive">Failed to load NFTs. Please add your Alchemy API key.</p>
        </Card>
      ) : !nfts || nfts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No NFTs found for this wallet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {nfts.map((nft) => (
            <Card
              key={`${nft.contract.address}-${nft.tokenId}`}
              className="gradient-card border-border/40 overflow-hidden transition-smooth hover:border-primary/40 hover:scale-105"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                {nft.media?.[0]?.gateway || nft.metadata?.image ? (
                  <img
                    src={nft.media?.[0]?.gateway || nft.metadata?.image}
                    alt={nft.title || nft.metadata?.name}
                    className="h-full w-full object-cover transition-transform hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1635002962298-b0c04f717f6c?w=400";
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <p className="text-muted-foreground">No Image</p>
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold mb-1 truncate">
                    {nft.title || nft.metadata?.name || `Token #${nft.tokenId}`}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {nft.contract.name}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Ethereum</Badge>
                  <p className="text-xs text-muted-foreground">#{nft.tokenId}</p>
                </div>
                <a
                  href={`https://opensea.io/assets/ethereum/${nft.contract.address}/${nft.tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
                >
                  View on OpenSea
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NFTs;
