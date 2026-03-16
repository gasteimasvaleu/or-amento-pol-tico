const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    // Test fetching the URL and return status + headers
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "*/*",
      "Accept-Language": "pt-BR,pt;q=0.9",
      "Referer": "https://dadosabertos.tse.jus.br/",
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    
    const resp = await fetch(url, { 
      headers,
      signal: controller.signal,
      redirect: "manual",
    });
    clearTimeout(timer);
    
    const respHeaders: Record<string, string> = {};
    resp.headers.forEach((v, k) => respHeaders[k] = v);
    
    return new Response(JSON.stringify({
      status: resp.status,
      statusText: resp.statusText,
      headers: respHeaders,
      redirected: resp.redirected,
      url: resp.url,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
