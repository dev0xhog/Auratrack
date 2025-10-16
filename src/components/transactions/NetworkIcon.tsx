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
    if (chain === "linea") return "https://assets.coingecko.com/coins/images/31038/standard/linea.png";
    if (chain === "cronos") return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cronos/info/logo.png";
    if (chain === "gnosis") return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/xdai/info/logo.png";
    if (chain === "chiliz") return "https://assets.coingecko.com/coins/images/8834/standard/Chiliz.png";
    if (chain === "moonbeam") return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/moonbeam/info/logo.png";
    if (chain === "moonriver") return "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/moonriver/info/logo.png";
    if (chain === "flow") return "https://assets.coingecko.com/coins/images/13446/standard/5f6294c0c7a8cda55cb1c936_Flow_Wordmark.png";
    if (chain === "ronin") return "https://assets.coingecko.com/coins/images/20009/standard/ronin.png";
    if (chain === "lisk") return "https://assets.coingecko.com/coins/images/385/standard/Lisk_Symbol.png";
    if (chain === "pulsechain") return "https://assets.coingecko.com/coins/images/26899/standard/pulsechain.jpeg";
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
    if (chain === "linea") return "#121212";
    if (chain === "cronos") return "#002D74";
    if (chain === "gnosis") return "#04795B";
    if (chain === "chiliz") return "#CD0124";
    if (chain === "moonbeam") return "#53CBC9";
    if (chain === "moonriver") return "#F2B705";
    if (chain === "flow") return "#00EF8B";
    if (chain === "ronin") return "#1273EA";
    if (chain === "lisk") return "#0D47A1";
    if (chain === "pulsechain") return "#32D4F4";
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
    if (chain === "linea") return "L";
    if (chain === "cronos") return "CR";
    if (chain === "gnosis") return "GN";
    if (chain === "chiliz") return "CH";
    if (chain === "moonbeam") return "MB";
    if (chain === "moonriver") return "MR";
    if (chain === "flow") return "FL";
    if (chain === "ronin") return "RO";
    if (chain === "lisk") return "LS";
    if (chain === "pulsechain") return "PL";
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
