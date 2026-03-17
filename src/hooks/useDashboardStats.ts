import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

function getLast6Months() {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    months.push({
      key: format(d, "yyyy-MM"),
      label: format(d, "MMM", { locale: ptBR }),
    });
  }
  return months;
}

export function useDashboardStats() {
  const { user } = useAuth();
  const months = getLast6Months();
  const since = startOfMonth(subMonths(new Date(), 5)).toISOString();

  const despesas = useQuery({
    queryKey: ["dashboard-despesas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("despesas_politicas")
        .select("valor, pagamento_agendado")
        .gte("pagamento_agendado", since.slice(0, 10));
      if (error) throw error;

      const byMonth: Record<string, number> = {};
      (data ?? []).forEach((d) => {
        const key = d.pagamento_agendado?.slice(0, 7);
        if (key) byMonth[key] = (byMonth[key] ?? 0) + Number(d.valor);
      });

      return months.map((m) => ({
        month: m.label,
        valor: byMonth[m.key] ?? 0,
      }));
    },
    enabled: !!user,
  });

  const geracoes = useQuery({
    queryKey: ["dashboard-geracoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("geracoes_log" as any)
        .select("tipo, created_at")
        .gte("created_at", since);
      if (error) throw error;

      const byMonth: Record<string, { discurso: number; projeto_lei: number; midia_criativa: number }> = {};
      ((data as any[]) ?? []).forEach((d: any) => {
        const key = d.created_at?.slice(0, 7);
        if (!key) return;
        if (!byMonth[key]) byMonth[key] = { discurso: 0, projeto_lei: 0, midia_criativa: 0 };
        if (d.tipo in byMonth[key]) (byMonth[key] as any)[d.tipo]++;
      });

      return months.map((m) => ({
        month: m.label,
        discursos: byMonth[m.key]?.discurso ?? 0,
        projetos: byMonth[m.key]?.projeto_lei ?? 0,
        midias: byMonth[m.key]?.midia_criativa ?? 0,
      }));
    },
    enabled: !!user,
  });

  const eleitores = useQuery({
    queryKey: ["dashboard-eleitores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("eleitores" as any)
        .select("created_at")
        .gte("created_at", since);
      if (error) throw error;

      const byMonth: Record<string, number> = {};
      ((data as any[]) ?? []).forEach((d: any) => {
        const key = d.created_at?.slice(0, 7);
        if (key) byMonth[key] = (byMonth[key] ?? 0) + 1;
      });

      // Cumulative
      let total = 0;
      return months.map((m) => {
        total += byMonth[m.key] ?? 0;
        return { month: m.label, total, novos: byMonth[m.key] ?? 0 };
      });
    },
    enabled: !!user,
  });

  return {
    despesasData: despesas.data ?? [],
    geracoesData: geracoes.data ?? [],
    eleitoresData: eleitores.data ?? [],
    isLoading: despesas.isLoading || geracoes.isLoading || eleitores.isLoading,
  };
}
