import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Mapping of cargo names to TSE CSV codes
const cargoMap: Record<string, string[]> = {
  "Presidente": ["PRESIDENTE"],
  "Governador": ["GOVERNADOR"],
  "Senador": ["SENADOR"],
  "Deputado Federal": ["DEPUTADO FEDERAL"],
  "Deputado Estadual": ["DEPUTADO ESTADUAL", "DEPUTADO DISTRITAL"],
  "Prefeito": ["PREFEITO"],
  "Vereador": ["VEREADOR"],
};

// TSE CKAN dataset slug patterns
function getDatasetSlug(ano: number): string {
  return `resultados-${ano}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ano, uf, cargo, nome_candidato } = await req.json();

    if (!ano || !uf || !cargo) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios: ano, uf, cargo" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 1. Check cache first
    let query = supabase
      .from("dados_eleitorais_cache")
      .select("*")
      .eq("ano_eleicao", ano)
      .eq("sigla_uf", uf.toUpperCase())
      .eq("cargo", cargo);

    if (nome_candidato && nome_candidato.trim()) {
      query = query.ilike("nome_candidato", `%${nome_candidato.trim()}%`);
    }

    const { data: cached, error: cacheError } = await query.order("qtd_votos", { ascending: false }).limit(500);

    if (cacheError) {
      console.error("Cache query error:", cacheError);
    }

    // If we have cached data for this ano/uf/cargo combo, return it
    if (cached && cached.length > 0) {
      return new Response(
        JSON.stringify({ data: cached, source: "cache" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If searching by name and no results, check if we have ANY data for this ano/uf/cargo
    if (nome_candidato && nome_candidato.trim()) {
      const { data: anyData } = await supabase
        .from("dados_eleitorais_cache")
        .select("id")
        .eq("ano_eleicao", ano)
        .eq("sigla_uf", uf.toUpperCase())
        .eq("cargo", cargo)
        .limit(1);

      if (anyData && anyData.length > 0) {
        // Data exists but no match for this name
        return new Response(
          JSON.stringify({ data: [], source: "cache" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 2. No cache — fetch from TSE CKAN
    console.log(`Fetching TSE data for ${ano}/${uf}/${cargo}...`);

    const datasetSlug = getDatasetSlug(ano);
    const ckanUrl = `https://dadosabertos.tse.jus.br/api/3/action/package_show?id=${datasetSlug}`;

    const ckanResp = await fetch(ckanUrl);
    if (!ckanResp.ok) {
      return new Response(
        JSON.stringify({ error: `Dataset não encontrado no TSE para o ano ${ano}. Verifique se o ano é válido.`, data: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ckanData = await ckanResp.json();
    const resources = ckanData?.result?.resources || [];

    // Find the CSV resource for "votação nominal por município e zona"
    const csvResource = resources.find((r: any) => {
      const name = (r.name || "").toLowerCase();
      const desc = (r.description || "").toLowerCase();
      const format = (r.format || "").toUpperCase();
      return (
        format === "CSV" &&
        (name.includes("votacao_candidato_munzona") ||
          name.includes("votação nominal") ||
          desc.includes("votação nominal") ||
          name.includes("votacao_secao") ||
          name.includes("candidato_munzona"))
      );
    });

    if (!csvResource) {
      // Try to find any CSV with "candidato" in name
      const altResource = resources.find((r: any) => {
        const name = (r.name || "").toLowerCase();
        const format = (r.format || "").toUpperCase();
        return format === "CSV" && (name.includes("candidat") || name.includes("votacao"));
      });

      if (!altResource) {
        return new Response(
          JSON.stringify({
            error: `Recurso CSV de votação não encontrado para ${ano}. Recursos disponíveis: ${resources.map((r: any) => r.name).join(", ")}`,
            data: [],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const resourceToUse = csvResource || resources.find((r: any) => {
      const name = (r.name || "").toLowerCase();
      const format = (r.format || "").toUpperCase();
      return format === "CSV" && (name.includes("candidat") || name.includes("votacao"));
    });

    // Try datastore_search first (structured query without downloading full CSV)
    const cargoValues = cargoMap[cargo] || [cargo.toUpperCase()];
    
    if (resourceToUse?.id) {
      try {
        const filters = JSON.stringify({
          SG_UF: uf.toUpperCase(),
          DS_CARGO: cargoValues[0],
        });
        const datastoreUrl = `https://dadosabertos.tse.jus.br/api/3/action/datastore_search?resource_id=${resourceToUse.id}&filters=${encodeURIComponent(filters)}&limit=500`;
        
        console.log("Trying datastore_search...", datastoreUrl);
        const dsResp = await fetch(datastoreUrl);
        
        if (dsResp.ok) {
          const dsData = await dsResp.json();
          if (dsData?.result?.records && dsData.result.records.length > 0) {
            const records = dsData.result.records;
            
            // Map TSE fields to our schema
            const mappedData = records.map((r: any) => ({
              ano_eleicao: ano,
              sigla_uf: r.SG_UF || uf.toUpperCase(),
              cargo: cargo,
              nome_candidato: r.NM_CANDIDATO || r.NM_VOTAVEL || "",
              nome_urna: r.NM_URNA_CANDIDATO || r.NM_CANDIDATO || "",
              sigla_partido: r.SG_PARTIDO || "",
              numero_candidato: String(r.NR_CANDIDATO || r.NR_VOTAVEL || ""),
              situacao_eleito: r.DS_SIT_TOT_TURNO || r.DS_SITUACAO || "",
              qtd_votos: parseInt(r.QT_VOTOS_NOMINAIS || r.QT_VOTOS || "0"),
              nome_municipio: r.NM_MUNICIPIO || "",
              turno: parseInt(r.NR_TURNO || "1"),
            }));

            // Aggregate votes by candidate (sum across municipalities/zones)
            const aggregated = aggregateVotes(mappedData);

            // Save to cache
            if (aggregated.length > 0) {
              const { error: insertError } = await supabase
                .from("dados_eleitorais_cache")
                .insert(aggregated);
              if (insertError) {
                console.error("Cache insert error:", insertError);
              }
            }

            // Filter by name if provided
            let results = aggregated;
            if (nome_candidato && nome_candidato.trim()) {
              const search = nome_candidato.trim().toUpperCase();
              results = results.filter(
                (r: any) =>
                  r.nome_candidato.toUpperCase().includes(search) ||
                  (r.nome_urna && r.nome_urna.toUpperCase().includes(search))
              );
            }

            results.sort((a: any, b: any) => b.qtd_votos - a.qtd_votos);

            return new Response(
              JSON.stringify({ data: results.slice(0, 500), source: "tse" }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (e) {
        console.log("Datastore search failed, will try CSV download:", e);
      }
    }

    // Fallback: return message that data is not available via API
    return new Response(
      JSON.stringify({
        error: `Não foi possível consultar os dados do TSE para ${ano}/${uf}. O portal pode estar indisponível ou o formato dos dados mudou. Tente novamente mais tarde.`,
        data: [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno ao consultar dados eleitorais" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function aggregateVotes(records: any[]): any[] {
  const map = new Map<string, any>();

  for (const r of records) {
    const key = `${r.nome_candidato}-${r.sigla_partido}-${r.numero_candidato}-${r.turno}`;
    if (map.has(key)) {
      const existing = map.get(key);
      existing.qtd_votos += r.qtd_votos;
      // Keep the "best" situacao (ELEITO > others)
      if (r.situacao_eleito && r.situacao_eleito.includes("ELEIT")) {
        existing.situacao_eleito = r.situacao_eleito;
      }
    } else {
      map.set(key, { ...r, nome_municipio: "Todos" });
    }
  }

  return Array.from(map.values());
}
