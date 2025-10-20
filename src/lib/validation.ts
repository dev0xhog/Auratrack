/**
 * Input validation utilities for security and data integrity
 */

/**
 * Validates Ethereum wallet address format
 * Prevents injection attacks and ensures proper format
 */
export const isValidEthereumAddress = (address: string | undefined | null): boolean => {
  if (!address) return false;
  
  // Remove any whitespace
  const cleaned = address.trim();
  
  // Check if it matches Ethereum address format (0x followed by 40 hex characters)
  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  
  return ethereumAddressRegex.test(cleaned);
};

/**
 * Sanitizes wallet address input
 * Removes potentially dangerous characters while preserving valid address
 */
export const sanitizeAddress = (address: string | undefined | null): string => {
  if (!address) return '';
  
  // Remove whitespace and convert to lowercase for consistency
  const cleaned = address.trim().toLowerCase();
  
  // Only allow valid hex characters and 0x prefix
  return cleaned.replace(/[^0x0-9a-f]/gi, '');
};

/**
 * Validates and sanitizes wallet address
 * Returns sanitized address if valid, null otherwise
 */
export const validateAndSanitizeAddress = (address: string | undefined | null): string | null => {
  if (!address) return null;
  
  const sanitized = sanitizeAddress(address);
  
  return isValidEthereumAddress(sanitized) ? sanitized : null;
};

/**
 * Validates chain identifier
 * Ensures chain parameter is from allowed list to prevent injection
 */
export const isValidChain = (chain: string, allowedChains: string[]): boolean => {
  return allowedChains.includes(chain.toLowerCase());
};

/**
 * Sanitizes numeric input for limits and pagination
 * Prevents injection through numeric parameters
 */
export const sanitizeNumericLimit = (limit: number | string, min = 1, max = 100): number => {
  const parsed = typeof limit === 'string' ? parseInt(limit, 10) : limit;
  
  if (isNaN(parsed)) return min;
  
  return Math.min(Math.max(parsed, min), max);
};
