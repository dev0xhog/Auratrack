import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MORALIS_API_KEY = Deno.env.get('MORALIS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!MORALIS_API_KEY) {
      throw new Error('MORALIS_API_KEY not configured');
    }

    const { endpoint, chain } = await req.json();
    
    if (!endpoint) {
      throw new Error('Endpoint is required');
    }

    console.log(`Fetching from Moralis: ${endpoint}, chain: ${chain || 'eth'}`);
    
    // Build URL with query params
    const baseUrl = `https://deep-index.moralis.io/api/v2.2${endpoint}`;
    const url = new URL(baseUrl);
    
    if (chain) {
      url.searchParams.set('chain', chain);
    }
    
    // Add default limit and format for certain endpoints
    if (endpoint.includes('/nft')) {
      url.searchParams.set('format', 'decimal');
      url.searchParams.set('limit', '100');
    } else if (endpoint.includes('/transfers')) {
      url.searchParams.set('limit', '50');
    } else {
      url.searchParams.set('limit', '50');
    }
    
    const response = await fetch(url.toString(), {
      headers: {
        "X-API-Key": MORALIS_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Moralis API error:', errorText);
      throw new Error(`Moralis API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in moralis-proxy:', error);
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
