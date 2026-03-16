import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { unzipSync } from "https://esm.sh/fflate@0.8.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const CARGOS_2022 = ["Presidente", "Governador", "Senador", "Deputado Federal", "Deputado Estadual"];
const CARGOS_2024 = ["Prefeito", "Vereador"];

const cargoMap: Record<string, string[]> = {
  "Presidente": ["PRESIDENTE"],
  "Governador": ["GOVERNADOR"],
  "Senador": ["SENADOR"],
  "Deputado Federal": ["DEPUTADO FEDERAL"],
  "Deputado Estadual": ["DEPUTADO ESTADUAL", "DEPUTADO DISTRITAL"],
  "Prefeito": ["PREFEITO"],
  "Vereador": ["VEREADOR"],
};

const CDN_URLS: Record<number, string> = {
  2024: "https://dadosabertos.tse.jus.br/dataset/0d672aac-5b5c-4f58-a95f-12078b567703/resource/c5e1bff9-98f1-4d3b-b944-37cd22c84112/download/votacao_candidato_munzona_2024.zip",
  2022: "https://dadosabertos.tse.jus.br/dataset/resultados-2022/resource/08a743ad-91f0-468b-aaab-23b06bbb244b/download/votacao_candidato_munzona_2022.zip",
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

async function fetchWithRetry(url: string, timeoutMs = 120000): Promise<Response> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(timer);
      if (resp.ok) return resp;
      if (attempt === 0 && resp.status >= 500) {
        console.log(`TSE returned ${resp.status}, retrying...`);
        await resp.text();
        continue;
      }
      return resp;
    } catch (err) {
      clearTimeout(timer);
      if (attempt === 0) {
        console.log(`Fetch attempt failed: ${err.message}, retrying...`);
        continue;
      }
      throw err;
    }
  }
  throw new Error("Fetch failed after retries");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ano, uf, cargo, nome_candidato } = await req.json();

    if (!ano || !uf || !cargo) {
      return jsonResponse({ error: "Campos obrigatórios: ano, uf, cargo" }, 400);
    }

    // Validate ano x cargo
    const validCargos = ano === 2024 ? CARGOS_2024 : CARGOS_2022;
    if (!validCargos.includes(cargo)) {
      return jsonResponse({
        error: `Cargo "${cargo}" não é válido para o ano ${ano}. Cargos disponíveis: ${validCargos.join(", ")}.`,
        data: [],
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const ufUpper = uf.toUpperCase();

    // 1. Check cache
    let query = supabase
      .from("dados_eleitorais_cache")
      .select("*")
      .eq("ano_eleicao", ano)
      .eq("sigla_uf", ufUpper)
      .eq("cargo", cargo);

    if (nome_candidato?.trim()) {
      query = query.ilike("nome_candidato", `%${nome_candidato.trim()}%`);
    }

    const { data: cached, error: cacheError } = await query
      .order("qtd_votos", { ascending: false })
      .limit(500);

    if (cacheError) console.error("Cache query error:", cacheError);

    if (cached && cached.length > 0) {
      return jsonResponse({ data: cached, source: "cache" });
    }

    // If name filter didn't match but cache exists for this combo
    if (nome_candidato?.trim()) {
      const { data: anyData } = await supabase
        .from("dados_eleitorais_cache")
        .select("id")
        .eq("ano_eleicao", ano)
        .eq("sigla_uf", ufUpper)
        .eq("cargo", cargo)
        .limit(1);

      if (anyData && anyData.length > 0) {
        return jsonResponse({ data: [], source: "cache" });
      }
    }

    // 2. Download national ZIP from TSE CDN
    const cdnUrl = CDN_URLS[ano];
    if (!cdnUrl) {
      return jsonResponse({ error: `Ano ${ano} não suportado.`, data: [] });
    }
    console.log(`Downloading TSE ZIP: ${cdnUrl}`);

    let zipResp: Response;
    try {
      zipResp = await fetchWithRetry(cdnUrl);
    } catch (err) {
      console.error("Fetch error:", err.message);
      return jsonResponse({
        error: "Timeout ao baixar dados do TSE. Tente novamente em alguns minutos.",
        data: [],
      });
    }

    if (!zipResp.ok) {
      console.error(`TSE returned ${zipResp.status} for ${cdnUrl}`);
      return jsonResponse({
        error: `Falha ao baixar dados do TSE (status ${zipResp.status}). Tente novamente.`,
        data: [],
      });
    }

    const zipBuffer = new Uint8Array(await zipResp.arrayBuffer());
    console.log(`ZIP downloaded: ${(zipBuffer.length / 1024 / 1024).toFixed(1)}MB`);

    const unzipped = unzipSync(zipBuffer);
    const cargoValues = cargoMap[cargo] || [cargo.toUpperCase()];

    // Find per-UF CSV inside the ZIP (national ZIP contains one CSV per state)
    let csvContent: string | null = null;
    for (const [filename, data] of Object.entries(unzipped)) {
      const fn = filename.toUpperCase();
      if (fn.endsWith(".CSV") && fn.includes(ufUpper)) {
        csvContent = new TextDecoder("latin1").decode(data as Uint8Array);
        console.log(`Found CSV: ${filename} (${((data as Uint8Array).length / 1024 / 1024).toFixed(1)}MB)`);
        break;
      }
    }

    // Fallback to any CSV
    if (!csvContent) {
      for (const [filename, data] of Object.entries(unzipped)) {
        if (filename.toUpperCase().endsWith(".CSV")) {
          csvContent = new TextDecoder("latin1").decode(data as Uint8Array);
          console.log(`Using fallback CSV: ${filename}`);
          break;
        }
      }
    }

    if (!csvContent) {
      return jsonResponse({ error: "CSV não encontrado no arquivo ZIP do TSE.", data: [] });
    }

    // 3. Incremental line parsing
    const voteMap = new Map<string, any>();
    let headersParsed = false;
    let iSgUf = -1, iDsCargo = -1, iNmCandidato = -1, iNmUrna = -1;
    let iSgPartido = -1, iNrCandidato = -1, iDsSitTot = -1;
    let iQtVotos = -1, iQtVotosAlt = -1, iNrTurno = -1;

    let lineStart = 0;
    const len = csvContent.length;

    while (lineStart < len) {
      let lineEnd = csvContent.indexOf("\n", lineStart);
      if (lineEnd === -1) lineEnd = len;
      const line = csvContent.substring(lineStart, lineEnd).trim();
      lineStart = lineEnd + 1;
      if (!line) continue;

      if (!headersParsed) {
        const hdrs = parseCSVLine(line).map((h) => h.trim().replace(/^"|"$/g, ""));
        const idx = (name: string) => hdrs.findIndex((h) => h === name);
        iSgUf = idx("SG_UF"); iDsCargo = idx("DS_CARGO");
        iNmCandidato = idx("NM_CANDIDATO"); iNmUrna = idx("NM_URNA_CANDIDATO");
        iSgPartido = idx("SG_PARTIDO"); iNrCandidato = idx("NR_CANDIDATO");
        iDsSitTot = idx("DS_SIT_TOT_TURNO");
        iQtVotos = idx("QT_VOTOS_NOMINAIS"); iQtVotosAlt = idx("QT_VOTOS");
        iNrTurno = idx("NR_TURNO");
        headersParsed = true;
        continue;
      }

      const fields = parseCSVLine(line);
      const clean = (i: number) => (fields[i] || "").replace(/^"|"$/g, "").trim();

      // Filter by cargo early
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

    // 4. Save to cache
    if (aggregated.length > 0) {
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
    if (nome_candidato?.trim()) {
      const search = nome_candidato.trim().toUpperCase();
      results = results.filter(
        (r) =>
          r.nome_candidato.toUpperCase().includes(search) ||
          (r.nome_urna && r.nome_urna.toUpperCase().includes(search))
      );
    }

    results.sort((a, b) => b.qtd_votos - a.qtd_votos);
    return jsonResponse({ data: results.slice(0, 500), source: "tse" });
  } catch (error) {
    console.error("Error:", error);
    return jsonResponse(
      { error: `Erro ao consultar dados eleitorais: ${error.message || "erro desconhecido"}` },
      500
    );
  }
});
