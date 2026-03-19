import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

    // Extract user_id from JWT
    const authHeader = req.headers.get("authorization") ?? "";
    let userId = "anonymous";
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.sub || "anonymous";
      } catch { /* ignore parse errors */ }
    }

    const { prompt, formato, estilo, referenceImageBase64, strength } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dimensoes: Record<string, string> = {
      story: "1080x1920 pixels (9:16 vertical/story format)",
      feed_quadrado: "1080x1080 pixels (1:1 square format)",
      feed_paisagem: "1200x628 pixels (landscape format)",
    };

    const dimText = dimensoes[formato] || dimensoes.feed_quadrado;

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
      userId,
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
    const imageBase64 = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageBase64) {
      console.error("No image in response:", JSON.stringify(data).slice(0, 500));
      throw new Error("Nenhuma imagem foi gerada. Tente novamente.");
    }

    console.log("Image generated successfully via Gemini 3 Pro Image");

    // Upload to Supabase Storage instead of returning base64
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        // Decode base64 to bytes
        let rawBase64 = imageBase64;
        if (rawBase64.startsWith("data:")) {
          rawBase64 = rawBase64.split(",")[1];
        }
        const binaryStr = atob(rawBase64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const filePath = `generated/${userId}/${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
          .from("midias")
          .upload(filePath, bytes, { contentType: "image/png", upsert: false });

        if (uploadError) {
          console.error("Storage upload error, falling back to base64:", uploadError.message);
        } else {
          const { data: urlData } = supabase.storage
            .from("midias")
            .getPublicUrl(filePath);

          console.log("Image uploaded to Storage:", filePath);

          return new Response(
            JSON.stringify({ imageUrl: urlData.publicUrl }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (uploadErr) {
        console.error("Storage upload exception, falling back to base64:", uploadErr);
      }
    }

    // Fallback: return base64
    return new Response(
      JSON.stringify({ imageBase64: imageBase64 }),
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
