import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useDespesas } from "@/hooks/useDespesas";
import { Receipt, AlertTriangle, CalendarCheck, ArrowRight, Loader2 } from "lucide-react";

const DashboardGeral = () => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const { data: despesas = [], isLoading } = useDespesas({
    month: currentMonth,
    year: currentYear,
  });

  const totalMes = despesas.reduce((sum, d) => sum + Number(d.valor), 0);
  const pendentes = despesas.filter(d => !d.pagamento_feito_em).length;
  const pagas = despesas.filter(d => !!d.pagamento_feito_em).length;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const getMonthName = () =>
    new Date(currentYear, currentMonth, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground capitalize">
            Visão geral — {getMonthName()}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total do Mês</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalMes)}</div>
              <p className="text-xs text-muted-foreground">{despesas.length} despesa(s) registrada(s)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{pendentes}</div>
              <p className="text-xs text-muted-foreground">despesa(s) aguardando pagamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pagas</CardTitle>
              <CalendarCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{pagas}</div>
              <p className="text-xs text-muted-foreground">despesa(s) quitada(s) este mês</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Módulos</CardTitle>
            <CardDescription>Acesse os módulos do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Link to="/despesas">
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Receipt className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Controle de Despesas</h3>
                        <p className="text-sm text-muted-foreground">Gerenciar despesas do mandato</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DashboardGeral;
