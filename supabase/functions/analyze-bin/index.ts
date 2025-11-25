import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    const binDataJson = formData.get('binData') as string;

    if (!image || !binDataJson) {
      return new Response(
        JSON.stringify({ error: 'Missing image or bin data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const binData = JSON.parse(binDataJson);
    const modelApiUrl = Deno.env.get('MODEL_API_URL');

    if (!modelApiUrl) {
      return new Response(
        JSON.stringify({ error: 'Model API URL not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Forward request to your Python model API
    const modelFormData = new FormData();
    modelFormData.append('image', image);
    modelFormData.append('bin_data', JSON.stringify(binData));

    const modelResponse = await fetch(modelApiUrl, {
      method: 'POST',
      body: modelFormData,
    });

    if (!modelResponse.ok) {
      throw new Error(`Model API error: ${modelResponse.statusText}`);
    }

    const results = await modelResponse.json();

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-bin function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
