import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Eleitor, EleitorInsert } from "@/types/eleitor";

export function useEleitores() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["eleitores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("eleitores" as any)
        .select("*")
        .order("nome");
      if (error) throw error;
      return (data as any[]) as Eleitor[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (eleitor: EleitorInsert) => {
      if (!user) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("eleitores" as any)
        .insert({ ...eleitor, user_id: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Eleitor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eleitores"] });
      toast({ title: "Eleitor cadastrado com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao cadastrar eleitor", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Eleitor> & { id: string }) => {
      const { error } = await supabase
        .from("eleitores" as any)
        .update(data as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eleitores"] });
      toast({ title: "Eleitor atualizado!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar eleitor", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("eleitores" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eleitores"] });
      toast({ title: "Eleitor removido!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao remover eleitor", description: error.message, variant: "destructive" });
    },
  });

  return {
    eleitores: query.data ?? [],
    isLoading: query.isLoading,
    createEleitor: createMutation.mutateAsync,
    updateEleitor: updateMutation.mutateAsync,
    deleteEleitor: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
