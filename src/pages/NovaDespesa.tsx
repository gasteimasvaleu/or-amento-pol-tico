import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { DespesaForm } from "@/components/despesas/DespesaForm";
import { useCreateDespesa } from "@/hooks/useDespesas";
import { DespesaFormData } from "@/types/despesa";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NovaDespesa = () => {
  const navigate = useNavigate();
  const createDespesa = useCreateDespesa();

  const handleSubmit = (data: DespesaFormData) => {
    createDespesa.mutate(data, {
      onSuccess: () => {
        navigate('/despesas');
      },
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Nova Despesa</h2>
          <p className="text-muted-foreground">
            Registre uma nova despesa do mandato político
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Despesa</CardTitle>
            <CardDescription>
              Preencha todos os campos obrigatórios (*) para registrar a despesa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DespesaForm 
              onSubmit={handleSubmit} 
              isLoading={createDespesa.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NovaDespesa;
