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
    const { tema, tom, tamanho, estilo, publico, contexto } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const tamanhoMap: Record<string, string> = {
      curto: "aproximadamente 2 minutos de leitura (cerca de 300-400 palavras)",
      medio: "aproximadamente 5 minutos de leitura (cerca de 700-900 palavras)",
      longo: "aproximadamente 10 minutos de leitura (cerca de 1500-1800 palavras)",
      extenso: "aproximadamente 15 minutos ou mais de leitura (cerca de 2500+ palavras)",
    };

    const systemPrompt = `Você é um redator parlamentar brasileiro altamente qualificado, especialista em discursos políticos. 
Seu papel é criar discursos eloquentes, persuasivos e adequados ao contexto político brasileiro.

Diretrizes:
- Use linguagem formal e adequada ao ambiente parlamentar brasileiro
- Inclua referências a valores democráticos, constitucionais e republicanos quando pertinente
- Estruture o discurso com: saudação inicial, introdução ao tema, desenvolvimento com argumentos sólidos, exemplos concretos, e uma conclusão impactante
- Adapte o vocabulário e a abordagem conforme o tom, estilo e público-alvo solicitados
- Use formatação Markdown para estruturar o discurso (títulos, parágrafos, ênfases)
- Inclua vocativos adequados ao estilo (ex: "Senhor Presidente", "Senhoras e senhores parlamentares", etc.)
- O discurso deve ser original, coerente e pronto para uso

Importante: Gere APENAS o discurso, sem explicações adicionais ou comentários sobre o texto.`;

    const userPrompt = `Gere um discurso parlamentar com as seguintes especificações:

**Tema:** ${tema}
**Tom:** ${tom}
**Tamanho:** ${tamanhoMap[tamanho] || tamanho}
**Estilo:** ${estilo}
**Público-alvo:** ${publico}
${contexto ? `**Contexto adicional:** ${contexto}` : ""}

Gere o discurso completo em Markdown.`;

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
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
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
        JSON.stringify({ error: "Erro ao gerar discurso. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("gerar-discurso error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
