export interface Midia {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string | null;
  categoria: string;
  tags: string[] | null;
  arquivo_url: string;
  arquivo_nome: string;
  arquivo_tipo: string | null;
  arquivo_tamanho: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export const CATEGORIAS_MIDIA = [
  { value: "foto", label: "Fotos de Eventos", color: "bg-blue-500" },
  { value: "arte", label: "Artes e Design", color: "bg-purple-500" },
  { value: "logo", label: "Logomarcas", color: "bg-amber-500" },
  { value: "documento", label: "Documentos Visuais", color: "bg-emerald-500" },
  { value: "video", label: "Vídeos / Mídia", color: "bg-red-500" },
] as const;

export type CategoriaMidia = (typeof CATEGORIAS_MIDIA)[number]["value"];
