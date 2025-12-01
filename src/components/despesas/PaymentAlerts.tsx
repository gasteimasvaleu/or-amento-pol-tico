import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Despesa } from "@/types/despesa";
import { Bell } from "lucide-react";
import { differenceInDays, isSameMonth, isSameYear } from "date-fns";
import { getScheduledPaymentDate } from "@/lib/utils";

interface PaymentAlertsProps {
  despesas: Despesa[];
}

interface AlertDespesa extends Despesa {
  nextDueDate: Date;
  daysUntilDue: number;
  urgencyLevel: 'urgent' | 'warning' | 'info';
}

export const PaymentAlerts = ({ despesas }: PaymentAlertsProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Calculate alerts only for recurring expenses that haven't been paid yet
  const alertDespesas: AlertDespesa[] = despesas
    .filter(d => {
      // Only show recorrentes that haven't been paid in the current month
      if (d.tipo !== 'Recorrente') return false;
      
      // If pagamento_feito_em exists and is in the current month, don't show alert
      if (d.pagamento_feito_em) {
        const paidDate = new Date(d.pagamento_feito_em);
        if (isSameMonth(paidDate, today) && isSameYear(paidDate, today)) {
          return false;
        }
      }
      
      return true;
    })
    .map(despesa => {
      // Calculate dynamic due date for current month
      const nextDueDate = getScheduledPaymentDate(despesa, currentMonth, currentYear);
      nextDueDate.setHours(0, 0, 0, 0);
      
      // Calculate days until due
      const daysUntilDue = differenceInDays(nextDueDate, today);
      
      // Determine urgency level
      let urgencyLevel: 'urgent' | 'warning' | 'info';
      if (daysUntilDue <= 2) urgencyLevel = 'urgent';
      else if (daysUntilDue <= 5) urgencyLevel = 'warning';
      else urgencyLevel = 'info';
      
      return {
        ...despesa,
        nextDueDate,
        daysUntilDue,
        urgencyLevel
      };
    })
    .filter(d => d.daysUntilDue >= 0 && d.daysUntilDue <= 7)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  if (alertDespesas.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Pagamentos Próximos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ✅ Nenhum pagamento próximo nos próximos 7 dias
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = alertDespesas.reduce((sum, d) => sum + d.valor, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDueDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  };

  const getDaysText = (days: number) => {
    if (days === 0) return 'Vence hoje';
    if (days === 1) return 'Vence amanhã';
    return `Vence em ${days} dias`;
  };

  const getUrgencyBadge = (urgency: 'urgent' | 'warning' | 'info') => {
    switch (urgency) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">🔴 Urgente</Badge>;
      case 'warning':
        return <Badge className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500">🟡 Atenção</Badge>;
      case 'info':
        return <Badge className="text-xs bg-blue-500 hover:bg-blue-600 text-white border-blue-500">🔵 Próximo</Badge>;
    }
  };

  const getUrgencyBorder = (urgency: 'urgent' | 'warning' | 'info') => {
    switch (urgency) {
      case 'urgent':
        return 'border-l-4 border-l-destructive';
      case 'warning':
        return 'border-l-4 border-l-yellow-500';
      case 'info':
        return 'border-l-4 border-l-blue-500';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Pagamentos Próximos
          </CardTitle>
          <div className="text-sm font-semibold">
            Total: {formatCurrency(totalAmount)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alertDespesas.map((despesa) => (
          <div
            key={despesa.id}
            className={`p-3 rounded-lg bg-muted/50 ${getUrgencyBorder(despesa.urgencyLevel)}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{despesa.responsavel}</span>
                  {getUrgencyBadge(despesa.urgencyLevel)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {despesa.cargo} • {despesa.municipio}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getDaysText(despesa.daysUntilDue)} ({formatDueDate(despesa.nextDueDate)})
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">
                  {formatCurrency(despesa.valor)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

