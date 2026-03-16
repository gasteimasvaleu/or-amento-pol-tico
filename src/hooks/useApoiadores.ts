import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Apoiador, ApoiadorInsert } from "@/types/apoiador";

export function useApoiadores() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["apoiadores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("apoiadores" as any)
        .select("*")
        .order("nome");
      if (error) throw error;
      return (data as any[]) as Apoiador[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (apoiador: ApoiadorInsert) => {
      if (!user) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("apoiadores" as any)
        .insert({ ...apoiador, user_id: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Apoiador;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apoiadores"] });
      toast({ title: "Apoiador cadastrado com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao cadastrar apoiador", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("apoiadores" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apoiadores"] });
      toast({ title: "Apoiador removido com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao remover apoiador", description: error.message, variant: "destructive" });
    },
  });

  return {
    apoiadores: query.data ?? [],
    isLoading: query.isLoading,
    createApoiador: createMutation.mutateAsync,
    deleteApoiador: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
