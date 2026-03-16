import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if a specific user_id was passed (manual trigger)
    let userId: string | null = null;
    try {
      const body = await req.json();
      userId = body?.user_id || null;
    } catch {
      // No body (cron call)
    }

    // Fetch active sites
    let query = supabase.from("sites_noticias").select("*").eq("ativo", true);
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: sites, error: sitesError } = await query;
    if (sitesError) throw sitesError;
    if (!sites || sites.length === 0) {
      return new Response(JSON.stringify({ message: "Nenhum site ativo encontrado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalExtracted = 0;

    for (const site of sites) {
      try {
        console.log(`Processando site: ${site.nome} (${site.url})`);

        // Fetch the site HTML
        const siteResp = await fetch(site.url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)" },
        });
        if (!siteResp.ok) {
          console.error(`Erro ao acessar ${site.url}: ${siteResp.status}`);
          continue;
        }

        const html = await siteResp.text();

        // Use AI to extract news titles and URLs from the HTML
        const extractionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `Você é um extrator de notícias. Dado o HTML de um site de notícias, extraia as 5 notícias mais recentes/relevantes. Retorne APENAS um JSON array com objetos contendo "titulo" e "url". Se a URL for relativa, complete com o domínio base. Não inclua nenhum texto além do JSON.`,
              },
              {
                role: "user",
                content: `URL base: ${site.url}\n\nHTML (primeiros 15000 caracteres):\n${html.substring(0, 15000)}`,
              },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "extract_news",
                  description: "Extrair notícias do HTML",
                  parameters: {
                    type: "object",
                    properties: {
                      noticias: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            titulo: { type: "string" },
                            url: { type: "string" },
                          },
                          required: ["titulo", "url"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["noticias"],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "extract_news" } },
          }),
        });

        if (!extractionResponse.ok) {
          const status = extractionResponse.status;
          if (status === 429) {
            console.error("Rate limit atingido, pausando...");
            await new Promise((r) => setTimeout(r, 60000));
            continue;
          }
          if (status === 402) {
            console.error("Créditos insuficientes");
            break;
          }
          console.error(`Erro AI extraction: ${status}`);
          continue;
        }

        const extractionData = await extractionResponse.json();
        const toolCall = extractionData.choices?.[0]?.message?.tool_calls?.[0];
        if (!toolCall) {
          console.error("Sem tool call na resposta de extração");
          continue;
        }

        const { noticias } = JSON.parse(toolCall.function.arguments);
        if (!noticias || noticias.length === 0) {
          console.log(`Nenhuma notícia encontrada em ${site.nome}`);
          continue;
        }

        // For each news item, generate a summary
        for (const noticia of noticias.slice(0, 5)) {
          try {
            // Fetch news content
            let newsContent = noticia.titulo;
            try {
              const newsResp = await fetch(noticia.url, {
                headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)" },
              });
              if (newsResp.ok) {
                const newsHtml = await newsResp.text();
                // Extract text content (strip tags roughly)
                newsContent = newsHtml
                  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                  .replace(/<[^>]+>/g, " ")
                  .replace(/\s+/g, " ")
                  .trim()
                  .substring(0, 5000);
              }
            } catch {
              console.log(`Não foi possível buscar conteúdo de ${noticia.url}`);
            }

            // Generate summary
            const summaryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${lovableApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                messages: [
                  {
                    role: "system",
                    content:
                      "Você é um assistente parlamentar. Resuma a notícia em 2-3 frases objetivas, destacando pontos relevantes para um parlamentar. Responda apenas com o resumo, sem introduções.",
                  },
                  {
                    role: "user",
                    content: `Título: ${noticia.titulo}\n\nConteúdo:\n${newsContent}`,
                  },
                ],
              }),
            });

            if (!summaryResponse.ok) {
              if (summaryResponse.status === 429) {
                await new Promise((r) => setTimeout(r, 30000));
                continue;
              }
              if (summaryResponse.status === 402) break;
              continue;
            }

            const summaryData = await summaryResponse.json();
            const resumo = summaryData.choices?.[0]?.message?.content || "Resumo indisponível";

            // Save to database
            const { error: insertError } = await supabase.from("noticias_resumos").insert({
              user_id: site.user_id,
              site_id: site.id,
              titulo: noticia.titulo,
              url: noticia.url,
              resumo,
            });

            if (insertError) {
              console.error(`Erro ao salvar notícia: ${insertError.message}`);
            } else {
              totalExtracted++;
            }
          } catch (e) {
            console.error(`Erro processando notícia: ${e}`);
          }
        }
      } catch (e) {
        console.error(`Erro processando site ${site.nome}: ${e}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, total_extracted: totalExtracted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Erro geral:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
