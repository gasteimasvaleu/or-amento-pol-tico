import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { CompromissoInsert, CompromissoUpdate } from "@/types/compromisso";

export function useCompromissos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["compromissos", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compromissos" as any)
        .select("*")
        .eq("user_id", user!.id)
        .order("data_inicio", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (compromisso: CompromissoInsert) => {
      const { error } = await supabase
        .from("compromissos" as any)
        .insert(compromisso as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compromissos"] });
      toast({ title: "Compromisso criado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar compromisso", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: CompromissoUpdate & { id: string }) => {
      const { error } = await supabase
        .from("compromissos" as any)
        .update(data as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compromissos"] });
      toast({ title: "Compromisso atualizado!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar compromisso", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("compromissos" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compromissos"] });
      toast({ title: "Compromisso excluído!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir compromisso", variant: "destructive" });
    },
  });

  return {
    compromissos: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
