import { useState, useEffect } from "react";
import { Coins } from "lucide-react";

interface TokenLogoProps {
  src?: string;
  symbol: string;
  size?: "sm" | "md" | "lg";
  address?: string;
  network?: string;
}

export const TokenLogo = ({ src, symbol, size = "md", address, network }: TokenLogoProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  // Try to fetch logo from Moralis when TrustWallet fails
  useEffect(() => {
    const fetchMoralisLogo = async () => {
      if (!address || !network || !imageError || fallbackSrc) return;
      
      // Skip native tokens (zero address)
      if (address === '0x0000000000000000000000000000000000000000') return;
      
      // Map network to Moralis chain ID
      const networkToMoralis: { [key: string]: string } = {
        'ethereum': '0x1',
        'polygon': '0x89',
        'bsc': '0x38',
        'binance': '0x38',
        'avalanche': '0xa86a',
        'arbitrum': '0xa4b1',
        'optimism': '0xa',
        'op mainnet': '0xa',
        'base': '0x2105',
        'fantom': '0xfa',
        'mantle': '0x1388',
      };
      
      const networkLower = (network || '').toLowerCase();
      const chainId = Object.entries(networkToMoralis).find(([key]) => 
        networkLower.includes(key)
      )?.[1];
      
      if (!chainId) {
        console.log(`No Moralis chain ID found for network: ${network}`);
        return;
      }
      
      try {
        const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYxYjUxMzI5LTRiOGUtNDg0Mi04MDRiLTFiMDYwYjAxOTBmYyIsIm9yZ0lkIjoiNDc0NzMxIiwidXNlcklkIjoiNDg4Mzc2IiwidHlwZUlkIjoiMjU4NjVkNGItMDQzYi00MjQ4LThmNGEtMzUxNzIxOTlkNjM1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk5MDQxOTYsImV4cCI6NDkxNTY2NDE5Nn0.e9nc8F3W4pCQCw-25-dRuam_IQsiEjd6ENEm9PLYjzQ";
        console.log(`Fetching Moralis logo for ${symbol} (${address}) on chain ${chainId}`);
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
          console.log(`Moralis response for ${symbol}:`, data);
          if (data && Array.isArray(data) && data.length > 0 && data[0]?.logo) {
            console.log(`Found Moralis logo for ${symbol}: ${data[0].logo}`);
            setFallbackSrc(data[0].logo);
            setImageError(false);
            setIsLoading(true); // Reset loading state to load new image
          } else {
            console.log(`No logo in Moralis response for ${symbol}`);
          }
        } else {
          console.error(`Moralis API error for ${symbol}: ${response.status}`);
        }
      } catch (error) {
        console.error(`Failed to fetch Moralis logo for ${symbol}:`, error);
      }
    };
    
    fetchMoralisLogo();
  }, [address, network, imageError, fallbackSrc, symbol]);

  const logoSrc = fallbackSrc || src;

  // Show placeholder if no src or image failed to load
  if (!logoSrc || (imageError && !fallbackSrc)) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary`}
      >
        {symbol.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
      {isLoading && (
        <div className="absolute inset-0 rounded-full bg-muted animate-pulse" />
      )}
      <img
        src={logoSrc}
        alt={`${symbol} logo`}
        className={`${sizeClasses[size]} rounded-full object-cover`}
        onError={() => {
          if (fallbackSrc) {
            // If the fallback also failed, show placeholder
            setImageError(true);
            setIsLoading(false);
          } else {
            // First time error, trigger Moralis fetch
            setImageError(true);
            setIsLoading(false);
          }
        }}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};
