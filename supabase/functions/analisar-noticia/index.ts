import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function stripHtml(html: string): string {
  // Remove script and style tags with content
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "");
  text = text.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");
  text = text.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "");
  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, " ");
  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();
  // Limit to ~8000 chars to fit context window
  return text.slice(0, 8000);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tipo, url, analise, tom } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt: string;
    let userPrompt: string;

    if (tipo === "analisar") {
      if (!url) throw new Error("URL é obrigatória");

      // Fetch the news article
      console.log("Fetching URL:", url);
      const pageResponse = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; NewsAnalyzer/1.0)",
          "Accept": "text/html,application/xhtml+xml",
        },
      });

      if (!pageResponse.ok) {
        return new Response(
          JSON.stringify({ error: `Não foi possível acessar a URL (status ${pageResponse.status}). Verifique se o link está correto.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const html = await pageResponse.text();
      const articleText = stripHtml(html);

      if (articleText.length < 100) {
        return new Response(
          JSON.stringify({ error: "Não foi possível extrair conteúdo suficiente desta página. Tente outro link." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      systemPrompt = `Você é um analista político brasileiro altamente qualificado, especialista em comunicação parlamentar.
Sua função é analisar notícias e fornecer insights estratégicos para parlamentares.

Estruture sua análise em Markdown com as seguintes seções:
## 📰 Resumo da Notícia
Resumo objetivo e conciso do conteúdo.

## 🔑 Pontos-Chave
Lista dos principais pontos e fatos relevantes.

## 🏛️ Impacto Político
Análise do impacto político, legislativo e institucional.

## 📊 Posicionamentos Possíveis
Diferentes ângulos e posicionamentos que um parlamentar pode adotar.

## 💡 Oportunidades para o Parlamentar
Ações concretas, pronunciamentos ou projetos que o parlamentar pode considerar.

## ⚠️ Pontos de Atenção
Riscos, controvérsias ou aspectos sensíveis a considerar.

Seja objetivo, analítico e forneça insights acionáveis.`;

      userPrompt = `Analise a seguinte notícia extraída da URL ${url}:\n\n${articleText}`;

    } else if (tipo === "comentar") {
      if (!analise || !tom) throw new Error("Análise e tom são obrigatórios");

      const tomDescricao: Record<string, string> = {
        apoio: "de apoio e concordância, destacando os aspectos positivos",
        critico: "crítico e questionador, apontando falhas e problemas",
        neutro: "neutro e equilibrado, apresentando diferentes perspectivas",
        cauteloso: "cauteloso e ponderado, pedindo mais informações e análise",
        indignado: "de indignação e cobrança, exigindo ações e responsabilização",
        propositivo: "propositivo e construtivo, apresentando soluções e alternativas",
      };

      systemPrompt = `Você é um redator parlamentar brasileiro especialista em comunicação política.
Gere um comentário político pronto para uso (redes sociais, nota à imprensa ou pronunciamento curto).
O comentário deve ser direto, impactante e adequado ao tom solicitado.
Use linguagem acessível mas com autoridade parlamentar.
Formate em Markdown. Gere APENAS o comentário, sem explicações.`;

      userPrompt = `Com base na seguinte análise de notícia, gere um comentário político com tom ${tomDescricao[tom] || tom}:

${analise}`;

    } else {
      return new Response(
        JSON.stringify({ error: "Tipo inválido. Use 'analisar' ou 'comentar'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
        JSON.stringify({ error: "Erro ao processar. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("analisar-noticia error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
