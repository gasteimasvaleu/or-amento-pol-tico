import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Despesa, DespesaFormData, DespesaFilters } from "@/types/despesa";
import { toast } from "@/hooks/use-toast";

export function useDespesas(filters?: DespesaFilters) {
  return useQuery({
    queryKey: ['despesas', filters],
    queryFn: async () => {
      let query = supabase
        .from('despesas_politicas')
        .select('*')
        .order('ultimo_pagamento', { ascending: false });

      // Apply filters
      if (filters?.municipio && filters.municipio !== 'all') {
        query = query.eq('municipio', filters.municipio);
      }
      
      if (filters?.cargo && filters.cargo !== 'all') {
        query = query.eq('cargo', filters.cargo);
      }
      
      if (filters?.tipo && filters.tipo !== 'all') {
        query = query.eq('tipo', filters.tipo);
      }

      // Filter by month/year if provided
      if (filters?.month !== undefined && filters?.year !== undefined) {
        const startDate = new Date(filters.year, filters.month, 1);
        const endDate = new Date(filters.year, filters.month + 1, 0);
        query = query.gte('ultimo_pagamento', startDate.toISOString().split('T')[0])
                     .lte('ultimo_pagamento', endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Apply search filter on client side
      let filteredData = data as Despesa[];
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredData = filteredData.filter(d => 
          d.municipio.toLowerCase().includes(searchLower) ||
          d.responsavel.toLowerCase().includes(searchLower) ||
          d.cargo.toLowerCase().includes(searchLower) ||
          d.conta_pix.toLowerCase().includes(searchLower)
        );
      }

      return filteredData;
    },
  });
}

export function useCreateDespesa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DespesaFormData) => {
      const { data: result, error } = await supabase
        .from('despesas_politicas')
        .insert([{
          municipio: data.municipio,
          responsavel: data.responsavel,
          cargo: data.cargo,
          tipo: data.tipo,
          conta_pix: data.conta_pix,
          ultimo_pagamento: data.ultimo_pagamento.toISOString().split('T')[0],
          valor: data.valor,
          observacao: data.observacao,
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      toast({
        title: "Despesa registrada",
        description: "A despesa foi registrada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar despesa",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateDespesa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DespesaFormData> }) => {
      const updateData: any = { ...data };
      if (data.ultimo_pagamento) {
        updateData.ultimo_pagamento = data.ultimo_pagamento.toISOString().split('T')[0];
      }

      const { data: result, error } = await supabase
        .from('despesas_politicas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      toast({
        title: "Despesa atualizada",
        description: "A despesa foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar despesa",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteDespesa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('despesas_politicas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      toast({
        title: "Despesa excluída",
        description: "A despesa foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir despesa",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDespesa(id: string) {
  return useQuery({
    queryKey: ['despesa', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('despesas_politicas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Despesa;
    },
    enabled: !!id,
  });
}
