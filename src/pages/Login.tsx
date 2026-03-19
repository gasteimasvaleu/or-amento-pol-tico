import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Landmark, Apple, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  isNativePlatform,
  initRevenueCat,
  purchaseMonthly,
  restorePurchases,
  checkSubscriptionStatus,
} from "@/lib/revenuecat";
import { nativeAppleSignIn } from "@/lib/nativeAppleSignIn";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const isNative = isNativePlatform();

  useEffect(() => {
    if (isMobile === undefined) return;
    if (isMobile && !sessionStorage.getItem("splashShown")) {
      setShowSplash(true);
      sessionStorage.setItem("splashShown", "1");
    }
  }, [isMobile]);

  // Initialize RevenueCat and check for existing purchases on mount
  useEffect(() => {
    if (!isNative) return;
    const init = async () => {
      await initRevenueCat();
      const active = await restorePurchases();
      if (active) setHasPurchased(true);
    };
    init();
  }, [isNative]);

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <video
          src="https://wrriittiqsmzbapbrcwm.supabase.co/storage/v1/object/public/criativos/splash1.mp4"
          autoPlay
          muted
          playsInline
          onEnded={() => setShowSplash(false)}
          onError={() => setShowSplash(false)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  const handleAppStorePurchase = async () => {
    setPurchasing(true);
    try {
      const result = await purchaseMonthly();
      if (result.success) {
        setHasPurchased(true);
        toast({
          title: "Assinatura realizada!",
          description: "Agora toque em 'Continuar com Apple' para acessar o app.",
        });
      } else if (result.error !== "cancelled") {
        toast({ title: "Erro na compra", description: result.error, variant: "destructive" });
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleAppleSignIn = async () => {
    console.log("[Login] Apple Sign In button tapped, isNative:", isNative, "hasPurchased:", hasPurchased);
    setAppleLoading(true);
    try {
      if (isNative) {
        console.log("[Login] Calling nativeAppleSignIn()...");
        const result = await nativeAppleSignIn();
        const { data: signInData, error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: result.identityToken,
        });

        if (error) {
          toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
        } else {
          const userId = signInData.user?.id;
          if (userId) {
            // Ensure profile exists (fallback if trigger failed)
            const fullName = [result.givenName, result.familyName].filter(Boolean).join(" ") || null;
            await supabase.from("profiles").upsert(
              { id: userId, full_name: fullName || signInData.user?.email?.split("@")[0] || "Usuário" },
              { onConflict: "id", ignoreDuplicates: true }
            );

            // If Apple provided a name, update profile and auth metadata
            if (fullName) {
              await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId);
              await supabase.auth.updateUser({ data: { full_name: fullName } });
            }
          }
          navigate("/");
        }
      } else {
        // Web fallback
        await supabase.auth.signInWithOAuth({ provider: "apple" });
      }
    } catch (error: any) {
      // Check for Apple Sign In cancellation (code 1001)
      if (error?.message?.includes("1001")) return;
      toast({ title: "Erro ao entrar", description: error?.message || "Falha na autenticação", variant: "destructive" });
    } finally {
      setAppleLoading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const active = await restorePurchases();
      if (active) {
        setHasPurchased(true);
        toast({ title: "Compra restaurada!", description: "Toque em 'Continuar com Apple' para acessar." });
      } else {
        toast({ title: "Nenhuma assinatura encontrada", description: "Nenhuma compra anterior foi encontrada.", variant: "destructive" });
      }
    } finally {
      setRestoring(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary p-3 rounded-xl w-fit mb-4">
            <Landmark className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Mandato Intelligence</CardTitle>
          <CardDescription>Gestão Parlamentar</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Sign in with Apple button */}
          <Button
            className="w-full h-12 text-base font-semibold bg-black text-white hover:bg-black/90 touch-manipulation"
            onClick={handleAppleSignIn}
            disabled={appleLoading || (!hasPurchased && isNative)}
          >
            {appleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Apple className="h-5 w-5 mr-2" />
            )}
            Continuar com Apple
          </Button>

          {!hasPurchased && isNative && (
            <p className="text-xs text-muted-foreground text-center">
              Assine primeiro abaixo para habilitar o login com Apple
            </p>
          )}

          {/* App Store purchase button */}
          {isNative && (
            <Button
              variant="outline"
              className="w-full h-12 text-base"
              onClick={handleAppStorePurchase}
              disabled={purchasing || hasPurchased}
            >
              {purchasing ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <ShoppingBag className="h-5 w-5 mr-2" />
              )}
              {hasPurchased ? "Assinatura ativa ✓" : "Assinar via App Store"}
            </Button>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Entrar
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-3 pt-0">
          {/* Restore purchases */}
          {isNative && (
            <Button variant="ghost" className="w-full text-sm" onClick={handleRestore} disabled={restoring}>
              {restoring && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Restaurar Compras
            </Button>
          )}

          {/* Subscription info (Apple Guideline) */}
          {isNative && (
            <p className="text-[10px] text-muted-foreground text-center leading-tight">
              Assinatura mensal com renovação automática. O pagamento será cobrado na sua conta Apple ID.
              A assinatura renova automaticamente a menos que seja cancelada até 24h antes do fim do período.
            </p>
          )}

          {/* Required links */}
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
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
