import { supabase } from "@/integrations/supabase/client";

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

export async function consultarDadosEleitorais(
  ano: number,
  uf: string,
  cargo: string,
  nomeCandidato?: string,
  municipio?: string,
  onProgress?: (msg: string) => void,
): Promise<{ data: ResultadoEleitoral[]; source: string }> {
  const progress = onProgress || (() => {});

  progress("Consultando dados eleitorais...");

  const { data, error } = await supabase.functions.invoke("consultar-dados-eleitorais", {
    body: { ano, uf, cargo, nome_candidato: nomeCandidato, municipio },
  });

  if (error) {
    throw new Error(error.message || "Falha ao consultar dados eleitorais.");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    data: data?.data || [],
    source: data?.source || "unknown",
  };
}

// --- CSV Import (temporary) ---

const CARGO_MAP: Record<string, string> = {
  "PRESIDENTE": "Presidente",
  "GOVERNADOR": "Governador",
  "SENADOR": "Senador",
  "DEPUTADO FEDERAL": "Deputado Federal",
  "DEPUTADO ESTADUAL": "Deputado Estadual",
  "DEPUTADO DISTRITAL": "Deputado Estadual",
  "PREFEITO": "Prefeito",
  "VEREADOR": "Vereador",
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

export interface ImportProgress {
  phase: string;
  percent: number;
  detail?: string;
}

export async function importarCSVEleitoral(
  file: File,
  onProgress: (p: ImportProgress) => void,
): Promise<{ candidatos: number; uf: string; ano: number }> {
  onProgress({ phase: "Lendo arquivo...", percent: 0 });

  const totalBytes = file.size;
  let bytesRead = 0;
  const reader = file.stream().getReader();
  const decoder = new TextDecoder("iso-8859-1");

  let remainder = "";
  let headerParsed = false;
  let hdrs: string[] = [];

  let iAno = -1, iSgUf = -1, iDsCargo = -1, iNmCandidato = -1, iNmUrna = -1;
  let iSgPartido = -1, iNrCandidato = -1, iDsSitTot = -1, iQtVotos = -1, iQtVotosAlt = -1, iNrTurno = -1;
  let iNmMunicipio = -1;

  const voteMap = new Map<string, any>();
  let detectedUf = "";
  let detectedAno = 0;
  let lineCount = 0;
  let lastProgressUpdate = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    bytesRead += value.byteLength;
    const chunk = decoder.decode(value, { stream: true });
    remainder += chunk;

    const parts = remainder.split("\n");
    remainder = parts.pop() || "";

    for (const rawLine of parts) {
      const line = rawLine.trim();
      if (!line) continue;

      if (!headerParsed) {
        hdrs = parseCSVLine(line).map(h => h.trim().replace(/^"|"$/g, ""));
        const idx = (name: string) => hdrs.findIndex(h => h === name);
        iAno = idx("ANO_ELEICAO");
        iSgUf = idx("SG_UF");
        iDsCargo = idx("DS_CARGO");
        iNmCandidato = idx("NM_CANDIDATO");
        iNmUrna = idx("NM_URNA_CANDIDATO");
        iSgPartido = idx("SG_PARTIDO");
        iNrCandidato = idx("NR_CANDIDATO");
        iDsSitTot = idx("DS_SIT_TOT_TURNO");
        iQtVotos = idx("QT_VOTOS_NOMINAIS");
        iQtVotosAlt = idx("QT_VOTOS");
        iNrTurno = idx("NR_TURNO");
        iNmMunicipio = idx("NM_MUNICIPIO");

        if (iNmCandidato === -1) throw new Error("Coluna NM_CANDIDATO não encontrada. Verifique se é o CSV correto.");
        headerParsed = true;
        continue;
      }

      lineCount++;

      // Update progress every ~100k lines or 2MB
      const now = bytesRead;
      if (now - lastProgressUpdate > 2_000_000) {
        lastProgressUpdate = now;
        const pct = Math.min(55, Math.round((bytesRead / totalBytes) * 55));
        onProgress({
          phase: "Processando linhas...",
          percent: pct,
          detail: `${lineCount.toLocaleString("pt-BR")} linhas · ${Math.round(bytesRead / 1_048_576)}MB / ${Math.round(totalBytes / 1_048_576)}MB`,
        });
        await new Promise(r => setTimeout(r, 0));
      }

      const fields = parseCSVLine(line);
      const clean = (i: number) => (fields[i] || "").replace(/^"|"$/g, "").trim();

      const rawCargo = iDsCargo >= 0 ? clean(iDsCargo).toUpperCase() : "";
      const cargo = CARGO_MAP[rawCargo];
      if (!cargo) continue;

      const nomeCand = iNmCandidato >= 0 ? clean(iNmCandidato) : "";
      const nomeUrna = iNmUrna >= 0 ? clean(iNmUrna) : "";
      const partido = iSgPartido >= 0 ? clean(iSgPartido) : "";
      const numero = iNrCandidato >= 0 ? clean(iNrCandidato) : "";
      const situacao = iDsSitTot >= 0 ? clean(iDsSitTot) : "";
      const votos = parseInt(iQtVotos >= 0 ? clean(iQtVotos) : (iQtVotosAlt >= 0 ? clean(iQtVotosAlt) : "0")) || 0;
      const turno = parseInt(iNrTurno >= 0 ? clean(iNrTurno) : "1") || 1;
      const uf = iSgUf >= 0 ? clean(iSgUf).toUpperCase() : "";
      const ano = iAno >= 0 ? parseInt(clean(iAno)) : 0;
      const municipio = iNmMunicipio >= 0 ? clean(iNmMunicipio) : "";

      if (!detectedUf && uf) detectedUf = uf;
      if (!detectedAno && ano) detectedAno = ano;

      const key = `${nomeCand}-${partido}-${numero}-${turno}-${cargo}-${municipio}`;

      if (voteMap.has(key)) {
        const existing = voteMap.get(key);
        existing.qtd_votos += votos;
        if (situacao.toUpperCase().includes("ELEIT") && !situacao.toUpperCase().includes("NÃO")) {
          existing.situacao_eleito = situacao;
        }
      } else {
        voteMap.set(key, {
          ano_eleicao: ano || detectedAno,
          sigla_uf: uf || detectedUf,
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
  }

  // Process any remaining partial line
  if (remainder.trim() && headerParsed) {
    const fields = parseCSVLine(remainder.trim());
    const clean = (i: number) => (fields[i] || "").replace(/^"|"$/g, "").trim();
    const rawCargo = iDsCargo >= 0 ? clean(iDsCargo).toUpperCase() : "";
    const cargo = CARGO_MAP[rawCargo];
    if (cargo) {
      const nomeCand = iNmCandidato >= 0 ? clean(iNmCandidato) : "";
      const nomeUrna = iNmUrna >= 0 ? clean(iNmUrna) : "";
      const partido = iSgPartido >= 0 ? clean(iSgPartido) : "";
      const numero = iNrCandidato >= 0 ? clean(iNrCandidato) : "";
      const situacao = iDsSitTot >= 0 ? clean(iDsSitTot) : "";
      const votos = parseInt(iQtVotos >= 0 ? clean(iQtVotos) : (iQtVotosAlt >= 0 ? clean(iQtVotosAlt) : "0")) || 0;
      const turno = parseInt(iNrTurno >= 0 ? clean(iNrTurno) : "1") || 1;
      const uf = iSgUf >= 0 ? clean(iSgUf).toUpperCase() : "";
      const ano = iAno >= 0 ? parseInt(clean(iAno)) : 0;
      const key = `${nomeCand}-${partido}-${numero}-${turno}-${cargo}`;
      if (voteMap.has(key)) {
        voteMap.get(key).qtd_votos += votos;
      } else {
        voteMap.set(key, {
          ano_eleicao: ano || detectedAno, sigla_uf: uf || detectedUf, cargo,
          nome_candidato: nomeCand, nome_urna: nomeUrna, sigla_partido: partido,
          numero_candidato: numero, situacao_eleito: situacao, qtd_votos: votos,
          nome_municipio: "Todos", turno,
        });
      }
    }
  }

  const aggregated = Array.from(voteMap.values());
  if (aggregated.length === 0) throw new Error("Nenhum candidato encontrado no CSV.");

  const uf = detectedUf || aggregated[0]?.sigla_uf;
  const ano = detectedAno || aggregated[0]?.ano_eleicao;

  onProgress({ phase: "Limpando cache anterior...", percent: 60, detail: `${uf} / ${ano}` });

  // Delete existing cache for this UF+year
  const { error: delError } = await supabase
    .from("dados_eleitorais_cache")
    .delete()
    .eq("ano_eleicao", ano)
    .eq("sigla_uf", uf);

  if (delError) console.error("Delete error:", delError);

  // Insert in batches
  const BATCH_SIZE = 500;
  for (let i = 0; i < aggregated.length; i += BATCH_SIZE) {
    const batch = aggregated.slice(i, i + BATCH_SIZE);
    const pct = 60 + Math.round((i / aggregated.length) * 35);
    onProgress({
      phase: "Inserindo no banco...",
      percent: pct,
      detail: `${Math.min(i + BATCH_SIZE, aggregated.length)} / ${aggregated.length} registros`,
    });

    const { error: insertError } = await supabase
      .from("dados_eleitorais_cache")
      .insert(batch);

    if (insertError) {
      throw new Error(`Erro ao inserir lote: ${insertError.message}`);
    }
  }

  onProgress({ phase: "Concluído!", percent: 100, detail: `${aggregated.length} candidatos importados` });

  return { candidatos: aggregated.length, uf, ano };
}
