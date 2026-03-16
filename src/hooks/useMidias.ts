import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Midia } from "@/types/midia";

export function useMidias(categoria?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["midias", categoria],
    queryFn: async () => {
      let q = supabase
        .from("midias" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (categoria && categoria !== "todas") {
        q = q.eq("categoria", categoria);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as Midia[];
    },
    enabled: !!user,
  });

  const uploadAndCreate = useMutation({
    mutationFn: async ({
      file,
      titulo,
      descricao,
      categoria,
      tags,
    }: {
      file: File;
      titulo: string;
      descricao?: string;
      categoria: string;
      tags?: string[];
    }) => {
      if (!user) throw new Error("Não autenticado");

      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("midias")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("midias")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("midias" as any).insert({
        user_id: user.id,
        titulo,
        descricao: descricao || null,
        categoria,
        tags: tags?.length ? tags : null,
        arquivo_url: urlData.publicUrl,
        arquivo_nome: file.name,
        arquivo_tipo: file.type,
        arquivo_tamanho: file.size,
      } as any);

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["midias"] });
      toast({ title: "Mídia adicionada com sucesso!" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao adicionar mídia", description: err.message, variant: "destructive" });
    },
  });

  const deleteMidia = useMutation({
    mutationFn: async (midia: Midia) => {
      // Extract file path from URL
      const url = new URL(midia.arquivo_url);
      const pathParts = url.pathname.split("/storage/v1/object/public/midias/");
      if (pathParts[1]) {
        await supabase.storage.from("midias").remove([pathParts[1]]);
      }

      const { error } = await supabase.from("midias" as any).delete().eq("id", midia.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["midias"] });
      toast({ title: "Mídia excluída!" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
    },
  });

  return { midias: query.data ?? [], isLoading: query.isLoading, uploadAndCreate, deleteMidia };
}
