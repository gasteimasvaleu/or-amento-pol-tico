import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShoppingBag, Landmark, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  purchaseMonthly,
  restorePurchases,
  getSubscriptionPrice,
} from "@/lib/revenuecat";

interface PaywallScreenProps {
  onSubscribed: () => void;
}

export function PaywallScreen({ onSubscribed }: PaywallScreenProps) {
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [priceLabel, setPriceLabel] = useState<string | null>(null);
  const { toast } = useToast();
  const { signOut } = useAuth();

  useEffect(() => {
    getSubscriptionPrice().then((price) => {
      if (price) setPriceLabel(price);
    });
  }, []);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const result = await purchaseMonthly();
      if (result.success) {
        toast({ title: "Assinatura realizada!", description: "Bem-vindo ao Mandato Intelligence Pro." });
        onSubscribed();
      } else if (result.error !== "cancelled") {
        toast({ title: "Erro na compra", description: result.error, variant: "destructive" });
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const active = await restorePurchases();
      if (active) {
        toast({ title: "Compra restaurada!" });
        onSubscribed();
      } else {
        toast({ title: "Nenhuma assinatura encontrada", description: "Nenhuma compra anterior foi encontrada.", variant: "destructive" });
      }
    } finally {
      setRestoring(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      toast({ title: "Erro ao sair", variant: "destructive" });
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md pointer-events-auto overflow-y-auto max-h-[90dvh]">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary p-3 rounded-xl w-fit mb-4">
            <Landmark className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Mandato Intelligence Pro</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Assinatura necessária para acessar o app
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-3">
            <p className="text-2xl font-extrabold text-primary text-center">
              {priceLabel || "R$ 79,90"}
              <span className="text-sm font-medium text-muted-foreground">/mês</span>
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 pl-1">
              <li>✓ Gestão completa de eleitores e apoiadores</li>
              <li>✓ Agenda e compromissos parlamentares</li>
              <li>✓ Controle de despesas de mandato</li>
              <li>✓ Geração de discursos e projetos de lei com IA</li>
              <li>✓ Análise de notícias e geração de mídias</li>
              <li>✓ Suporte prioritário</li>
            </ul>
            <p className="text-xs text-muted-foreground text-center">
              Assinatura Mensal · Renovação automática
            </p>
          </div>

          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handlePurchase}
            disabled={purchasing}
          >
            {purchasing ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <ShoppingBag className="h-5 w-5 mr-2" />
            )}
            {priceLabel ? `Assinar — ${priceLabel}/mês` : "Assinar — R$ 79,90/mês"}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={handleRestore}
            disabled={restoring}
          >
            {restoring && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Restaurar Compras
          </Button>
        </CardContent>

        <CardFooter className="flex-col gap-3 pt-0">
          <p className="text-[10px] text-muted-foreground text-center leading-tight">
            Assinatura mensal com renovação automática. O pagamento será cobrado na sua conta Apple ID.
            A assinatura renova automaticamente a menos que seja cancelada até 24h antes do fim do período.
            Gerencie suas assinaturas nos Ajustes da conta Apple ID.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/politica-de-privacidade"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Política de Privacidade
            </a>
            <a
              href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Termos de Uso
            </a>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2 text-muted-foreground"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            Sair da conta
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
