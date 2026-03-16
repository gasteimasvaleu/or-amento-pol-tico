import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { MonthlyStats } from "@/components/despesas/MonthlyStats";
import { PaymentAlerts } from "@/components/despesas/PaymentAlerts";
import { SearchFilters } from "@/components/despesas/SearchFilters";
import { DespesasTable } from "@/components/despesas/DespesasTable";
import { useDespesas } from "@/hooks/useDespesas";
import { DespesaFilters } from "@/types/despesa";
import { Loader2 } from "lucide-react";

const Despesas = () => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const [filters, setFilters] = useState<DespesaFilters>({
    search: '',
    municipio: 'all',
    cargo: 'all',
    tipo: 'all',
    month: currentMonth,
    year: currentYear,
  });

  const { data: despesas = [], isLoading } = useDespesas(filters);

  const municipios = Array.from(new Set(despesas.map(d => d.municipio))).sort();
  const cargos = Array.from(new Set(despesas.map(d => d.cargo))).sort();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Controle de Despesas</h1>
          <p className="text-sm text-muted-foreground">
            Gerenciamento de despesas mensais para mandatos políticos
          </p>
        </div>

        <MonthlyStats
          despesas={despesas}
          selectedMonth={filters.month}
          selectedYear={filters.year}
        />

        <PaymentAlerts despesas={despesas} />

        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          despesas={despesas}
          municipios={municipios}
          cargos={cargos}
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DespesasTable
            despesas={despesas}
            selectedMonth={filters.month!}
            selectedYear={filters.year!}
          />
        )}
      </div>
    </Layout>
  );
};

export default Despesas;
