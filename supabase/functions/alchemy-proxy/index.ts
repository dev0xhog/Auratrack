import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALCHEMY_API_KEY = Deno.env.get('ALCHEMY_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Chain configuration for Alchemy
const CHAIN_CONFIG: Record<string, string> = {
  'eth': 'eth-mainnet',
  'polygon': 'polygon-mainnet',
  'arbitrum': 'arb-mainnet',
  'optimism': 'opt-mainnet',
  'base': 'base-mainnet',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ALCHEMY_API_KEY) {
      throw new Error('ALCHEMY_API_KEY not configured');
    }

    const { address, chain = 'eth' } = await req.json();
    
    if (!address) {
      throw new Error('Address is required');
    }

    const alchemyNetwork = CHAIN_CONFIG[chain] || CHAIN_CONFIG['eth'];
    const url = `https://${alchemyNetwork}.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${address}&withMetadata=true&pageSize=20`;
    
    console.log(`Fetching NFTs from Alchemy for ${address} on ${chain}`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Alchemy API error:', errorText);
      throw new Error(`Alchemy API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in alchemy-proxy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
