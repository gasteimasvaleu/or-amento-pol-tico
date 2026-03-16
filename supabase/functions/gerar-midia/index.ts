import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LEONARDO_API = "https://cloud.leonardo.ai/api/rest/v1";

async function pollGeneration(generationId: string, apiKey: string, maxAttempts = 30): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 3000));

    const res = await fetch(`${LEONARDO_API}/generations/${generationId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Poll error:", res.status, text);
      throw new Error("Erro ao verificar status da geração");
    }

    const data = await res.json();
    const gen = data.generations_by_pk;

    if (gen?.status === "COMPLETE" && gen.generated_images?.length > 0) {
      return gen.generated_images[0].url;
    }

    if (gen?.status === "FAILED") {
      throw new Error("A geração da imagem falhou no Leonardo AI");
    }
  }

  throw new Error("Tempo limite excedido aguardando geração da imagem");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LEONARDO_API_KEY = Deno.env.get("LEONARDO_API_KEY");
    if (!LEONARDO_API_KEY) {
      throw new Error("LEONARDO_API_KEY não configurada");
    }

    const { prompt, formato, estilo } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map formato to dimensions
    const dimensoes: Record<string, { width: number; height: number }> = {
      story: { width: 1080, height: 1920 },
      feed_quadrado: { width: 1080, height: 1080 },
      feed_paisagem: { width: 1200, height: 628 },
    };

    const dim = dimensoes[formato] || dimensoes.feed_quadrado;

    // Build enhanced prompt with style
    const estiloMap: Record<string, string> = {
      moderno: "modern, vibrant, clean design, social media style",
      minimalista: "minimalist, clean, simple, elegant design",
      politico: "political campaign style, bold, professional, institutional",
      institucional: "institutional, formal, government style, professional",
    };

    const styleText = estiloMap[estilo] || estiloMap.moderno;
    const enhancedPrompt = `${prompt}. Style: ${styleText}. High quality, suitable for social media post.`;

    console.log("Generating image with Leonardo AI:", { prompt: enhancedPrompt, ...dim });

    // Create generation
    const createRes = await fetch(`${LEONARDO_API}/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LEONARDO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        width: dim.width,
        height: dim.height,
        num_images: 1,
        modelId: "6b645e3a-d64f-4341-a6d8-7a3690fbf042", // Leonardo Phoenix
        alchemy: true,
        photoReal: false,
        presetStyle: "DYNAMIC",
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error("Leonardo create error:", createRes.status, errText);

      if (createRes.status === 401 || createRes.status === 403) {
        return new Response(
          JSON.stringify({ error: "API key do Leonardo AI inválida ou sem permissão." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (createRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Erro ao iniciar geração da imagem." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const createData = await createRes.json();
    const generationId = createData.sdGenerationJob?.generationId;

    if (!generationId) {
      console.error("No generationId in response:", createData);
      throw new Error("Resposta inesperada do Leonardo AI");
    }

    console.log("Generation started, polling for result:", generationId);

    // Poll for completion
    const imageUrl = await pollGeneration(generationId, LEONARDO_API_KEY);

    console.log("Image generated successfully:", imageUrl);

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("gerar-midia error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
