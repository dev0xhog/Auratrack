import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, ExternalLink } from "lucide-react";
import { type MoralisNFT } from "@/hooks/useMoralisNFTsByChain";
import { getImageUrl, getOpenSeaChain, getNFTMetadata } from "@/lib/nftHelpers";
import { formatUSD } from "@/lib/formatters";

interface NFTListViewProps {
  nfts: (MoralisNFT & { chain?: string })[];
}

export const NFTListView = ({ nfts }: NFTListViewProps) => {
  return (
    <div className="space-y-3">
      {nfts.map((nft, index) => (
        <NFTListItem key={`${nft.token_address}-${nft.token_id}-${index}`} nft={nft} />
      ))}
    </div>
  );
};

interface NFTListItemProps {
  nft: MoralisNFT & { chain?: string };
}

const NFTListItem = ({ nft }: NFTListItemProps) => {
  const [imageError, setImageError] = useState(false);
  const [gatewayIndex, setGatewayIndex] = useState(0);
  const metadata = getNFTMetadata(nft);

  const handleImageError = () => {
    const nextIndex = gatewayIndex + 1;
    if (nextIndex < 3) {
      setGatewayIndex(nextIndex);
    } else {
      setImageError(true);
    }
  };

  const imageUrl = getImageUrl(nft, gatewayIndex);

  return (
    <Card className="p-4 hover:shadow-md transition-smooth">
      <div className="flex gap-4">
        <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 relative overflow-hidden">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={metadata.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          {nft.verified_collection && (
            <div className="absolute top-1 right-1">
              <Badge variant="secondary" className="bg-primary/90 text-primary-foreground text-xs py-0">
                ✓
              </Badge>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1">{metadata.name}</h3>
              <p className="text-sm text-muted-foreground">
                {nft.symbol || 'Unknown Collection'}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {nft.chain && (
                <Badge variant="secondary">{nft.chain}</Badge>
              )}
              <Badge variant="outline">{nft.contract_type}</Badge>
            </div>
          </div>

          {metadata.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {metadata.description}
            </p>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {nft.floor_price_usd ? (
                <div>
                  <p className="text-xs text-muted-foreground">Floor Price</p>
                  <p className="text-sm font-semibold">{formatUSD(nft.floor_price_usd)}</p>
                </div>
              ) : null}
              
              {nft.amount && parseInt(nft.amount) > 1 && (
                <div>
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className="text-sm font-semibold">x{nft.amount}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground">Token ID</p>
                <p className="text-sm font-mono">{nft.token_id.length > 10 ? `${nft.token_id.slice(0, 10)}...` : nft.token_id}</p>
              </div>
            </div>

            <a
              href={`https://opensea.io/assets/${getOpenSeaChain(nft.chain || 'Ethereum')}/${nft.token_address}/${nft.token_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline flex-shrink-0"
            >
              View on OpenSea
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
};
