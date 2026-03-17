import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { LembreteInsert, LembreteUpdate } from "@/types/lembrete";

export function useLembretes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["lembretes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lembretes" as any)
        .select("*")
        .eq("user_id", user!.id)
        .order("data_lembrete", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (lembrete: LembreteInsert) => {
      const { error } = await supabase
        .from("lembretes" as any)
        .insert(lembrete as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lembretes"] });
      toast({ title: "Lembrete criado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar lembrete", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: LembreteUpdate & { id: string }) => {
      const { error } = await supabase
        .from("lembretes" as any)
        .update(data as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lembretes"] });
      toast({ title: "Lembrete atualizado!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar lembrete", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lembretes" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lembretes"] });
      toast({ title: "Lembrete excluído!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir lembrete", variant: "destructive" });
    },
  });

  return {
    lembretes: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
