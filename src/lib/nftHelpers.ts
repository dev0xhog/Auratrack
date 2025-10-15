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
  // Always trust verified collections
  if (nft.verified_collection === true) return false;
  
  // Trust Moralis spam detection
  if (nft.possible_spam === true) return true;

  const metadata = typeof nft.normalized_metadata === 'object' 
    ? nft.normalized_metadata 
    : nft.metadata && typeof nft.metadata === 'object' 
    ? nft.metadata 
    : null;

  const imageUrl = getImageUrl(nft);
  const name = (nft.name || metadata?.name || '').toLowerCase();
  const description = (metadata?.description || '').toLowerCase();
  const tokenId = nft.token_id || '';
  const symbol = (nft.symbol || '').toLowerCase();
  
  // High-confidence spam keywords (phishing/scam patterns)
  const highConfidenceSpam = [
    'https://', 'http://', 'www.', '.com', '.io', '.xyz',
    't.me', 'telegram', 'click here', 'visit', 'claim now'
  ];
  
  // Medium-confidence spam keywords
  const mediumConfidenceSpam = [
    'airdrop', 'free', 'reward', 'voucher', 'prize', 'winner',
    'redeem', 'gift', 'bonus', 'congratulations'
  ];

  // Strong indicators - any one of these is likely spam
  const hasHighConfidenceSpam = highConfidenceSpam.some(
    keyword => name.includes(keyword) || description.includes(keyword)
  );
  
  if (hasHighConfidenceSpam) return true;

  // Check for multiple medium indicators
  const mediumIndicators = [
    mediumConfidenceSpam.some(keyword => name.includes(keyword) || description.includes(keyword)),
    tokenId.length > 60, // Very large token IDs
    !imageUrl && !name && !symbol, // Complete lack of metadata
    name.length > 120, // Extremely long names
    imageUrl && (imageUrl.includes('data:application') || imageUrl.includes('base64')),
  ];
  
  const mediumScore = mediumIndicators.filter(Boolean).length;
  
  // Require 2+ medium indicators to mark as spam (more conservative)
  return mediumScore >= 2;
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
