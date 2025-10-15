import { useState } from "react";

interface NetworkIconProps {
  chain: string;
  className?: string;
}

export const NetworkIcon = ({ chain, className = "h-5 w-5" }: NetworkIconProps) => {
  const [imageError, setImageError] = useState(false);

  const getNetworkLogo = (chain: string) => {
    // Use TrustWallet assets for network logos
    if (chain === "eth") return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png";
    if (chain === "polygon") return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png";
    if (chain === "bsc") return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png";
    if (chain === "avalanche") return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png";
    if (chain === "fantom") return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/fantom/info/logo.png";
    if (chain === "arbitrum") return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png";
    if (chain === "optimism") return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png";
    if (chain === "base") return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png";
    return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png";
  };

  const getNetworkColor = (chain: string) => {
    if (chain === "eth") return "#627EEA";
    if (chain === "polygon") return "#8247E5";
    if (chain === "bsc") return "#F3BA2F";
    if (chain === "avalanche") return "#E84142";
    if (chain === "fantom") return "#1969FF";
    if (chain === "arbitrum") return "#28A0F0";
    if (chain === "optimism") return "#FF0420";
    if (chain === "base") return "#0052FF";
    return "#627EEA";
  };

  const getNetworkInitial = (chain: string) => {
    if (chain === "eth") return "E";
    if (chain === "polygon") return "P";
    if (chain === "bsc") return "B";
    if (chain === "avalanche") return "A";
    if (chain === "fantom") return "F";
    if (chain === "arbitrum") return "AR";
    if (chain === "optimism") return "OP";
    if (chain === "base") return "BA";
    return "E";
  };

  // Fallback to colored circle with initials if image fails to load
  if (imageError) {
    return (
      <div
        className={`${className} rounded-full flex items-center justify-center font-bold text-white text-xs`}
        style={{ backgroundColor: getNetworkColor(chain) }}
      >
        {getNetworkInitial(chain)}
      </div>
    );
  }

  return (
    <img
      src={getNetworkLogo(chain)}
      alt={`${chain} logo`}
      className={`${className} rounded-full object-cover`}
      onError={() => setImageError(true)}
    />
  );
};
