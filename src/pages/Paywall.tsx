import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Landmark, Loader2, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { useState } from "react";

const benefits = [
  "Gestão completa de despesas parlamentares",
  "Agenda e compromissos ilimitados",
  "Gestão de eleitores e demandas",
  "Banco de mídias e documentos",
  "IA para discursos, postagens e projetos de lei",
  "Monitoramento de notícias",
  "Dados eleitorais do TSE",
  "Gestão de cidades e bairros",
  "Suporte prioritário",
];

const Paywall = () => {
  const { isPremium, loading, checkSubscription } = useSubscription();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [purchasing, setPurchasing] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isPremium) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSubscribe = async () => {
    if (!isNative) return;

    setPurchasing(true);
    try {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages?.[0];

      if (pkg) {
        await Purchases.purchasePackage({ aPackage: pkg });
        await checkSubscription();
      }
    } catch (error: any) {
      if (error?.code !== "1" /* user cancelled */) {
        console.error("Purchase error:", error);
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (!isNative) return;

    setPurchasing(true);
    try {
      const { Purchases } = await import("@revenuecat/purchases-capacitor");
      await Purchases.restorePurchases();
      await checkSubscription();
    } catch (error) {
      console.error("Restore error:", error);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto bg-primary p-3 rounded-xl w-fit">
            <Landmark className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Mandato Intelligence</h1>
          <Badge variant="secondary" className="text-sm gap-1">
            <Crown className="h-3.5 w-3.5" />
            PRO
          </Badge>
        </div>

        {/* Benefits Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-center">
              Tudo que você precisa para gerir seu mandato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{benefit}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="space-y-3">
          {isNative ? (
            <>
              <Button
                className="w-full h-12 text-base font-semibold"
                onClick={handleSubscribe}
                disabled={purchasing}
              >
                {purchasing ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Crown className="h-5 w-5 mr-2" />
                )}
                Assinar Agora
              </Button>
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={handleRestore}
                disabled={purchasing}
              >
                Restaurar compra
              </Button>
            </>
          ) : (
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Smartphone className="h-4 w-4" />
                <p className="text-sm">
                  Assine pelo aplicativo no seu iPhone para desbloquear o acesso.
                </p>
              </div>
              <Button variant="ghost" className="text-sm" onClick={() => checkSubscription()}>
                Já assinei — verificar novamente
              </Button>
            </div>
          )}

          <Button
            variant="link"
            className="w-full text-xs text-muted-foreground"
            onClick={signOut}
          >
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Paywall;
