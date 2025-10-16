import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, ExternalLink } from "lucide-react";
import { type MoralisNFT } from "@/hooks/useMoralisNFTsByChain";
import { getImageUrl, getOpenSeaChain, getNFTMetadata } from "@/lib/nftHelpers";
import { formatUSD } from "@/lib/formatters";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface NFTCardProps {
  nft: MoralisNFT & { chain?: string };
}

export const NFTCard = ({ nft }: NFTCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [gatewayIndex, setGatewayIndex] = useState(0);
  const metadata = getNFTMetadata(nft);

  const handleImageError = () => {
    const nextIndex = gatewayIndex + 1;
    if (nextIndex < 3) {
      // Try next IPFS gateway
      setGatewayIndex(nextIndex);
    } else {
      setImageError(true);
    }
  };

  const imageUrl = getImageUrl(nft, gatewayIndex);

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <Card className="overflow-hidden hover:shadow-lg hover:-translate-y-2 transition-smooth cursor-pointer">
          <div className="aspect-square bg-muted relative group">
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
                <Image className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            {nft.verified_collection && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                  Verified
                </Badge>
              </div>
            )}
            {nft.chain && (
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="bg-background/90">
                  {nft.chain}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate" title={metadata.name}>
                  {metadata.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {nft.symbol || 'Unknown Collection'}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0">
                {nft.contract_type}
              </Badge>
            </div>

            {metadata.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {metadata.description}
              </p>
            )}

            <div className="flex items-center justify-between gap-2 pt-2 border-t">
              {nft.floor_price_usd ? (
                <div>
                  <p className="text-xs text-muted-foreground">Floor Price</p>
                  <p className="text-sm font-semibold">{formatUSD(nft.floor_price_usd)}</p>
                </div>
              ) : (
                <div />
              )}
              
              {nft.amount && parseInt(nft.amount) > 1 && (
                <Badge variant="secondary">
                  x{nft.amount}
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-96" side="top">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-lg">{metadata.name}</h4>
            <p className="text-sm text-muted-foreground">
              {nft.symbol || 'Unknown Collection'}
            </p>
          </div>

          {metadata.description && (
            <div>
              <p className="text-sm font-medium mb-1">Description</p>
              <p className="text-sm text-muted-foreground">{metadata.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Token ID</p>
              <p className="text-sm font-mono truncate">{nft.token_id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Type</p>
              <p className="text-sm">{nft.contract_type}</p>
            </div>
            {nft.chain && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Network</p>
                <p className="text-sm">{nft.chain}</p>
              </div>
            )}
            {nft.floor_price_usd && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Floor Price</p>
                <p className="text-sm font-semibold">{formatUSD(nft.floor_price_usd)}</p>
              </div>
            )}
          </div>

          {metadata.attributes && metadata.attributes.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Attributes</p>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {metadata.attributes.map((attr, idx) => (
                  <div key={idx} className="p-2 bg-muted rounded">
                    <p className="text-xs text-muted-foreground">{attr.trait_type}</p>
                    <p className="text-sm font-medium truncate">{attr.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <a
            href={`https://opensea.io/assets/${getOpenSeaChain(nft.chain || 'Ethereum')}/${nft.token_address}/${nft.token_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View on OpenSea
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
