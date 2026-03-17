import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { Receipt, Sparkles, Users } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

const despesasConfig = {
  valor: { label: "Despesas (R$)", color: "hsl(215 85% 35%)" },
};

const geracoesConfig = {
  discursos: { label: "Discursos", color: "hsl(215 85% 35%)" },
  projetos: { label: "Projetos de Lei", color: "hsl(262 80% 50%)" },
  midias: { label: "Mídias", color: "hsl(25 95% 53%)" },
};

const eleitoresConfig = {
  total: { label: "Total acumulado", color: "hsl(152 60% 40%)" },
};

const DashboardCharts = () => {
  const { despesasData, geracoesData, eleitoresData, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-52 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Despesas */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Evolução de Despesas</CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <ChartContainer config={despesasConfig} className="h-40 w-full">
            <BarChart data={despesasData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="valor" fill="var(--color-valor)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Produtividade */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Produtividade IA</CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <ChartContainer config={geracoesConfig} className="h-40 w-full">
            <BarChart data={geracoesData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="discursos" fill="var(--color-discursos)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="projetos" fill="var(--color-projetos)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="midias" fill="var(--color-midias)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
          <div className="flex justify-center gap-4 mt-2">
            {Object.entries(geracoesConfig).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                {cfg.label}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Crescimento Eleitoral */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold">Crescimento Eleitoral</CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <ChartContainer config={eleitoresConfig} className="h-40 w-full">
            <AreaChart data={eleitoresData} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="total"
                fill="var(--color-total)"
                fillOpacity={0.2}
                stroke="var(--color-total)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
