import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { DespesaForm } from "@/components/despesas/DespesaForm";
import { useDespesa, useUpdateDespesa } from "@/hooks/useDespesas";
import { DespesaFormData } from "@/types/despesa";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const EditarDespesa = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: despesa, isLoading } = useDespesa(id!);
  const updateDespesa = useUpdateDespesa();

  const handleSubmit = (data: DespesaFormData) => {
    if (!id) return;
    
    updateDespesa.mutate(
      { id, data },
      {
        onSuccess: () => {
          navigate('/despesas');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!despesa) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Despesa não encontrada</p>
        </div>
      </Layout>
    );
  }

  const defaultValues: Partial<DespesaFormData> = {
    municipio: despesa.municipio,
    responsavel: despesa.responsavel,
    cargo: despesa.cargo,
    tipo: despesa.tipo,
    conta_pix: despesa.conta_pix,
    valor: Number(despesa.valor),
    ultimo_pagamento: new Date(despesa.ultimo_pagamento),
    pagamento_agendado: new Date(despesa.pagamento_agendado),
    observacao: despesa.observacao || '',
    foto_url: despesa.foto_url ?? null,
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Editar Despesa</h2>
          <p className="text-muted-foreground">
            Atualize as informações da despesa
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Despesa</CardTitle>
            <CardDescription>
              Modifique os campos necessários e salve as alterações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DespesaForm 
              onSubmit={handleSubmit}
              defaultValues={defaultValues}
              isLoading={updateDespesa.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditarDespesa;
