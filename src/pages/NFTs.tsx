import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Image } from "lucide-react";
import { useMoralisNFTsByChain, type MoralisNFT } from "@/hooks/useMoralisNFTsByChain";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "react-router-dom";
import { isSpamNFT } from "@/lib/nftHelpers";
import { NFTCard } from "@/components/nft/NFTCard";
import { NFTNetworkFilter } from "@/components/nft/NFTNetworkFilter";

const NFTs = () => {
  const [searchParams] = useSearchParams();
  const walletAddress = searchParams.get("address") || undefined;
  const { data: nftsByChain, isLoading, error } = useMoralisNFTsByChain(walletAddress);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);

  // Filter spam NFTs
  const getNonSpamNFTs = (nfts: MoralisNFT[]) => {
    return nfts.filter(nft => !isSpamNFT(nft));
  };

  // Get network data for filtering
  const networkData = useMemo(() => {
    const data = Object.entries(nftsByChain || {})
      .map(([network, nfts]) => {
        const displayNfts = getNonSpamNFTs(nfts);
        return { network, count: displayNfts.length };
      })
      .filter(item => item.count > 0);
    
    return data.sort((a, b) => b.count - a.count);
  }, [nftsByChain]);

  // Filter NFTs with chain info
  const displayNFTs = useMemo(() => {
    const nftsWithChain = selectedNetwork
      ? (nftsByChain?.[selectedNetwork] || []).map(nft => ({ ...nft, chain: selectedNetwork }))
      : Object.entries(nftsByChain || {}).flatMap(([chain, nfts]) => 
          nfts.map(nft => ({ ...nft, chain }))
        );
    
    return nftsWithChain.filter(nft => !isSpamNFT(nft));
  }, [nftsByChain, selectedNetwork]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">NFT Collection</h1>
          <p className="text-muted-foreground">Your digital art and collectibles</p>
        </div>
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
        <div className="space-y-6">
          <Card className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-lg font-medium">Loading NFTs from all chains...</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Fetching from Ethereum, Polygon, Arbitrum, Optimism, Base, and more
            </p>
          </Card>
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
          <NFTNetworkFilter
            networks={networkData}
            selectedNetwork={selectedNetwork}
            onNetworkSelect={setSelectedNetwork}
          />

          {displayNFTs.length === 0 ? (
            <Card className="p-12 text-center">
              <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No NFTs found</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayNFTs.map((nft, index) => (
                <NFTCard 
                  key={`${nft.token_address}-${nft.token_id}-${index}`}
                  nft={nft}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NFTs;
