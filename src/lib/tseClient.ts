import { unzipSync } from "fflate";
import { supabase } from "@/integrations/supabase/client";

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

export interface ResultadoEleitoral {
  id?: string;
  nome_candidato: string;
  nome_urna: string;
  sigla_partido: string;
  numero_candidato: string;
  situacao_eleito: string;
  qtd_votos: number;
  nome_municipio: string;
  turno: number;
}

interface CacheRow {
  ano_eleicao: number;
  sigla_uf: string;
  cargo: string;
  nome_candidato: string;
  nome_urna: string;
  sigla_partido: string;
  numero_candidato: string;
  situacao_eleito: string;
  qtd_votos: number;
  nome_municipio: string;
  turno: number;
}

export async function consultarDadosEleitorais(
  ano: number,
  uf: string,
  cargo: string,
  nomeCandidato?: string,
  onProgress?: (msg: string) => void,
): Promise<{ data: ResultadoEleitoral[]; source: string }> {
  const ufUpper = uf.toUpperCase();
  const progress = onProgress || (() => {});

  // 1. Check cache
  progress("Consultando cache...");
  let query = supabase
    .from("dados_eleitorais_cache")
    .select("*")
    .eq("ano_eleicao", ano)
    .eq("sigla_uf", ufUpper)
    .eq("cargo", cargo);

  if (nomeCandidato?.trim()) {
    query = query.ilike("nome_candidato", `%${nomeCandidato.trim()}%`);
  }

  const { data: cached, error: cacheError } = await query
    .order("qtd_votos", { ascending: false })
    .limit(500);

  if (cacheError) console.error("Cache query error:", cacheError);

  if (cached && cached.length > 0) {
    return { data: cached as ResultadoEleitoral[], source: "cache" };
  }

  // Check if cache has data but name filter didn't match
  if (nomeCandidato?.trim()) {
    const { data: anyData } = await supabase
      .from("dados_eleitorais_cache")
      .select("id")
      .eq("ano_eleicao", ano)
      .eq("sigla_uf", ufUpper)
      .eq("cargo", cargo)
      .limit(1);

    if (anyData && anyData.length > 0) {
      return { data: [], source: "cache" };
    }
  }

  // 2. Download ZIP from TSE (browser can access CDN)
  const cdnUrl = CDN_URLS[ano];
  if (!cdnUrl) throw new Error(`Ano ${ano} não suportado.`);

  progress("Baixando dados do TSE... (pode demorar 30-60s)");

  const resp = await fetch(cdnUrl);
  if (!resp.ok) {
    throw new Error(`Falha ao baixar dados do TSE (status ${resp.status}).`);
  }

  progress("Descompactando arquivo...");
  const zipBuffer = new Uint8Array(await resp.arrayBuffer());
  const unzipped = unzipSync(zipBuffer);

  // Find per-UF CSV
  const cargoValues = cargoMap[cargo] || [cargo.toUpperCase()];
  let csvData: Uint8Array | null = null;

  for (const [filename, data] of Object.entries(unzipped)) {
    const fn = filename.toUpperCase();
    if (fn.endsWith(".CSV") && fn.includes(ufUpper)) {
      csvData = data as Uint8Array;
      break;
    }
  }

  if (!csvData) {
    for (const [filename, data] of Object.entries(unzipped)) {
      if (filename.toUpperCase().endsWith(".CSV")) {
        csvData = data as Uint8Array;
        break;
      }
    }
  }

  if (!csvData) throw new Error("CSV não encontrado no arquivo ZIP.");

  progress("Processando resultados...");
  const csvContent = new TextDecoder("latin1").decode(csvData);

  // Parse CSV incrementally
  const voteMap = new Map<string, CacheRow>();
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

    if (iSgUf >= 0 && clean(iSgUf) !== ufUpper) continue;
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
      const existing = voteMap.get(key)!;
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

  // 3. Save to cache
  if (aggregated.length > 0) {
    progress("Salvando no cache...");
    for (let i = 0; i < aggregated.length; i += 500) {
      const batch = aggregated.slice(i, i + 500);
      const { error: insertError } = await supabase
        .from("dados_eleitorais_cache")
        .insert(batch);
      if (insertError) console.error("Cache insert error:", insertError);
    }
  }

  // 4. Filter and return
  let results: ResultadoEleitoral[] = aggregated;
  if (nomeCandidato?.trim()) {
    const search = nomeCandidato.trim().toUpperCase();
    results = results.filter(
      (r) =>
        r.nome_candidato.toUpperCase().includes(search) ||
        (r.nome_urna && r.nome_urna.toUpperCase().includes(search))
    );
  }

  results.sort((a, b) => b.qtd_votos - a.qtd_votos);
  return { data: results.slice(0, 500), source: "tse" };
}
