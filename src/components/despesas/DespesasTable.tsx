import { Despesa } from "@/types/despesa";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { format, isSameMonth, isSameYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useDeleteDespesa, useMarkAsPaid, useUnmarkAsPaid } from "@/hooks/useDespesas";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getScheduledPaymentDate } from "@/lib/utils";

interface DespesasTableProps {
  despesas: Despesa[];
  selectedMonth: number;
  selectedYear: number;
}

export function DespesasTable({ despesas, selectedMonth, selectedYear }: DespesasTableProps) {
  const navigate = useNavigate();
  const deleteDespesa = useDeleteDespesa();
  const markAsPaid = useMarkAsPaid();
  const unmarkAsPaid = useUnmarkAsPaid();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleDelete = (id: string) => {
    deleteDespesa.mutate(id);
  };

  const handleMarkAsPaid = (id: string) => {
    markAsPaid.mutate({ id, month: selectedMonth, year: selectedYear });
  };

  const handleUnmarkAsPaid = (id: string) => {
    unmarkAsPaid.mutate(id);
  };

  const getPaymentStatus = (despesa: Despesa, dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 1. Check if paid in the selected month/year
    if (despesa.pagamento_feito_em) {
      const [year, month, day] = despesa.pagamento_feito_em.split('-').map(Number);
      const paidDate = new Date(year, month - 1, day);
      const selectedDate = new Date(selectedYear, selectedMonth, 1);
      
      if (isSameMonth(paidDate, selectedDate) && isSameYear(paidDate, selectedDate)) {
        return { status: 'Pago', variant: 'default' as const, icon: '✅' };
      }
    }
    
    // 2. Compare due date with today
    const dueDateNormalized = new Date(dueDate);
    dueDateNormalized.setHours(0, 0, 0, 0);
    
    if (dueDateNormalized > today) {
      // Due date hasn't arrived yet
      return { status: 'Aguardando', variant: 'outline' as const, icon: '📅' };
    }
    
    // 3. Due date has passed and not paid
    return { status: 'Pendente', variant: 'destructive' as const, icon: '🔴' };
  };

  if (despesas.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <p className="text-muted-foreground">Nenhuma despesa encontrada para o período selecionado.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Município</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Próximo Pagamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {despesas.map((despesa) => {
            const displayDate = getScheduledPaymentDate(despesa, selectedMonth, selectedYear);
            const paymentStatus = getPaymentStatus(despesa, displayDate);
            
            return (
              <TableRow key={despesa.id}>
                <TableCell className="font-medium">{despesa.municipio}</TableCell>
                <TableCell>{despesa.responsavel}</TableCell>
                <TableCell>{despesa.cargo}</TableCell>
                <TableCell>
                  <Badge variant={despesa.tipo === 'Recorrente' ? 'default' : 'secondary'}>
                    {despesa.tipo}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(displayDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <Badge variant={paymentStatus.variant}>
                    {paymentStatus.icon} {paymentStatus.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(Number(despesa.valor))}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {paymentStatus.status !== 'Pago' ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkAsPaid(despesa.id)}
                        title="Marcar como pago"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </Button>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Desfazer pagamento"
                          >
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Desfazer pagamento</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja desfazer o pagamento desta despesa?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleUnmarkAsPaid(despesa.id)}>
                              Desfazer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/editar/${despesa.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(despesa.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
