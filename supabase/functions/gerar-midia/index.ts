import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const { prompt, formato, estilo, referenceImageBase64, strength } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map formato to dimensions for prompt context
    const dimensoes: Record<string, string> = {
      story: "1080x1920 pixels (9:16 vertical/story format)",
      feed_quadrado: "1080x1080 pixels (1:1 square format)",
      feed_paisagem: "1200x628 pixels (landscape format)",
    };

    const dimText = dimensoes[formato] || dimensoes.feed_quadrado;

    // Build enhanced prompt with style
    const estiloMap: Record<string, string> = {
      moderno: "modern, vibrant, clean design, social media style",
      minimalista: "minimalist, clean, simple, elegant design",
      politico: "political campaign style, bold, professional, institutional",
      institucional: "institutional, formal, government style, professional",
    };

    const styleText = estiloMap[estilo] || estiloMap.moderno;

    const influenceText = referenceImageBase64
      ? ` Use the provided reference image as inspiration with ${Math.round((strength ?? 0.5) * 100)}% fidelity to the original.`
      : "";

    const systemPrompt = `You are an expert graphic designer specializing in social media content for political campaigns. Generate high-quality images suitable for social media posts. Always create visually striking, professional designs.`;

    const userPrompt = `Create an image with these specifications:
- Description: ${prompt}
- Dimensions: ${dimText}
- Style: ${styleText}
- The image should be high quality and suitable for social media posting.${influenceText}`;

    // Build message content (multimodal if reference image provided)
    const content: any[] = [{ type: "text", text: userPrompt }];

    if (referenceImageBase64) {
      content.push({
        type: "image_url",
        image_url: { url: referenceImageBase64 },
      });
    }

    console.log("Generating image with Lovable AI Gateway (Gemini 3 Pro Image):", {
      formato,
      estilo,
      hasReference: !!referenceImageBase64,
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI Gateway error:", response.status, errText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Erro ao gerar imagem via IA." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      console.error("No image in response:", JSON.stringify(data).slice(0, 500));
      throw new Error("Nenhuma imagem foi gerada. Tente novamente.");
    }

    console.log("Image generated successfully via Gemini 3 Pro Image");

    return new Response(
      JSON.stringify({ imageBase64: imageData }),
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
