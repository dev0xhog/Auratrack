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
  const description = (metadata?.description || '').toLowerCase();
  const tokenId = nft.token_id || '';
  const symbol = (nft.symbol || '').toLowerCase();
  
  // Expanded spam keywords (common in removed NFTs)
  const spamKeywords = [
    'airdrop', 'claim', 'bonus', 'free', 'reward', 'visit',
    '.com', '.io', '.xyz', '.net', '$', 'voucher', 'prize',
    'redeem', 'gift', 'winner', 'congratulations', 'limited',
    'exclusive offer', 'click here', 'mint now', 'drop',
    'https://', 'http://', 'www.', 't.me', 'telegram'
  ];

  // Emoji spam indicators (common in phishing NFTs)
  const spamEmojis = ['🎁', '🎉', '💰', '🚀', '💎', '⚡', '🔥', '🎊', '💵', '💸'];
  const hasSpamEmoji = spamEmojis.some(emoji => name.includes(emoji) || description.includes(emoji));
  
  // Check for suspicious patterns
  const checks = [
    // Very high probability spam indicators
    tokenId.length > 50, // Extremely large token IDs (common in spam)
    !imageUrl && !name, // No image AND no name
    !nft.name && !symbol, // No name and no symbol (likely spam mint)
    hasSpamEmoji, // Contains spam emojis
    
    // Medium probability indicators
    spamKeywords.some(keyword => name.includes(keyword)),
    spamKeywords.some(keyword => description.includes(keyword)),
    spamKeywords.some(keyword => symbol.includes(keyword)),
    
    // Image-based indicators
    imageUrl && (
      imageUrl.includes('data:application') || 
      imageUrl.includes('base64') ||
      imageUrl.includes('blob:')
    ),
    
    // Suspicious patterns
    name.length > 100, // Extremely long names
    tokenId.length < 5 && parseInt(tokenId) > 100000, // Very high token IDs with short length
    
    // Floor price indicators (spam usually has no floor price)
    !nft.floor_price_usd && !nft.verified_collection && tokenId.length > 30,
  ];
  
  // Count spam indicators
  const spamScore = checks.filter(Boolean).length;
  
  // Be aggressive: if there's just 1 strong indicator, mark as spam
  return spamScore >= 1;
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
