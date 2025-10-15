import { useState, useEffect } from "react";

interface TokenIconProps {
  logoUrl?: string;
  symbol?: string;
  className?: string;
  address?: string;
  network?: string;
}

export const TokenIcon = ({ logoUrl, symbol, className = "h-8 w-8", address, network }: TokenIconProps) => {
  const [currentLogo, setCurrentLogo] = useState<string | null>(logoUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedMoralis, setHasFetchedMoralis] = useState(false);

  // Fetch from Moralis when logo fails or is missing
  const fetchMoralisLogo = async () => {
    if (!address || !network || hasFetchedMoralis) {
      return;
    }

    setHasFetchedMoralis(true);
    setIsLoading(true);

    const networkLower = network.toLowerCase();
    
    // Hardcoded fallbacks for Mantle tokens
    if (networkLower.includes('mantle')) {
      const mantleTokenLogos: { [key: string]: string } = {
        '0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8': 'https://s2.coinmarketcap.com/static/img/coins/64x64/27075.png',
        '0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9': 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
        '0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
        '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000': 'https://s2.coinmarketcap.com/static/img/coins/64x64/27075.png',
      };
      
      const logo = mantleTokenLogos[address.toLowerCase()];
      if (logo) {
        setCurrentLogo(logo);
        setIsLoading(false);
        return;
      }
    }

    // Skip native/dead addresses
    if (address === '0x0000000000000000000000000000000000000000' || 
        address.toLowerCase().includes('dead')) {
      setIsLoading(false);
      return;
    }
    
    // Map to Moralis chain IDs
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
    };
    
    const chainId = networkToMoralis[networkLower];
    
    if (!chainId) {
      console.warn(`No Moralis chain ID for network: ${network}`);
      setIsLoading(false);
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
          console.log(`✅ Found Moralis logo for ${symbol} on ${network}`);
          setCurrentLogo(data[0].logo);
        } else {
          console.log(`❌ No logo in Moralis for ${symbol} on ${network}`);
        }
      } else {
        console.error(`Moralis API error for ${symbol}: ${response.status}`);
      }
    } catch (error) {
      console.error(`Failed to fetch logo for ${symbol}:`, error);
    }
    
    setIsLoading(false);
  };

  // Fetch Moralis logo if no logo provided on mount
  useEffect(() => {
    if (!logoUrl && !hasFetchedMoralis) {
      fetchMoralisLogo();
    }
  }, []);

  // Handle image load error
  const handleImageError = () => {
    if (!hasFetchedMoralis) {
      // Try fetching from Moralis
      fetchMoralisLogo();
    } else {
      // Already tried Moralis, give up
      setCurrentLogo(null);
    }
  };

  // Show placeholder if no logo
  if (!currentLogo && !isLoading) {
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
      {currentLogo && (
        <img 
          src={currentLogo} 
          alt={symbol || 'Token'} 
          className={`${className} rounded-full object-cover`}
          onError={handleImageError}
          onLoad={() => setIsLoading(false)}
        />
      )}
    </div>
  );
};
