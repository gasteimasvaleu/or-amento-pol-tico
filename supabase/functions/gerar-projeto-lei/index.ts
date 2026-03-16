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
    const { titulo, esfera, tipo, area, justificativa } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um redator legislativo brasileiro altamente qualificado, especialista em técnica legislativa e redação de projetos de lei.

Diretrizes:
- Siga rigorosamente a técnica legislativa brasileira (Lei Complementar nº 95/1998)
- Estruture o projeto com: ementa, preâmbulo, artigos (com parágrafos, incisos e alíneas quando necessário), disposições finais e justificativa
- Use linguagem jurídica precisa, clara e objetiva
- Adapte a estrutura e os vocativos conforme a esfera legislativa (municipal, estadual ou federal)
- Use formatação Markdown para estruturar o documento
- Inclua a justificativa ao final com argumentos sólidos, dados e fundamentação legal
- O projeto deve ser original, tecnicamente correto e pronto para apresentação

Importante: Gere APENAS o projeto de lei completo, sem explicações adicionais ou comentários sobre o texto.`;

    const userPrompt = `Gere um projeto de lei com as seguintes especificações:

**Título/Assunto:** ${titulo}
**Esfera legislativa:** ${esfera}
**Tipo normativo:** ${tipo}
**Área temática:** ${area}
${justificativa ? `**Justificativa/Contexto adicional:** ${justificativa}` : ""}

Gere o projeto de lei completo em Markdown, incluindo ementa, texto normativo e justificativa.`;

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
        JSON.stringify({ error: "Erro ao gerar projeto de lei. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("gerar-projeto-lei error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
