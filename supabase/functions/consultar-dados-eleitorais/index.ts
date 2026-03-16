import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { unzipSync } from "https://esm.sh/fflate@0.8.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CDN_URLS: Record<number, string> = {
  2024: "https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2024.zip",
  2022: "https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2022.zip",
};

const cargoMap: Record<string, string[]> = {
  "Presidente": ["PRESIDENTE"],
  "Governador": ["GOVERNADOR"],
  "Senador": ["SENADOR"],
  "Deputado Federal": ["DEPUTADO FEDERAL"],
  "Deputado Estadual": ["DEPUTADO ESTADUAL", "DEPUTADO DISTRITAL"],
  "Prefeito": ["PREFEITO"],
  "Vereador": ["VEREADOR"],
};

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ";") {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
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

    const { data: cached, error: cacheError } = await query
      .order("qtd_votos", { ascending: false })
      .limit(500);

    if (cacheError) console.error("Cache query error:", cacheError);

    if (cached && cached.length > 0) {
      return new Response(
        JSON.stringify({ data: cached, source: "cache" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if we have data for this combo but no match for name filter
    if (nome_candidato && nome_candidato.trim()) {
      const { data: anyData } = await supabase
        .from("dados_eleitorais_cache")
        .select("id")
        .eq("ano_eleicao", ano)
        .eq("sigla_uf", uf.toUpperCase())
        .eq("cargo", cargo)
        .limit(1);

      if (anyData && anyData.length > 0) {
        return new Response(
          JSON.stringify({ data: [], source: "cache" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 2. Download from TSE CDN
    const cdnUrl = CDN_URLS[ano];
    if (!cdnUrl) {
      return new Response(
        JSON.stringify({ error: `Ano ${ano} não suportado. Use 2022 ou 2024.`, data: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Downloading TSE ZIP for ${ano}...`);

    const zipResp = await fetch(cdnUrl);
    if (!zipResp.ok) {
      return new Response(
        JSON.stringify({ error: `Falha ao baixar dados do TSE (status ${zipResp.status}). Tente novamente.`, data: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const zipBuffer = new Uint8Array(await zipResp.arrayBuffer());
    console.log(`ZIP downloaded: ${(zipBuffer.length / 1024 / 1024).toFixed(1)}MB. Decompressing...`);

    const unzipped = unzipSync(zipBuffer);

    // Find the CSV file for the requested UF
    const ufUpper = uf.toUpperCase();
    const cargoValues = cargoMap[cargo] || [cargo.toUpperCase()];

    let csvContent: string | null = null;
    for (const [filename, data] of Object.entries(unzipped)) {
      const fn = filename.toUpperCase();
      // TSE ZIPs contain per-state CSVs like "votacao_candidato_munzona_2024_PB.csv"
      if (fn.endsWith(".CSV") && fn.includes(ufUpper)) {
        csvContent = new TextDecoder("latin1").decode(data as Uint8Array);
        console.log(`Found CSV: ${filename} (${((data as Uint8Array).length / 1024 / 1024).toFixed(1)}MB)`);
        break;
      }
    }

    // If no state-specific file, try the general one
    if (!csvContent) {
      for (const [filename, data] of Object.entries(unzipped)) {
        if (filename.toUpperCase().endsWith(".CSV")) {
          csvContent = new TextDecoder("latin1").decode(data as Uint8Array);
          console.log(`Using general CSV: ${filename}`);
          break;
        }
      }
    }

    if (!csvContent) {
      return new Response(
        JSON.stringify({ error: "Arquivo CSV não encontrado no ZIP do TSE.", data: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Parse CSV
    const lines = csvContent.split("\n");
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine).map((h) => h.trim().replace(/^"|"$/g, ""));

    // Find column indices
    const idx = (name: string) => headers.findIndex((h) => h === name);
    const iSgUf = idx("SG_UF");
    const iDsCargo = idx("DS_CARGO");
    const iNmCandidato = idx("NM_CANDIDATO");
    const iNmUrna = idx("NM_URNA_CANDIDATO");
    const iSgPartido = idx("SG_PARTIDO");
    const iNrCandidato = idx("NR_CANDIDATO");
    const iDsSitTot = idx("DS_SIT_TOT_TURNO");
    const iQtVotos = idx("QT_VOTOS_NOMINAIS");
    const iQtVotosAlt = idx("QT_VOTOS");
    const iNmMunicipio = idx("NM_MUNICIPIO");
    const iNrTurno = idx("NR_TURNO");

    console.log(`Parsing ${lines.length} lines. Key indices: UF=${iSgUf}, Cargo=${iDsCargo}, Votos=${iQtVotos}/${iQtVotosAlt}`);

    const voteMap = new Map<string, any>();

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const fields = parseCSVLine(line);
      const clean = (idx: number) => (fields[idx] || "").replace(/^"|"$/g, "").trim();

      const rowUf = iSgUf >= 0 ? clean(iSgUf) : "";
      if (rowUf !== ufUpper) continue;

      const rowCargo = iDsCargo >= 0 ? clean(iDsCargo) : "";
      if (!cargoValues.includes(rowCargo.toUpperCase())) continue;

      const nomeCand = iNmCandidato >= 0 ? clean(iNmCandidato) : "";
      const nomeUrna = iNmUrna >= 0 ? clean(iNmUrna) : "";
      const partido = iSgPartido >= 0 ? clean(iSgPartido) : "";
      const numero = iNrCandidato >= 0 ? clean(iNrCandidato) : "";
      const situacao = iDsSitTot >= 0 ? clean(iDsSitTot) : "";
      const votos = parseInt(iQtVotos >= 0 ? clean(iQtVotos) : (iQtVotosAlt >= 0 ? clean(iQtVotosAlt) : "0")) || 0;
      const turno = parseInt(iNrTurno >= 0 ? clean(iNrTurno) : "1") || 1;

      const key = `${nomeCand}-${partido}-${numero}-${turno}`;

      if (voteMap.has(key)) {
        const existing = voteMap.get(key);
        existing.qtd_votos += votos;
        if (situacao.toUpperCase().includes("ELEIT") && !situacao.toUpperCase().includes("NÃO")) {
          existing.situacao_eleito = situacao;
        }
      } else {
        voteMap.set(key, {
          ano_eleicao: ano,
          sigla_uf: ufUpper,
          cargo,
          nome_candidato: nomeCand,
          nome_urna: nomeUrna,
          sigla_partido: partido,
          numero_candidato: numero,
          situacao_eleito: situacao,
          qtd_votos: votos,
          nome_municipio: "Todos",
          turno,
        });
      }
    }

    const aggregated = Array.from(voteMap.values());
    console.log(`Parsed ${aggregated.length} candidates for ${ufUpper}/${cargo}`);

    // 4. Save to cache (batch insert)
    if (aggregated.length > 0) {
      // Insert in batches of 500
      for (let i = 0; i < aggregated.length; i += 500) {
        const batch = aggregated.slice(i, i + 500);
        const { error: insertError } = await supabase
          .from("dados_eleitorais_cache")
          .insert(batch);
        if (insertError) console.error("Cache insert error:", insertError);
      }
    }

    // 5. Filter by name and return
    let results = aggregated;
    if (nome_candidato && nome_candidato.trim()) {
      const search = nome_candidato.trim().toUpperCase();
      results = results.filter(
        (r) =>
          r.nome_candidato.toUpperCase().includes(search) ||
          (r.nome_urna && r.nome_urna.toUpperCase().includes(search))
      );
    }

    results.sort((a, b) => b.qtd_votos - a.qtd_votos);

    return new Response(
      JSON.stringify({ data: results.slice(0, 500), source: "tse" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: `Erro ao consultar dados eleitorais: ${error.message || "erro desconhecido"}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
