import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Cidade, CidadeInsert, CidadeMidia } from "@/types/cidade";

function parseJsonbArray(val: any): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

export function useCidades() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["cidades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cidades")
        .select("*")
        .order("nome");
      if (error) throw error;
      return (data as any[]).map((c) => ({
        ...c,
        recursos_destinados: parseJsonbArray(c.recursos_destinados),
        emendas_parlamentares: parseJsonbArray(c.emendas_parlamentares),
      })) as Cidade[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (cidade: CidadeInsert) => {
      if (!user) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("cidades")
        .insert({
          ...cidade,
          user_id: user.id,
          recursos_destinados: cidade.recursos_destinados as any,
          emendas_parlamentares: cidade.emendas_parlamentares as any,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Cidade;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cidades"] });
      toast({ title: "Cidade cadastrada com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao cadastrar cidade", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Cidade> & { id: string }) => {
      const payload: any = { ...data };
      if (data.recursos_destinados) payload.recursos_destinados = data.recursos_destinados;
      if (data.emendas_parlamentares) payload.emendas_parlamentares = data.emendas_parlamentares;
      const { error } = await supabase
        .from("cidades")
        .update(payload as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cidades"] });
      toast({ title: "Cidade atualizada!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar cidade", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cidades").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cidades"] });
      toast({ title: "Cidade removida!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao remover cidade", description: error.message, variant: "destructive" });
    },
  });

  return {
    cidades: query.data ?? [],
    isLoading: query.isLoading,
    createCidade: createMutation.mutateAsync,
    updateCidade: updateMutation.mutateAsync,
    deleteCidade: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

// Hook for cidade media
export function useCidadeMidias(cidadeId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["cidade_midias", cidadeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cidade_midias" as any)
        .select("*")
        .eq("cidade_id", cidadeId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as CidadeMidia[];
    },
    enabled: !!user && !!cidadeId,
  });

  const uploadMidia = useMutation({
    mutationFn: async ({ file, descricao, cidadeId }: { file: File; descricao: string; cidadeId: string }) => {
      if (!user) throw new Error("Não autenticado");
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/cidades/${cidadeId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("midias").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("midias").getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("cidade_midias" as any).insert({
        cidade_id: cidadeId,
        user_id: user.id,
        arquivo_url: urlData.publicUrl,
        arquivo_nome: file.name,
        arquivo_tipo: file.type,
        descricao: descricao || "",
      } as any);
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cidade_midias"] });
      toast({ title: "Mídia adicionada!" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao enviar mídia", description: err.message, variant: "destructive" });
    },
  });

  const deleteMidia = useMutation({
    mutationFn: async (midia: CidadeMidia) => {
      const url = new URL(midia.arquivo_url);
      const pathParts = url.pathname.split("/storage/v1/object/public/midias/");
      if (pathParts[1]) {
        await supabase.storage.from("midias").remove([pathParts[1]]);
      }
      const { error } = await supabase.from("cidade_midias" as any).delete().eq("id", midia.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cidade_midias"] });
      toast({ title: "Mídia removida!" });
    },
    onError: (err: any) => {
      toast({ title: "Erro ao remover mídia", description: err.message, variant: "destructive" });
    },
  });

  return {
    midias: query.data ?? [],
    isLoading: query.isLoading,
    uploadMidia: uploadMidia.mutateAsync,
    isUploading: uploadMidia.isPending,
    deleteMidia: deleteMidia.mutateAsync,
  };
}
