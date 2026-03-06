import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Despesa, DespesaFormData, DespesaFilters } from "@/types/despesa";
import { toast } from "@/hooks/use-toast";

export function useDespesas(filters?: DespesaFilters) {
  return useQuery({
    queryKey: ['despesas', filters],
    queryFn: async () => {
      let allData: Despesa[] = [];

      // If month/year filter is provided, fetch recurring and extra expenses separately
      if (filters?.month !== undefined && filters?.year !== undefined) {
        const startDate = new Date(filters.year, filters.month, 1);
        const endDate = new Date(filters.year, filters.month + 1, 0);
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        // Fetch recurring expenses from their registration date onwards
        let recorrentesQuery = supabase
          .from('despesas_politicas')
          .select('*')
          .eq('tipo', 'Recorrente')
          .lte('ultimo_pagamento', endDateStr);

        // Fetch extra expenses only for the selected month
        let extrasQuery = supabase
          .from('despesas_politicas')
          .select('*')
          .eq('tipo', 'Extra')
          .gte('ultimo_pagamento', startDateStr)
          .lte('ultimo_pagamento', endDateStr);

        // Apply municipio filter
        if (filters?.municipio && filters.municipio !== 'all') {
          recorrentesQuery = recorrentesQuery.eq('municipio', filters.municipio);
          extrasQuery = extrasQuery.eq('municipio', filters.municipio);
        }

        // Apply cargo filter
        if (filters?.cargo && filters.cargo !== 'all') {
          recorrentesQuery = recorrentesQuery.eq('cargo', filters.cargo);
          extrasQuery = extrasQuery.eq('cargo', filters.cargo);
        }

        // Execute both queries
        const [recorrentesResult, extrasResult] = await Promise.all([
          recorrentesQuery,
          extrasQuery
        ]);

        if (recorrentesResult.error) throw recorrentesResult.error;
        if (extrasResult.error) throw extrasResult.error;

        // Combine results based on tipo filter
        if (filters?.tipo === 'Recorrente') {
          allData = recorrentesResult.data as Despesa[];
        } else if (filters?.tipo === 'Extra') {
          allData = extrasResult.data as Despesa[];
        } else {
          // tipo === 'all' or undefined
          allData = [...(recorrentesResult.data as Despesa[]), ...(extrasResult.data as Despesa[])];
        }
      } else {
        // No month/year filter - use standard query
        let query = supabase
          .from('despesas_politicas')
          .select('*');

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

        const { data, error } = await query;
        if (error) throw error;
        allData = data as Despesa[];
      }

      // Sort by date descending
      allData.sort((a, b) => 
        new Date(b.ultimo_pagamento).getTime() - new Date(a.ultimo_pagamento).getTime()
      );

      // Apply search filter on client side
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        allData = allData.filter(d => 
          d.municipio.toLowerCase().includes(searchLower) ||
          d.responsavel.toLowerCase().includes(searchLower) ||
          d.cargo.toLowerCase().includes(searchLower) ||
          d.conta_pix.toLowerCase().includes(searchLower)
        );
      }

      return allData;
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
          pagamento_agendado: data.pagamento_agendado 
            ? data.pagamento_agendado.toISOString().split('T')[0]
            : data.ultimo_pagamento.toISOString().split('T')[0],
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
      if (data.pagamento_agendado) {
        updateData.pagamento_agendado = data.pagamento_agendado.toISOString().split('T')[0];
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

export function useMarkAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, month, year }: { id: string; month: number; year: number }) => {
      // Use the last day of the selected month as the payment date
      const lastDay = new Date(year, month + 1, 0);
      const paymentDate = lastDay.toISOString().split('T')[0];
      
      const { data: result, error } = await supabase
        .from('despesas_politicas')
        .update({
          pagamento_feito_em: paymentDate,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi marcado como realizado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao registrar pagamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUnmarkAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from('despesas_politicas')
        .update({ pagamento_feito_em: null })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      toast({
        title: "Pagamento desfeito",
        description: "O status de pagamento foi revertido.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao desfazer pagamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
