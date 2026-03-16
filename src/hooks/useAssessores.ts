import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Assessor {
  id: string;
  user_id: string;
  nome: string;
  cargo: string;
  telefone: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type AssessorInsert = Omit<Assessor, "id" | "created_at" | "updated_at">;

export function useAssessores() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["assessores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assessores" as any)
        .select("*")
        .order("nome");
      if (error) throw error;
      return (data as any[]) as Assessor[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (assessor: Omit<AssessorInsert, "user_id">) => {
      if (!user) throw new Error("Não autenticado");
      const { data, error } = await supabase
        .from("assessores" as any)
        .insert({ ...assessor, user_id: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Assessor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessores"] });
      toast({ title: "Assessor cadastrado com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao cadastrar assessor", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...assessor }: Partial<Assessor> & { id: string }) => {
      const { data, error } = await supabase
        .from("assessores" as any)
        .update(assessor as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Assessor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessores"] });
      toast({ title: "Assessor atualizado com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao atualizar assessor", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("assessores" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessores"] });
      toast({ title: "Assessor removido com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao remover assessor", description: error.message, variant: "destructive" });
    },
  });

  return {
    assessores: query.data ?? [],
    isLoading: query.isLoading,
    createAssessor: createMutation.mutateAsync,
    updateAssessor: updateMutation.mutateAsync,
    deleteAssessor: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
