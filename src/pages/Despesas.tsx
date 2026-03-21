import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { MonthlyStats } from "@/components/despesas/MonthlyStats";
import { PaymentAlerts } from "@/components/despesas/PaymentAlerts";
import { SearchFilters } from "@/components/despesas/SearchFilters";
import { DespesasTable } from "@/components/despesas/DespesasTable";
import { useDespesas } from "@/hooks/useDespesas";
import { DespesaFilters } from "@/types/despesa";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, FileDown } from "lucide-react";
import { exportDespesasToPDF } from "@/lib/exportPDF";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/ui/PullToRefreshIndicator";

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
  const { containerRef, refreshing, pullDistance } = usePullToRefresh({ queryKeys: [['despesas']] });

  const municipios = Array.from(new Set(despesas.map(d => d.municipio))).sort();
  const cargos = Array.from(new Set(despesas.map(d => d.cargo))).sort();

  return (
    <Layout>
      <div ref={containerRef} className="space-y-6 overflow-auto">
        <PullToRefreshIndicator refreshing={refreshing} pullDistance={pullDistance} />
        <div>
          <h1 className="text-xl font-bold text-foreground">Controle de Despesas</h1>
          <p className="text-sm text-muted-foreground">
            Gerenciamento de despesas mensais para mandatos políticos
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild className="flex-1">
            <Link to="/despesas/nova" className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Despesa
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => exportDespesasToPDF(despesas, filters.month!, filters.year!)}
            disabled={despesas.length === 0}
          >
            <FileDown className="h-4 w-4" />
            PDF
          </Button>
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
          <div className="flex items-center justify-center py-20">
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
