interface TokenIconProps {
  logoUrl?: string;
  symbol?: string;
  className?: string;
}

export const TokenIcon = ({ logoUrl, symbol, className = "h-8 w-8" }: TokenIconProps) => {
  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt={symbol || 'Token'} 
        className={`${className} rounded-full`}
        onError={(e) => {
          // Fallback to placeholder if image fails to load
          e.currentTarget.style.display = 'none';
          const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
          if (placeholder) placeholder.style.display = 'flex';
        }}
      />
    );
  }

  // Placeholder with first letter
  const initial = symbol ? symbol.charAt(0).toUpperCase() : '?';
  
  return (
    <div 
      className={`${className} rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-sm`}
    >
      {initial}
    </div>
  );
};
