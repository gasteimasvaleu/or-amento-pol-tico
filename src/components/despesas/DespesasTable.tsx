import { Despesa } from "@/types/despesa";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useDeleteDespesa } from "@/hooks/useDespesas";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface DespesasTableProps {
  despesas: Despesa[];
}

export function DespesasTable({ despesas }: DespesasTableProps) {
  const navigate = useNavigate();
  const deleteDespesa = useDeleteDespesa();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleDelete = (id: string) => {
    deleteDespesa.mutate(id);
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
            <TableHead>Último Pagamento</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {despesas.map((despesa) => (
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
                {format(new Date(despesa.ultimo_pagamento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(Number(despesa.valor))}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
