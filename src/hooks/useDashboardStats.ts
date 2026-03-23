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
        .select("valor, tipo, ultimo_pagamento, pagamento_agendado");
      if (error) throw error;

      const allDespesas = data ?? [];

      return months.map((m) => {
        const [year, month] = m.key.split("-").map(Number);
        const firstDay = `${m.key}-01`;
        const lastDay = new Date(year, month, 0).toISOString().split("T")[0];

        let total = 0;
        allDespesas.forEach((d) => {
          const valor = Number(d.valor);
          if (d.tipo === "Recorrente") {
            // Recorrente aparece todo mês a partir do cadastro
            if (d.ultimo_pagamento && d.ultimo_pagamento <= lastDay) {
              total += valor;
            }
          } else {
            // Extra: apenas se pagamento_agendado cai no mês
            const pa = d.pagamento_agendado;
            if (pa && pa >= firstDay && pa <= lastDay) {
              total += valor;
            }
          }
        });

        return { month: m.label, valor: total };
      });
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
