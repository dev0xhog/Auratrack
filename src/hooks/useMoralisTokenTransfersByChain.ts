import { useQuery } from "@tanstack/react-query";
import { validateAndSanitizeAddress, isValidChain } from "@/lib/validation";
import { batchFetch } from "@/lib/apiClient";
import { supabase } from "@/integrations/supabase/client";

export interface MoralisTokenTransfer {
  transaction_hash: string;
  from_address: string;
  to_address: string;
  value: string;
  block_timestamp: string;
  block_number: string;
  token_address: string;
  token_name?: string;
  token_symbol?: string;
  token_logo?: string;
  token_decimals?: string;
  chain: string;
  possible_spam?: boolean;
  security_score?: number | null;
  verified_contract?: boolean;
}

interface MoralisTokenTransfersResponse {
  result: MoralisTokenTransfer[];
  cursor?: string;
}

const SUPPORTED_CHAINS = [
  "eth",           // Ethereum
  "polygon",       // Polygon
  "bsc",           // Binance Smart Chain
  "avalanche",     // Avalanche
  "fantom",        // Fantom
  "arbitrum",      // Arbitrum
  "optimism",      // Optimism
  "base",          // Base
  "linea",         // Linea
  "cronos",        // Cronos
  "gnosis",        // Gnosis
  "chiliz",        // Chiliz
  "moonbeam",      // Moonbeam
  "moonriver",     // Moonriver
  "flow",          // Flow
  "ronin",         // Ronin
  "lisk",          // Lisk
  "pulsechain",    // Pulsechain
];

export const useMoralisTokenTransfersByChain = (address: string | undefined) => {
  return useQuery<Record<string, MoralisTokenTransfer[]>>({
    queryKey: ["moralis-token-transfers-by-chain", address],
    queryFn: async () => {
      // Security: Validate and sanitize address input
      const validAddress = validateAndSanitizeAddress(address);
      if (!validAddress) {
        throw new Error("Invalid Ethereum address format");
      }
      
      // Performance: Fetch chains in parallel batches
      const fetchChainTransfers = async (chain: string) => {
        // Security: Validate chain parameter
        if (!isValidChain(chain, SUPPORTED_CHAINS)) {
          console.warn(`Invalid chain identifier: ${chain}`);
          return { chain, transfers: [] };
        }

        try {
          const { data, error } = await supabase.functions.invoke('moralis-proxy', {
            body: { endpoint: `/${validAddress}/erc20/transfers`, chain }
          });
          
          if (error) {
            console.warn(`Failed to fetch token transfers for ${chain}:`, error);
            return { chain, transfers: [] };
          }
          
          return { 
            chain, 
            transfers: data.result.map((tx: any) => ({ ...tx, chain })) 
          };
        } catch (error) {
          console.warn(`Error fetching token transfers for ${chain}:`, error);
          return { chain, transfers: [] };
        }
      };

      // Performance: Batch requests with concurrency control (5 chains at a time)
      const requests = SUPPORTED_CHAINS.map(chain => () => fetchChainTransfers(chain));
      const results = await batchFetch(requests, 5);

      // Only include chains with actual transfers
      const transfersByChain: Record<string, MoralisTokenTransfer[]> = {};
      results.forEach(({ chain, transfers }) => {
        if (transfers.length > 0) {
          transfersByChain[chain] = transfers;
        }
      });

      return transfersByChain;
    },
    enabled: !!address && validateAndSanitizeAddress(address) !== null,
    staleTime: 300000, // Cache for 5 minutes for better performance
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
