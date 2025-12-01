import { Despesa } from "@/types/despesa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Receipt, AlertCircle } from "lucide-react";

interface MonthlyStatsProps {
  despesas: Despesa[];
}

export function MonthlyStats({ despesas }: MonthlyStatsProps) {
  // Separate paid and pending
  const paidDespesas = despesas.filter(d => d.pagamento_feito_em);
  const pendingDespesas = despesas.filter(d => !d.pagamento_feito_em);
  
  const totalPaid = paidDespesas.reduce((sum, d) => sum + Number(d.valor), 0);
  const totalPending = pendingDespesas.reduce((sum, d) => sum + Number(d.valor), 0);
  const total = totalPaid + totalPending;
  
  const recorrentes = despesas.filter(d => d.tipo === 'Recorrente');
  const extras = despesas.filter(d => d.tipo === 'Extra');
  const totalRecorrentes = recorrentes.reduce((sum, d) => sum + Number(d.valor), 0);
  const totalExtras = extras.reduce((sum, d) => sum + Number(d.valor), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total do Período</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{formatCurrency(total)}</div>
          <p className="text-xs text-muted-foreground">{despesas.length} despesas registradas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas Recorrentes</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRecorrentes)}</div>
          <p className="text-xs text-muted-foreground">{recorrentes.length} despesas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas Extras</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalExtras)}</div>
          <p className="text-xs text-muted-foreground">{extras.length} despesas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagamentos Realizados</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalPaid)}
          </div>
          <p className="text-xs text-muted-foreground">{paidDespesas.length} pagamentos feitos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(totalPending)}
          </div>
          <p className="text-xs text-muted-foreground">{pendingDespesas.length} pagamentos pendentes</p>
        </CardContent>
      </Card>
    </div>
  );
}
