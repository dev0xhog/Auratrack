import { type MoralisNFT } from "@/hooks/useMoralisNFTsByChain";

// Multiple IPFS gateways for better reliability
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
];

export const getImageUrl = (nft: MoralisNFT, gatewayIndex = 0): string | null => {
  const metadata = typeof nft.normalized_metadata === 'object' 
    ? nft.normalized_metadata 
    : nft.metadata && typeof nft.metadata === 'object' 
    ? nft.metadata 
    : null;

  if (metadata?.image) {
    let imageUrl = metadata.image;
    
    // Handle IPFS URLs with fallback gateways
    if (imageUrl.startsWith('ipfs://')) {
      const ipfsHash = imageUrl.replace('ipfs://', '');
      return IPFS_GATEWAYS[gatewayIndex % IPFS_GATEWAYS.length] + ipfsHash;
    }
    
    // Handle relative IPFS paths
    if (imageUrl.startsWith('/ipfs/')) {
      return IPFS_GATEWAYS[gatewayIndex % IPFS_GATEWAYS.length] + imageUrl.slice(6);
    }
    
    return imageUrl;
  }
  
  return null;
};

export const isSpamNFT = (nft: MoralisNFT): boolean => {
  // Trust Moralis verification first
  if (nft.verified_collection === true) return false;
  if (nft.possible_spam === true) return true;

  const metadata = typeof nft.normalized_metadata === 'object' 
    ? nft.normalized_metadata 
    : nft.metadata && typeof nft.metadata === 'object' 
    ? nft.metadata 
    : null;

  const imageUrl = getImageUrl(nft);
  const name = (nft.name || metadata?.name || '').toLowerCase();
  const tokenId = nft.token_id || '';
  
  // Spam indicators
  const spamKeywords = [
    'airdrop', 'claim', 'bonus', 'free', 'reward', 'visit',
    '.com', '.io', '$', 'free eth', 'voucher', 'prize'
  ];
  
  const checks = [
    tokenId.length > 50, // Extremely large token IDs
    !imageUrl && !name, // No image AND no name
    spamKeywords.some(keyword => name.includes(keyword)),
    imageUrl && (imageUrl.includes('data:application') || imageUrl.includes('base64')),
  ];
  
  return checks.filter(Boolean).length >= 2; // More strict: need 2+ indicators
};

export const getOpenSeaChain = (chain: string): string => {
  const chainMap: Record<string, string> = {
    'Ethereum': 'ethereum',
    'Polygon': 'matic',
    'Avalanche': 'avalanche',
    'BNB Chain': 'bsc',
    'BSC': 'bsc',
    'Arbitrum': 'arbitrum',
    'Optimism': 'optimism',
    'Base': 'base',
    'Fantom': 'fantom',
  };
  return chainMap[chain] || chain.toLowerCase();
};

export const getNFTMetadata = (nft: MoralisNFT) => {
  const metadata = typeof nft.metadata === 'string' 
    ? (() => { try { return JSON.parse(nft.metadata); } catch { return {}; } })()
    : nft.metadata || nft.normalized_metadata || {};
  
  return {
    name: metadata.name || nft.name || `#${nft.token_id}`,
    description: metadata.description || '',
    image: metadata.image || getImageUrl(nft) || '',
    attributes: metadata.attributes || [],
  };
};
