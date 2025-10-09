import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image, ExternalLink } from "lucide-react";
import { useMoralisNFTsByChain } from "@/hooks/useMoralisNFTsByChain";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "react-router-dom";
import { formatUSD } from "@/lib/formatters";

const NFTs = () => {
  const [searchParams] = useSearchParams();
  const walletAddress = searchParams.get("address") || undefined;
  const { data: nftsByChain, isLoading, error } = useMoralisNFTsByChain(walletAddress);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);

  // Get network balances for filtering
  const networkData = Object.entries(nftsByChain || {}).map(([network, nfts]) => ({
    network,
    count: nfts.length,
  }));

  // Filter NFTs by selected network
  const displayNFTs = selectedNetwork
    ? nftsByChain?.[selectedNetwork] || []
    : Object.values(nftsByChain || {}).flat();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">NFT Collection</h1>
        <p className="text-muted-foreground">Your digital art and collectibles</p>
      </div>

      {!walletAddress ? (
        <Card className="p-12 text-center">
          <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Wallet Connected</h3>
          <p className="text-muted-foreground">
            Enter a wallet address to view NFT collection
          </p>
        </Card>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <p className="text-destructive">Failed to load NFTs. Please try again.</p>
        </Card>
      ) : displayNFTs.length === 0 && networkData.length === 0 ? (
        <Card className="p-12 text-center">
          <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No NFTs found in this wallet</p>
        </Card>
      ) : (
        <>
          {/* Network Filter */}
          {networkData.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Networks</h2>
                {selectedNetwork && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNetwork(null)}
                  >
                    Clear filter
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                {networkData.map((network) => (
                  <Card
                    key={network.network}
                    className={`p-4 cursor-pointer transition-smooth hover:border-primary/40 ${
                      selectedNetwork === network.network ? "border-primary" : ""
                    }`}
                    onClick={() =>
                      setSelectedNetwork(
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
          )}

          {/* NFT Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayNFTs.map((nft, index) => {
              const metadata = typeof nft.metadata === 'string' 
                ? (() => { try { return JSON.parse(nft.metadata); } catch { return {}; } })()
                : nft.metadata || nft.normalized_metadata || {};
              
              const imageUrl = metadata.image || '';
              const name = metadata.name || nft.name || `#${nft.token_id}`;
              const description = metadata.description || '';

              return (
                <Card key={`${nft.token_address}-${nft.token_id}-${index}`} className="overflow-hidden">
                  <div className="aspect-square bg-muted relative">
                    {imageUrl ? (
                      <img
                        src={imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {nft.symbol || 'Unknown Collection'}
                        </p>
                      </div>
                      <Badge variant="outline">{nft.contract_type}</Badge>
                    </div>
                    {description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {description}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      {nft.floor_price_usd && (
                        <div>
                          <p className="text-xs text-muted-foreground">Floor Price</p>
                          <p className="text-sm font-semibold">{formatUSD(nft.floor_price_usd)}</p>
                        </div>
                      )}
                      {nft.amount && parseInt(nft.amount) > 1 && (
                        <Badge variant="secondary">
                          x{nft.amount}
                        </Badge>
                      )}
                    </div>
                    <a
                      href={`https://etherscan.io/token/${nft.token_address}?a=${nft.token_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      View on Explorer
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default NFTs;
