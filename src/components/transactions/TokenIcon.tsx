import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
        console.log(`TokenIcon: Missing address or network for ${symbol}`);
        return;
      }

      if (!imageError || fallbackSrc) {
        return;
      }

      const networkLower = (network || "").toLowerCase();
      console.log(`TokenIcon: Attempting to fetch logo for ${symbol} on ${network} (address: ${address})`);

      // Skip native/dead address tokens
      if (address === "0x0000000000000000000000000000000000000000" || address?.toLowerCase().includes("dead")) {
        console.log(`TokenIcon: Skipping dead/native address for ${symbol}`);
        return;
      }

      // Checksummed address for Trust Wallet (they use checksummed addresses)
      const checksumAddress = address; // Trust Wallet accepts both formats

      // Map network/chain codes to TrustWallet blockchain names
      const networkToTrustWallet: { [key: string]: string } = {
        eth: "ethereum",
        ethereum: "ethereum",
        polygon: "polygon",
        bsc: "smartchain",
        binance: "smartchain",
        avalanche: "avalanchec",
        arbitrum: "arbitrum",
        optimism: "optimism",
        base: "base",
        fantom: "fantom",
        linea: "linea",
        cronos: "cronos",
        gnosis: "xdai",
        moonbeam: "moonbeam",
        moonriver: "moonriver",
        flow: "flow",
        ronin: "ronin",
      };

      const trustWalletChain = networkToTrustWallet[networkLower];

      // Try TrustWallet CDN first (works without API key)
      if (trustWalletChain && checksumAddress) {
        const trustWalletUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${trustWalletChain}/assets/${checksumAddress}/logo.png`;
        console.log(`TokenIcon: Trying TrustWallet CDN: ${trustWalletUrl}`);

        try {
          // Try to load the image directly instead of HEAD request
          const img = new Image();
          img.onload = () => {
            console.log(`TokenIcon: Found logo on TrustWallet CDN for ${symbol}`);
            setFallbackSrc(trustWalletUrl);
            setImageError(false);
            setIsLoading(true);
          };
          img.onerror = async () => {
            console.log(`TokenIcon: TrustWallet CDN failed for ${symbol}, trying Moralis proxy`);
            await tryMoralisProxy();
          };
          img.src = trustWalletUrl;
          return;
        } catch (error) {
          console.log(`TokenIcon: TrustWallet CDN error for ${symbol}:`, error);
        }
      }

      await tryMoralisProxy();

      async function tryMoralisProxy() {
        // Map network/chain codes to Moralis chain names for proxy
        const networkToMoralisChain: { [key: string]: string } = {
          eth: "eth",
          ethereum: "eth",
          polygon: "polygon",
          bsc: "bsc",
          binance: "bsc",
          avalanche: "avalanche",
          arbitrum: "arbitrum",
          optimism: "optimism",
          base: "base",
          fantom: "fantom",
          linea: "linea",
          cronos: "cronos",
          gnosis: "gnosis",
          chiliz: "chiliz",
          moonbeam: "moonbeam",
          moonriver: "moonriver",
          flow: "flow",
          ronin: "ronin",
          lisk: "lisk",
          pulsechain: "pulsechain",
        };

        const moralisChain = networkToMoralisChain[networkLower];

        if (!moralisChain) {
          console.error(`TokenIcon: No Moralis chain found for network: ${network}`);
          return;
        }

        try {
          console.log(`TokenIcon: Fetching from Moralis proxy for ${symbol} on chain ${moralisChain}`);

          const { data, error } = await supabase.functions.invoke('moralis-proxy', {
            body: { 
              endpoint: `/erc20/metadata`,
              chain: moralisChain,
              addresses: checksumAddress
            }
          });

          if (error) {
            console.error(`TokenIcon: Moralis proxy error for ${symbol}:`, error);
            return;
          }

          console.log(`TokenIcon: Moralis response for ${symbol}:`, data);

          if (data && Array.isArray(data) && data.length > 0 && data[0]?.logo) {
            console.log(`TokenIcon: Found logo for ${symbol}: ${data[0].logo}`);
            setFallbackSrc(data[0].logo);
            setImageError(false);
            setIsLoading(true);
          } else {
            console.log(`TokenIcon: No logo in Moralis response for ${symbol}`);
          }
        } catch (error) {
          console.error(`TokenIcon: Failed to fetch Moralis logo for ${symbol}:`, error);
        }
      }
    };

    fetchTokenLogo();
  }, [address, network, imageError, fallbackSrc, symbol]);

  const logoSrc = fallbackSrc || logoUrl;

  // Show placeholder if no src or image failed to load
  if (!logoSrc || (imageError && !fallbackSrc)) {
    const initial = symbol ? symbol.charAt(0).toUpperCase() : "?";
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
      {isLoading && <div className={`${className} absolute inset-0 rounded-full bg-muted animate-pulse`} />}
      <img
        src={logoSrc}
        alt={symbol || "Token"}
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
