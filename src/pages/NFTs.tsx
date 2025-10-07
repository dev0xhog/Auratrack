import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

const mockNFTs = [
  {
    id: "1",
    name: "Bored Ape #1234",
    collection: "Bored Ape Yacht Club",
    image: "https://images.unsplash.com/photo-1635002962298-b0c04f717f6c?w=400",
    chain: "Ethereum",
    value: "$50,000",
  },
  {
    id: "2",
    name: "CryptoPunk #5678",
    collection: "CryptoPunks",
    image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=400",
    chain: "Ethereum",
    value: "$75,000",
  },
  {
    id: "3",
    name: "Azuki #9012",
    collection: "Azuki",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
    chain: "Ethereum",
    value: "$20,000",
  },
  {
    id: "4",
    name: "Doodle #3456",
    collection: "Doodles",
    image: "https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400",
    chain: "Ethereum",
    value: "$15,000",
  },
];

const NFTs = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">NFT Collection</h1>
        <p className="text-muted-foreground">Your digital art and collectibles</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockNFTs.map((nft) => (
          <Card
            key={nft.id}
            className="gradient-card border-border/40 overflow-hidden transition-smooth hover:border-primary/40 hover:scale-105"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={nft.image}
                alt={nft.name}
                className="h-full w-full object-cover transition-transform hover:scale-110"
              />
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold mb-1">{nft.name}</h3>
                <p className="text-sm text-muted-foreground">{nft.collection}</p>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline">{nft.chain}</Badge>
                <p className="text-sm font-semibold text-primary">{nft.value}</p>
              </div>
              <a
                href="#"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
              >
                View Details
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NFTs;
