/**
 * API Configuration
 * 
 * IMPORTANT: Replace these placeholder values with your actual API keys
 * For production deployment, consider using environment-specific builds
 * or server-side proxy to protect sensitive keys
 */

export const API_KEYS = {
  // Moralis API Key - Get yours from https://moralis.io/
  // Used for blockchain data, NFTs, and transaction history
  MORALIS: 'YOUR_MORALIS_API_KEY_HERE',
  
  // Alchemy API Key - Get yours from https://alchemy.com/
  // Used for NFT data on Ethereum mainnet
  ALCHEMY: 'YOUR_ALCHEMY_API_KEY_HERE',
} as const;

/**
 * Get an API key by service name
 * Throws an error if the key is not configured
 */
export const getApiKey = (service: keyof typeof API_KEYS): string => {
  const key = API_KEYS[service];
  
  if (!key || key.includes('YOUR_') || key.includes('_HERE')) {
    throw new Error(
      `${service} API key not configured. Please update src/config/api.ts with your actual API key.`
    );
  }
  
  return key;
};
