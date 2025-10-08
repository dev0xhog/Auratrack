/**
 * Format a number with commas for better readability
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format USD value with $ sign and commas
 */
export const formatUSD = (value: number): string => {
  return `$${formatNumber(value, 2)}`;
};

/**
 * Format token balance with appropriate decimal places
 */
export const formatBalance = (balance: number, decimals: number = 4): string => {
  if (balance === 0) return '0';
  if (balance < 0.0001) return '<0.0001';
  return formatNumber(balance, decimals);
};

/**
 * Format percentage with + or - sign
 */
export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatNumber(value, 2)}%`;
};
