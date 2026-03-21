import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDespesas } from "@/hooks/useDespesas";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { exportToCSV } from "@/lib/exportCSV";
import { Despesa } from "@/types/despesa";

const Historico = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Single query for the entire year (no month filter)
  const { data: allDespesas = [] } = useDespesas({ year: selectedYear });

  // Group by month client-side
  const monthsData = useMemo(() => {
    const grouped: Record<number, Despesa[]> = {};
    for (let i = 0; i < 12; i++) grouped[i] = [];

    allDespesas.forEach((d) => {
      const date = new Date(d.ultimo_pagamento);
      if (date.getFullYear() === selectedYear) {
        grouped[date.getMonth()].push(d);
      }
      // Recorrentes: also count for months after registration
      if (d.tipo === "Recorrente") {
        const startMonth = date.getFullYear() === selectedYear ? date.getMonth() : 0;
        for (let m = startMonth; m < 12; m++) {
          if (!grouped[m].find((existing) => existing.id === d.id)) {
            grouped[m].push(d);
          }
        }
      }
    });

    return Array.from({ length: 12 }, (_, month) => ({
      month,
      total: grouped[month].reduce((sum, d) => sum + Number(d.valor), 0),
      count: grouped[month].length,
      despesas: grouped[month],
    }));
  }, [allDespesas, selectedYear]);

  const totalYear = monthsData.reduce((sum, m) => sum + m.total, 0);
  const avgMonth = totalYear / 12;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month, 1).toLocaleDateString('pt-BR', { month: 'long' });
  };

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return null;
    const diff = ((current - previous) / previous) * 100;
    if (Math.abs(diff) < 1) return { icon: Minus, text: 'estável', color: 'text-muted-foreground' };
    if (diff > 0) return { icon: TrendingUp, text: `+${diff.toFixed(1)}%`, color: 'text-destructive' };
    return { icon: TrendingDown, text: `${diff.toFixed(1)}%`, color: 'text-green-600' };
  };

  const exportYearData = () => {
    const allDespesasFlat = monthsData.flatMap(m => m.despesas);
    // Deduplicate by id
    const unique = [...new Map(allDespesasFlat.map(d => [d.id, d])).values()];
    exportToCSV(unique, `historico-${selectedYear}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Histórico Mensal</h2>
            <p className="text-muted-foreground">
              Acompanhe a evolução das despesas ao longo do tempo
            </p>
          </div>

          <div className="flex gap-4">
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={exportYearData} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar Ano
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total do Ano</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalYear)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Média Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(avgMonth)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {monthsData.reduce((sum, m) => sum + m.count, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comparativo Mensal - {selectedYear}</CardTitle>
            <CardDescription>
              Visualize e compare as despesas mês a mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthsData.map((data, index) => {
                const trend = index > 0 ? getTrend(data.total, monthsData[index - 1].total) : null;
                const TrendIcon = trend?.icon;

                return (
                  <div key={data.month} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium capitalize min-w-[100px]">
                          {getMonthName(data.month)}
                        </span>
                        {trend && TrendIcon && (
                          <div className={`flex items-center gap-1 text-sm ${trend.color}`}>
                            <TrendIcon className="h-3 w-3" />
                            <span>{trend.text}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {data.count} despesa{data.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(data.total)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Historico;
