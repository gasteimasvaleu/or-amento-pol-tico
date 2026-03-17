import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Cidade, CidadeInsert } from "@/types/cidade";

export function useCidades() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["cidades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cidades" as any)
        .select("*")
        .order("nome");
      if (error) throw error;
      return (data as any[]) as Cidade[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (cidade: CidadeInsert) => {
      if (!user) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("cidades" as any)
        .insert({ ...cidade, user_id: user.id } as any)
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
      const { error } = await supabase
        .from("cidades" as any)
        .update(data as any)
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
      const { error } = await supabase
        .from("cidades" as any)
        .delete()
        .eq("id", id);
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
