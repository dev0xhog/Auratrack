import { useState, useEffect } from "react";

interface TokenIconProps {
  logoUrl?: string;
  symbol?: string;
  className?: string;
  address?: string;
  network?: string;
}

export const TokenIcon = ({ logoUrl, symbol, className = "h-8 w-8", address, network }: TokenIconProps) => {
  const [displayLogo, setDisplayLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const fetchLogo = async () => {
      // Always try to get the best logo
      if (!address || !network) {
        setIsLoading(false);
        return;
      }

      const networkLower = network.toLowerCase();
      
      // Hardcoded logos for Mantle
      if (networkLower.includes('mantle')) {
        const mantleLogos: { [key: string]: string } = {
          '0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8': 'https://s2.coinmarketcap.com/static/img/coins/64x64/27075.png',
          '0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9': 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
          '0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
          '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000': 'https://s2.coinmarketcap.com/static/img/coins/64x64/27075.png',
        };
        
        const logo = mantleLogos[address.toLowerCase()];
        if (logo && mounted) {
          setDisplayLogo(logo);
          setIsLoading(false);
          return;
        }
      }

      // Skip zero/dead addresses
      if (address === '0x0000000000000000000000000000000000000000' || 
          address.toLowerCase().includes('dead')) {
        setIsLoading(false);
        return;
      }
      
      // Chain ID mapping
      const chainIds: { [key: string]: string } = {
        'eth': '0x1',
        'ethereum': '0x1',
        'polygon': '0x89',
        'bsc': '0x38',
        'avalanche': '0xa86a',
        'arbitrum': '0xa4b1',
        'optimism': '0xa',
        'base': '0x2105',
        'fantom': '0xfa',
      };
      
      const chainId = chainIds[networkLower];
      
      if (!chainId) {
        console.warn(`Unknown network: ${network}`);
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(
          `https://deep-index.moralis.io/api/v2.2/erc20/metadata?chain=${chainId}&addresses=${address}`,
          {
            headers: {
              "X-API-Key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYxYjUxMzI5LTRiOGUtNDg0Mi04MDRiLTFiMDYwYjAxOTBmYyIsIm9yZ0lkIjoiNDc0NzMxIiwidXNlcklkIjoiNDg4Mzc2IiwidHlwZUlkIjoiMjU4NjVkNGItMDQzYi00MjQ4LThmNGEtMzUxNzIxOTlkNjM1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk5MDQxOTYsImV4cCI6NDkxNTY2NDE5Nn0.e9nc8F3W4pCQCw-25-dRuam_IQsiEjd6ENEm9PLYjzQ",
            },
          }
        );
        
        if (response.ok && mounted) {
          const data = await response.json();
          if (data?.[0]?.logo) {
            setDisplayLogo(data[0].logo);
          } else if (logoUrl) {
            // Fallback to provided logo
            setDisplayLogo(logoUrl);
          }
        } else if (logoUrl && mounted) {
          // API failed, use provided logo
          setDisplayLogo(logoUrl);
        }
      } catch (error) {
        if (logoUrl && mounted) {
          setDisplayLogo(logoUrl);
        }
      }
      
      if (mounted) setIsLoading(false);
    };

    fetchLogo();
    
    return () => {
      mounted = false;
    };
  }, [address, network, logoUrl, symbol]);

  // Show placeholder
  if (!displayLogo || isLoading) {
    const initial = symbol ? symbol.charAt(0).toUpperCase() : '?';
    return (
      <div 
        className={`${className} rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm ${isLoading ? 'animate-pulse' : ''}`}
      >
        {initial}
      </div>
    );
  }

  return (
    <img 
      src={displayLogo} 
      alt={symbol || 'Token'} 
      className={`${className} rounded-full object-cover`}
      onError={() => setDisplayLogo(null)}
    />
  );
};
