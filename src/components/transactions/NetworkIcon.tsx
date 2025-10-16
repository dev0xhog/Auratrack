import { useState } from "react";

interface NetworkIconProps {
  chain: string;
  className?: string;
}

export const NetworkIcon = ({ chain, className = "h-5 w-5" }: NetworkIconProps) => {
  const [imageError, setImageError] = useState(false);

  const getNetworkLogo = (chain: string) => {
    // Use reliable logo sources
    const logos: { [key: string]: string } = {
      eth: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      polygon: "https://cryptologos.cc/logos/polygon-matic-logo.png",
      bsc: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
      avalanche: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
      fantom: "https://cryptologos.cc/logos/fantom-ftm-logo.png",
      arbitrum: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
      optimism: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png",
      base: "https://altcoinsbox.com/wp-content/uploads/2023/03/base-logo.png",
      linea: "https://assets-global.website-files.com/64d5a7fd71178d8b89fdb1e0/64d5aaeb4b6c55c955dafb85_linea-logo.png",
      cronos: "https://cryptologos.cc/logos/cronos-cro-logo.png",
      gnosis: "https://cryptologos.cc/logos/gnosis-gno-gno-logo.png",
      chiliz: "https://cryptologos.cc/logos/chiliz-chz-logo.png",
      moonbeam: "https://cryptologos.cc/logos/moonbeam-glmr-logo.png",
      moonriver: "https://cryptologos.cc/logos/moonriver-movr-logo.png",
      flow: "https://cryptologos.cc/logos/flow-flow-logo.png",
      ronin: "https://cdn.worldvectorlogo.com/logos/ronin-1.svg",
      lisk: "https://cryptologos.cc/logos/lisk-lsk-logo.png",
      pulsechain: "https://icons.llamao.fi/icons/chains/rsz_pulsechain.jpg",
    };
    
    return logos[chain] || logos.eth;
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
