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

      const networkLower = (network || "").toLowerCase();

      // Hardcoded fallbacks for Mantle tokens (Moralis doesn't support Mantle yet)
      if (networkLower.includes("mantle") && address) {
        const mantleTokenLogos: { [key: string]: string } = {
          "0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8": "https://s2.coinmarketcap.com/static/img/coins/64x64/27075.png", // WMNT
          "0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9": "https://assets.coingecko.com/coins/images/6319/small/usdc.png", // USDC
          "0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111":
            "https://assets.coingecko.com/coins/images/279/small/ethereum.png", // WETH (lowercase d in dead)
          "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000": "https://s2.coinmarketcap.com/static/img/coins/64x64/27075.png", // MNT (native)
        };

        const logo = mantleTokenLogos[address.toLowerCase()];
        if (logo) {
          console.log(`Using hardcoded logo for Mantle ${symbol}: ${logo}`);
          setFallbackSrc(logo);
          setImageError(false);
          setIsLoading(true);
          return;
        }
      }

      // Skip native tokens (zero address or dead addresses) for other networks
      if (address === "0x0000000000000000000000000000000000000000" || address?.toLowerCase().includes("dead")) return;

      // Map network to Moralis chain ID
      const networkToMoralis: { [key: string]: string } = {
        ethereum: "0x1",
        polygon: "0x89",
        bsc: "0x38",
        binance: "0x38",
        avalanche: "0xa86a",
        arbitrum: "0xa4b1",
        optimism: "0xa",
        "op mainnet": "0xa",
        base: "0x2105",
        fantom: "0xfa",
      };

      const chainId = Object.entries(networkToMoralis).find(([key]) => networkLower.includes(key))?.[1];

      if (!chainId) {
        console.log(`No Moralis chain ID found for network: ${network}`);
        return;
      }

      try {
        const apiKey = import.meta.env.VITE_MORALIS_API_KEY;
        console.log(`Fetching Moralis logo for ${symbol} (${address}) on chain ${chainId}`);
        const response = await fetch(
          `https://deep-index.moralis.io/api/v2.2/erc20/metadata?chain=${chainId}&addresses=${address}`,
          {
            headers: {
              "X-API-Key": apiKey,
            },
          },
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
      {isLoading && <div className="absolute inset-0 rounded-full bg-muted animate-pulse" />}
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
