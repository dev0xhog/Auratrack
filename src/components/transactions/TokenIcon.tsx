import { useState, useEffect } from "react";

interface TokenIconProps {
  logoUrl?: string;
  symbol?: string;
  className?: string;
  address?: string;
  network?: string;
}

export const TokenIcon = ({ logoUrl, symbol, className = "h-8 w-8", address, network }: TokenIconProps) => {
  const [imageError, setImageError] = useState(!logoUrl); // Start with error if no logoUrl
  const [isLoading, setIsLoading] = useState(false);
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);

  // Reset states when props change
  useEffect(() => {
    if (logoUrl) {
      setImageError(false);
      setIsLoading(true);
      setFallbackSrc(null);
    } else {
      // No logo provided, immediately try to fetch from Moralis
      setImageError(true);
      setIsLoading(false);
      setFallbackSrc(null);
    }
  }, [logoUrl, address, network]);

  // Try to fetch logo from TrustWallet CDN first, then Moralis when initial logo fails or is missing
  useEffect(() => {
    const fetchTokenLogo = async () => {
      if (!address || !network) {
        return;
      }
      
      if (!imageError || fallbackSrc) {
        return;
      }
      
      const networkLower = (network || '').toLowerCase();
      
      // Skip native/dead address tokens
      if (address === '0x0000000000000000000000000000000000000000' || 
          address?.toLowerCase().includes('dead')) {
        return;
      }
      
      // Map network/chain codes to TrustWallet blockchain names
      const networkToTrustWallet: { [key: string]: string } = {
        'eth': 'ethereum',
        'ethereum': 'ethereum',
        'polygon': 'polygon',
        'bsc': 'smartchain',
        'binance': 'smartchain',
        'avalanche': 'avalanchec',
        'arbitrum': 'arbitrum',
        'optimism': 'optimism',
        'base': 'base',
        'fantom': 'fantom',
        'linea': 'linea',
        'cronos': 'cronos',
        'gnosis': 'xdai',
        'moonbeam': 'moonbeam',
        'moonriver': 'moonriver',
      };
      
      const trustWalletChain = networkToTrustWallet[networkLower];
      
      // Try TrustWallet CDN first
      if (trustWalletChain && address) {
        const trustWalletUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${trustWalletChain}/assets/${address}/logo.png`;
        
        try {
          const response = await fetch(trustWalletUrl, { method: 'HEAD' });
          if (response.ok) {
            setFallbackSrc(trustWalletUrl);
            setImageError(false);
            setIsLoading(true);
            return;
          }
        } catch (error) {
          // Silently fail and try Moralis
        }
      }
      
      // Map network/chain codes to Moralis chain IDs as fallback
      const networkToMoralis: { [key: string]: string } = {
        'eth': '0x1',
        'ethereum': '0x1',
        'polygon': '0x89',
        'bsc': '0x38',
        'binance': '0x38',
        'avalanche': '0xa86a',
        'arbitrum': '0xa4b1',
        'optimism': '0xa',
        'base': '0x2105',
        'fantom': '0xfa',
        'linea': '0xe708',
        'cronos': '0x19',
        'gnosis': '0x64',
        'chiliz': '0x15b38',
        'moonbeam': '0x504',
        'moonriver': '0x505',
        'flow': '0x2eb',
        'ronin': '0x7e4',
        'lisk': '0x46f',
        'pulsechain': '0x171',
      };
      
      const chainId = networkToMoralis[networkLower];
      
      if (!chainId) {
        return;
      }
      
      try {
        const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYxYjUxMzI5LTRiOGUtNDg0Mi04MDRiLTFiMDYwYjAxOTBmYyIsIm9yZ0lkIjoiNDc0NzMxIiwidXNlcklkIjoiNDg4Mzc2IiwidHlwZUlkIjoiMjU4NjVkNGItMDQzYi00MjQ4LThmNGEtMzUxNzIxOTlkNjM1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk5MDQxOTYsImV4cCI6NDkxNTY2NDE5Nn0.e9nc8F3W4pCQCw-25-dRuam_IQsiEjd6ENEm9PLYjzQ";
        
        const response = await fetch(
          `https://deep-index.moralis.io/api/v2.2/erc20/metadata?chain=${chainId}&addresses=${address}`,
          {
            headers: {
              "X-API-Key": apiKey,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && Array.isArray(data) && data.length > 0 && data[0]?.logo) {
            setFallbackSrc(data[0].logo);
            setImageError(false);
            setIsLoading(true);
          }
        }
      } catch (error) {
        // Silently fail - will show placeholder
      }
    };
    
    fetchTokenLogo();
  }, [address, network, imageError, fallbackSrc, symbol]);

  const logoSrc = fallbackSrc || logoUrl;

  // Show placeholder if no src or image failed to load
  if (!logoSrc || (imageError && !fallbackSrc)) {
    const initial = symbol ? symbol.charAt(0).toUpperCase() : '?';
    return (
      <div 
        className={`${className} rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm`}
      >
        {initial}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      {isLoading && (
        <div className={`${className} absolute inset-0 rounded-full bg-muted animate-pulse`} />
      )}
      <img 
        src={logoSrc} 
        alt={symbol || 'Token'} 
        className={`${className} rounded-full object-cover`}
        onError={() => {
          if (fallbackSrc) {
            // Fallback also failed, show placeholder
            setImageError(true);
            setIsLoading(false);
          } else {
            // First error, trigger Moralis fetch
            setImageError(true);
            setIsLoading(false);
          }
        }}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};
