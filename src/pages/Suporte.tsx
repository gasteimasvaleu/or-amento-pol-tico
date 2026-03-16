import { Layout } from "@/components/layout/Layout";
import { LifeBuoy } from "lucide-react";

const Suporte = () => {
  return (
    <Layout>
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Suporte</h1>
        <p className="text-sm text-muted-foreground">Central de ajuda e recursos</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="bg-muted rounded-full p-6">
          <LifeBuoy className="h-10 w-10 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm max-w-xs">
          Em breve novas funcionalidades estarão disponíveis aqui.
        </p>
      </div>
    </Layout>
  );
};

export default Suporte;
