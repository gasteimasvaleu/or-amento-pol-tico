import { useState } from "react";
import { Despesa } from "@/types/despesa";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle2, XCircle, Eye } from "lucide-react";
import { format, isSameMonth, isSameYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useDeleteDespesa, useMarkAsPaid, useUnmarkAsPaid } from "@/hooks/useDespesas";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { getScheduledPaymentDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

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
  const [selectedDespesa, setSelectedDespesa] = useState<Despesa | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleDelete = (id: string) => {
    deleteDespesa.mutate(id);
    setSheetOpen(false);
  };

  const handleMarkAsPaid = (id: string) => {
    markAsPaid.mutate({ id, month: selectedMonth, year: selectedYear });
    setSheetOpen(false);
  };

  const handleUnmarkAsPaid = (id: string) => {
    unmarkAsPaid.mutate(id);
    setSheetOpen(false);
  };

  const getPaymentStatus = (despesa: Despesa, dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (despesa.pagamento_feito_em) {
      const [year, month, day] = despesa.pagamento_feito_em.split('-').map(Number);
      const paidDate = new Date(year, month - 1, day);
      const selectedDate = new Date(selectedYear, selectedMonth, 1);
      
      if (isSameMonth(paidDate, selectedDate) && isSameYear(paidDate, selectedDate)) {
        return { status: 'Pago', variant: 'default' as const, icon: '✅' };
      }
    }
    
    const dueDateNormalized = new Date(dueDate);
    dueDateNormalized.setHours(0, 0, 0, 0);
    
    if (dueDateNormalized > today) {
      return { status: 'Aguardando', variant: 'outline' as const, icon: '📅' };
    }
    
    return { status: 'Pendente', variant: 'destructive' as const, icon: '🔴' };
  };

  const openDetails = (despesa: Despesa) => {
    setSelectedDespesa(despesa);
    setSheetOpen(true);
  };

  if (despesas.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <p className="text-muted-foreground">Nenhuma despesa encontrada para o período selecionado.</p>
      </div>
    );
  }

  const selectedDisplayDate = selectedDespesa ? getScheduledPaymentDate(selectedDespesa, selectedMonth, selectedYear) : new Date();
  const selectedPaymentStatus = selectedDespesa ? getPaymentStatus(selectedDespesa, selectedDisplayDate) : null;

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Município</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Próximo Pagamento</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell text-right">Valor</TableHead>
              <TableHead className="hidden md:table-cell text-right">Ações</TableHead>
              <TableHead className="md:hidden w-10"></TableHead>
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
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={despesa.tipo === 'Recorrente' ? 'default' : 'secondary'}>
                      {despesa.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(displayDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={paymentStatus.variant}>
                      {paymentStatus.icon} {paymentStatus.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right font-semibold">
                    {formatCurrency(Number(despesa.valor))}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right">
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
                            <Button variant="ghost" size="icon" title="Desfazer pagamento">
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
                  {/* Mobile: botão ver detalhes */}
                  <TableCell className="md:hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDetails(despesa)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Sheet de detalhes mobile */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          {selectedDespesa && selectedPaymentStatus && (
            <div className="space-y-4">
              <SheetHeader className="text-left">
                <SheetTitle>{selectedDespesa.municipio}</SheetTitle>
                <SheetDescription>{selectedDespesa.responsavel} · {selectedDespesa.cargo}</SheetDescription>
              </SheetHeader>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <Badge variant={selectedDespesa.tipo === 'Recorrente' ? 'default' : 'secondary'} className="mt-1">
                    {selectedDespesa.tipo}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={selectedPaymentStatus.variant} className="mt-1">
                    {selectedPaymentStatus.icon} {selectedPaymentStatus.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">
                    {formatCurrency(Number(selectedDespesa.valor))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Próximo Pagamento</p>
                  <p className="text-sm text-foreground mt-0.5">
                    {format(selectedDisplayDate, "dd/MM/yyyy")}
                  </p>
                </div>
              </div>

              {selectedDespesa.observacao && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground">Observação</p>
                    <p className="text-sm text-foreground mt-1">{selectedDespesa.observacao}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex gap-2">
                {selectedPaymentStatus.status !== 'Pago' ? (
                  <Button
                    className="flex-1"
                    onClick={() => handleMarkAsPaid(selectedDespesa.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar como pago
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleUnmarkAsPaid(selectedDespesa.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Desfazer pagamento
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setSheetOpen(false);
                    navigate(`/editar/${selectedDespesa.id}`);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(selectedDespesa.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
