import { useState } from "react";
import { Coins } from "lucide-react";

interface TokenLogoProps {
  src?: string;
  symbol: string;
  size?: "sm" | "md" | "lg";
}

export const TokenLogo = ({ src, symbol, size = "md" }: TokenLogoProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  // Show placeholder if no src or image failed to load
  if (!src || imageError) {
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
        src={src}
        alt={`${symbol} logo`}
        className={`${sizeClasses[size]} rounded-full object-cover`}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};
