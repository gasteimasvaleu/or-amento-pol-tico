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
