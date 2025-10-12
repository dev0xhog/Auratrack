interface NetworkIconProps {
  chain: string;
  className?: string;
}

export const NetworkIcon = ({ chain, className = "h-5 w-5" }: NetworkIconProps) => {
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

  return (
    <div
      className={`${className} rounded-full flex items-center justify-center font-bold text-white text-xs`}
      style={{ backgroundColor: getNetworkColor(chain) }}
    >
      {getNetworkInitial(chain)}
    </div>
  );
};
