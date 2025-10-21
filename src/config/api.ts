/**
 * API Configuration
 *
 * This file reads API keys from environment variables for security.
 *
 * For local development:
 * - Copy .env.local and add your actual API keys
 *
 * For Vercel deployment:
 * - Add environment variables in Vercel dashboard:
 *   Project Settings → Environment Variables
 *   - VITE_MORALIS_API_KEY
 *   - VITE_ALCHEMY_API_KEY
 */

export const API_KEYS = {
  // Moralis API Key - Get yours from https://moralis.io/
  // Used for blockchain data, NFTs, and transaction history
  MORALIS: import.meta.env.VITE_MORALIS_API_KEY || "",

  // Alchemy API Key - Get yours from https://alchemy.com/
  // Used for NFT data on Ethereum mainnet
  ALCHEMY: import.meta.env.VITE_ALCHEMY_API_KEY || "",
} as const;

/**
 * Get an API key by service name
 * Throws an error if the key is not configured
 */
export const getApiKey = (service: keyof typeof API_KEYS): string => {
  const key = API_KEYS[service];

  if (!key || key.trim() === "") {
    throw new Error(
      `${service} API key not configured. ` +
        `Please add VITE_${service}_API_KEY to your environment variables. ` +
        `For local dev: add to .env.local file. ` +
        `For Vercel: add in Project Settings → Environment Variables.`,
    );
  }

  return key;
};
