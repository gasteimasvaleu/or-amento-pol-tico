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
  onProgress?: (msg: string) => void,
): Promise<{ data: ResultadoEleitoral[]; source: string }> {
  const progress = onProgress || (() => {});

  progress("Consultando dados eleitorais...");

  const { data, error } = await supabase.functions.invoke("consultar-dados-eleitorais", {
    body: { ano, uf, cargo, nome_candidato: nomeCandidato },
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

  const buffer = await file.arrayBuffer();
  const text = new TextDecoder("iso-8859-1").decode(buffer);
  const lines = text.split("\n");

  if (lines.length < 2) throw new Error("Arquivo vazio ou inválido.");

  // Parse header
  const hdrs = parseCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ""));
  const idx = (name: string) => hdrs.findIndex(h => h === name);

  const iAno = idx("ANO_ELEICAO");
  const iSgUf = idx("SG_UF");
  const iDsCargo = idx("DS_CARGO");
  const iNmCandidato = idx("NM_CANDIDATO");
  const iNmUrna = idx("NM_URNA_CANDIDATO");
  const iSgPartido = idx("SG_PARTIDO");
  const iNrCandidato = idx("NR_CANDIDATO");
  const iDsSitTot = idx("DS_SIT_TOT_TURNO");
  const iQtVotos = idx("QT_VOTOS_NOMINAIS");
  const iQtVotosAlt = idx("QT_VOTOS");
  const iNrTurno = idx("NR_TURNO");

  if (iNmCandidato === -1) throw new Error("Coluna NM_CANDIDATO não encontrada. Verifique se é o CSV correto (Votação nominal por município e zona).");

  onProgress({ phase: "Processando linhas...", percent: 5 });

  // Aggregate votes
  const voteMap = new Map<string, any>();
  let detectedUf = "";
  let detectedAno = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (i % 50000 === 0) {
      onProgress({
        phase: "Processando linhas...",
        percent: 5 + Math.round((i / lines.length) * 50),
        detail: `${i.toLocaleString("pt-BR")} / ${lines.length.toLocaleString("pt-BR")} linhas`,
      });
      // yield to UI
      await new Promise(r => setTimeout(r, 0));
    }

    const fields = parseCSVLine(line);
    const clean = (idx: number) => (fields[idx] || "").replace(/^"|"$/g, "").trim();

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

    if (!detectedUf && uf) detectedUf = uf;
    if (!detectedAno && ano) detectedAno = ano;

    const key = `${nomeCand}-${partido}-${numero}-${turno}-${cargo}`;

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
