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
    const { tema, tom, tamanho, tipo, usarEmojis, imagemBase64 } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const tamanhoMap: Record<string, string> = {
      curto: "postagem curta com no máximo 280 caracteres, ideal para Twitter/X",
      medio: "postagem de tamanho médio com 400-600 caracteres, ideal para Instagram",
      longo: "postagem longa com 800-1500 caracteres, ideal para LinkedIn ou Facebook",
    };

    const tipoMap: Record<string, string> = {
      engajador: "Use perguntas, call-to-action, convites à interação e linguagem que estimule comentários e compartilhamentos.",
      critico: "Use argumentação sólida, dados quando possível, posicionamento firme e tom de análise crítica.",
      viralizado: "Use linguagem impactante, ganchos emocionais, frases de efeito e elementos que maximizem compartilhamentos.",
    };

    const emojiDirective = usarEmojis
      ? "Use emojis estrategicamente ao longo do texto para aumentar o engajamento visual."
      : "NÃO use emojis em nenhuma parte do texto.";

    const imageDirective = imagemBase64
      ? "Uma imagem foi fornecida pelo usuário. Analise o conteúdo visual da imagem e crie a postagem baseada nela, conectando o tema solicitado com o que você vê na imagem."
      : "";

    const systemPrompt = `Você é um especialista em criação de conteúdo para redes sociais, com anos de experiência em engajamento digital e marketing político.

Diretrizes:
- SEMPRE inclua hashtags relevantes ao final da postagem (entre 3 e 8 hashtags)
- Adapte o texto ao tamanho e plataforma indicados
- ${emojiDirective}
- ${tipoMap[tipo] || tipoMap.engajador}
${imageDirective}

Importante: Gere APENAS a postagem pronta para publicação, sem explicações adicionais ou comentários sobre o texto.`;

    const userPrompt = `Gere uma postagem para redes sociais com as seguintes especificações:

**Tema:** ${tema}
**Tom:** ${tom}
**Tamanho:** ${tamanhoMap[tamanho] || tamanho}
**Tipo:** ${tipo}

Gere a postagem completa, pronta para copiar e colar.`;

    // Build messages array - support multimodal if image provided
    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    if (imagemBase64) {
      // Extract base64 data and mime type
      const match = imagemBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        messages.push({
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imagemBase64 },
            },
            { type: "text", text: userPrompt },
          ],
        });
      } else {
        messages.push({ role: "user", content: userPrompt });
      }
    } else {
      messages.push({ role: "user", content: userPrompt });
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar postagem. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("gerar-postagem error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
