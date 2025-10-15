import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image, ExternalLink, Filter } from "lucide-react";
import { useMoralisNFTsByChain, type MoralisNFT } from "@/hooks/useMoralisNFTsByChain";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "react-router-dom";
import { formatUSD } from "@/lib/formatters";

const NFTs = () => {
  const [searchParams] = useSearchParams();
  const walletAddress = searchParams.get("address") || undefined;
  const [hideSpam, setHideSpam] = useState(true);
  const { data: nftsByChain, isLoading, error } = useMoralisNFTsByChain(walletAddress);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);

  // Helper functions for spam detection
  const getImageUrl = (nft: MoralisNFT): string | null => {
    const metadata = typeof nft.normalized_metadata === 'object' 
      ? nft.normalized_metadata 
      : nft.metadata && typeof nft.metadata === 'object' 
      ? nft.metadata 
      : null;

    if (metadata?.image) {
      let imageUrl = metadata.image;
      if (imageUrl.startsWith('ipfs://')) {
        imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }
      return imageUrl;
    }
    return null;
  };

  const isSpamNFT = (nft: MoralisNFT): boolean => {
    // Use Moralis' spam detection first
    if (nft.possible_spam === true) return true;
    if (nft.verified_collection === true) return false;

    const metadata = typeof nft.normalized_metadata === 'object' 
      ? nft.normalized_metadata 
      : nft.metadata && typeof nft.metadata === 'object' 
      ? nft.metadata 
      : null;

    const imageUrl = getImageUrl(nft);
    const name = (nft.name || metadata?.name || '').toLowerCase();
    const tokenId = nft.token_id || '';
    
    // Spam keywords to check
    const spamKeywords = [
      'airdrop', 'claim', 'bonus', 'free', 'reward', 'visit',
      'content', 'condor', '.com', '$', 'free eth', 'eth voucher',
      '🎁', '🎉', '💰', '🚀', '💎', '⚡', '🔥'
    ];
    
    // Multiple spam indicators
    const checks = [
      // Very large token IDs (common in spam)
      tokenId.length > 40,
      
      // No image URL
      !imageUrl,
      
      // No name
      !name,
      
      // Spam keywords in name
      spamKeywords.some(keyword => name.includes(keyword)),
      
      // Invalid or suspicious image URLs
      imageUrl && (
        imageUrl.includes('data:application') ||
        imageUrl.includes('base64')
      ),
    ];
    
    // Be strict: consider spam if any indicator is present
    const spamIndicators = checks.filter(Boolean).length;
    return spamIndicators >= 1;
  };

  // Helper function to filter spam before counting
  const getNonSpamNFTs = (nfts: MoralisNFT[]) => {
    return nfts.filter(nft => !isSpamNFT(nft));
  };

  // Get network balances for filtering
  const networkData = useMemo(() => {
    const data = Object.entries(nftsByChain || {}).map(([network, nfts]) => {
      const displayNfts = hideSpam ? getNonSpamNFTs(nfts) : nfts;
      return {
        network,
        count: displayNfts.length,
      };
    });
    
    // Sort by count (highest to lowest)
    return data.sort((a, b) => b.count - a.count);
  }, [nftsByChain, hideSpam]);

  // Map chain names to OpenSea chain identifiers
  const getOpenSeaChain = (chain: string): string => {
    const chainMap: Record<string, string> = {
      'Ethereum': 'ethereum',
      'Polygon': 'matic',
      'Avalanche': 'avalanche',
      'BSC': 'bsc',
      'Arbitrum': 'arbitrum',
      'Optimism': 'optimism',
      'Base': 'base',
      'Fantom': 'fantom',
    };
    return chainMap[chain] || chain.toLowerCase();
  };

  // Filter NFTs by selected network and spam filter, and add chain info
  const displayNFTs = (selectedNetwork
    ? (nftsByChain?.[selectedNetwork] || []).map(nft => ({ ...nft, chain: selectedNetwork }))
    : Object.entries(nftsByChain || {}).flatMap(([chain, nfts]) => 
        nfts.map(nft => ({ ...nft, chain }))
      )
  ).filter(nft => !hideSpam || !isSpamNFT(nft));

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">NFT Collection</h1>
          <p className="text-muted-foreground">Your digital art and collectibles</p>
        </div>
        <Button
          variant={hideSpam ? "default" : "outline"}
          onClick={() => setHideSpam(!hideSpam)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {hideSpam ? "Hide Spam" : "Show Hidden NFTs"}
        </Button>
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
              
              const imageUrl = metadata.image || getImageUrl(nft) || '';
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
                      href={`https://opensea.io/assets/${getOpenSeaChain(nft.chain || 'Ethereum')}/${nft.token_address}/${nft.token_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      View on OpenSea
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
