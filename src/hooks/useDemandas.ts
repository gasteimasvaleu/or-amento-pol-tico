import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Demanda, DemandaInsert, DemandaHistorico, DemandaAnexo, DemandaStatus } from "@/types/eleitor";

export function useDemandas(eleitorId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["demandas", eleitorId],
    queryFn: async () => {
      let q = supabase.from("demandas" as any).select("*").order("created_at", { ascending: false });
      if (eleitorId) q = q.eq("eleitor_id", eleitorId);
      const { data, error } = await q;
      if (error) throw error;
      return (data as any[]) as Demanda[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (demanda: DemandaInsert) => {
      if (!user) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("demandas" as any)
        .insert({ ...demanda, user_id: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Demanda;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demandas"] });
      toast({ title: "Demanda criada com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao criar demanda", description: error.message, variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DemandaStatus }) => {
      const { error } = await supabase
        .from("demandas" as any)
        .update({ status } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demandas"] });
      toast({ title: "Status atualizado!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("demandas" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demandas"] });
      toast({ title: "Demanda removida!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao remover demanda", description: error.message, variant: "destructive" });
    },
  });

  return {
    demandas: query.data ?? [],
    isLoading: query.isLoading,
    createDemanda: createMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    deleteDemanda: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

export function useDemandaHistorico(demandaId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["demanda_historico", demandaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demanda_historico" as any)
        .select("*")
        .eq("demanda_id", demandaId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]) as DemandaHistorico[];
    },
    enabled: !!demandaId,
  });

  const addEntry = useMutation({
    mutationFn: async ({ demanda_id, descricao }: { demanda_id: string; descricao: string }) => {
      const { error } = await supabase
        .from("demanda_historico" as any)
        .insert({ demanda_id, descricao } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demanda_historico", demandaId] });
      toast({ title: "Registro adicionado ao histórico!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao registrar histórico", description: error.message, variant: "destructive" });
    },
  });

  return {
    historico: query.data ?? [],
    isLoading: query.isLoading,
    addHistorico: addEntry.mutateAsync,
  };
}

export function useDemandaAnexos(demandaId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["demanda_anexos", demandaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demanda_anexos" as any)
        .select("*")
        .eq("demanda_id", demandaId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]) as DemandaAnexo[];
    },
    enabled: !!demandaId,
  });

  const uploadAnexo = useMutation({
    mutationFn: async ({ demanda_id, file }: { demanda_id: string; file: File }) => {
      const filePath = `${demanda_id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("demandas")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("demandas")
        .getPublicUrl(filePath);

      const { error } = await supabase
        .from("demanda_anexos" as any)
        .insert({
          demanda_id,
          arquivo_url: publicUrl,
          arquivo_nome: file.name,
          arquivo_tipo: file.type,
        } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demanda_anexos", demandaId] });
      toast({ title: "Anexo enviado!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao enviar anexo", description: error.message, variant: "destructive" });
    },
  });

  const deleteAnexo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("demanda_anexos" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demanda_anexos", demandaId] });
      toast({ title: "Anexo removido!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao remover anexo", description: error.message, variant: "destructive" });
    },
  });

  return {
    anexos: query.data ?? [],
    isLoading: query.isLoading,
    uploadAnexo: uploadAnexo.mutateAsync,
    deleteAnexo: deleteAnexo.mutateAsync,
    isUploading: uploadAnexo.isPending,
  };
}
