import { useState, useEffect } from "react";
import { Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  // Try to fetch logo from Trust Wallet CDN first, then Moralis proxy as fallback
  useEffect(() => {
    const fetchTokenLogo = async () => {
      if (!address || !network || !imageError || fallbackSrc) return;

      const networkLower = (network || "").toLowerCase();

      // Hardcoded fallbacks for Mantle tokens (not supported by Trust Wallet or Moralis)
      if (networkLower.includes("mantle") && address) {
        const mantleTokenLogos: { [key: string]: string } = {
          "0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8": "https://s2.coinmarketcap.com/static/img/coins/64x64/27075.png", // WMNT
          "0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9": "https://assets.coingecko.com/coins/images/6319/small/usdc.png", // USDC
          "0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111":
            "https://assets.coingecko.com/coins/images/279/small/ethereum.png", // WETH
          "0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000": "https://s2.coinmarketcap.com/static/img/coins/64x64/27075.png", // MNT
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

      // Skip native tokens (zero address or dead addresses)
      if (address === "0x0000000000000000000000000000000000000000" || address?.toLowerCase().includes("dead")) return;

      // Map network to Trust Wallet blockchain names
      const networkToTrustWallet: { [key: string]: string } = {
        ethereum: "ethereum",
        polygon: "polygon",
        bsc: "smartchain",
        binance: "smartchain",
        avalanche: "avalanchec",
        arbitrum: "arbitrum",
        optimism: "optimism",
        base: "base",
        fantom: "fantom",
      };

      const trustWalletChain = Object.entries(networkToTrustWallet).find(([key]) => networkLower.includes(key))?.[1];

      // Try Trust Wallet CDN first (no API key needed)
      if (trustWalletChain && address) {
        const trustWalletUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${trustWalletChain}/assets/${address}/logo.png`;
        console.log(`Trying Trust Wallet CDN for ${symbol}: ${trustWalletUrl}`);

        try {
          const img = new Image();
          img.onload = () => {
            console.log(`Found logo on Trust Wallet CDN for ${symbol}`);
            setFallbackSrc(trustWalletUrl);
            setImageError(false);
            setIsLoading(true);
          };
          img.onerror = async () => {
            console.log(`Trust Wallet CDN failed for ${symbol}, trying Moralis proxy`);
            await tryMoralisProxy();
          };
          img.src = trustWalletUrl;
          return;
        } catch (error) {
          console.log(`Trust Wallet CDN error for ${symbol}:`, error);
        }
      }

      await tryMoralisProxy();

      async function tryMoralisProxy() {
        // Map network to Moralis chain names for proxy
        const networkToMoralisChain: { [key: string]: string } = {
          ethereum: "eth",
          polygon: "polygon",
          bsc: "bsc",
          binance: "bsc",
          avalanche: "avalanche",
          arbitrum: "arbitrum",
          optimism: "optimism",
          base: "base",
          fantom: "fantom",
        };

        const moralisChain = Object.entries(networkToMoralisChain).find(([key]) => networkLower.includes(key))?.[1];

        if (!moralisChain) {
          console.log(`No Moralis chain found for network: ${network}`);
          return;
        }

        try {
          console.log(`Fetching from Moralis proxy for ${symbol} (${address}) on chain ${moralisChain}`);
          
          const { data, error } = await supabase.functions.invoke('moralis-proxy', {
            body: { 
              endpoint: `/erc20/metadata`,
              chain: moralisChain,
              addresses: address
            }
          });

          if (error) {
            console.error(`Moralis proxy error for ${symbol}:`, error);
            return;
          }

          console.log(`Moralis response for ${symbol}:`, data);
          if (data && Array.isArray(data) && data.length > 0 && data[0]?.logo) {
            console.log(`Found Moralis logo for ${symbol}: ${data[0].logo}`);
            setFallbackSrc(data[0].logo);
            setImageError(false);
            setIsLoading(true);
          } else {
            console.log(`No logo in Moralis response for ${symbol}`);
          }
        } catch (error) {
          console.error(`Failed to fetch Moralis logo for ${symbol}:`, error);
        }
      }
    };

    fetchTokenLogo();
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
