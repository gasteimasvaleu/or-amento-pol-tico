import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Landmark, Apple } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { isNativePlatform } from "@/lib/revenuecat";
import { nativeAppleSignIn } from "@/lib/nativeAppleSignIn";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
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

  const handleAppleSignIn = async () => {
    console.log("[Login] Apple Sign In button tapped, isNative:", isNative);
    setAppleLoading(true);
    try {
      if (isNative) {
        console.log("[Login] Calling nativeAppleSignIn()...");
        const result = await nativeAppleSignIn();
        console.log("[Login] nativeAppleSignIn result received, signing in with Supabase...");
        const { data: signInData, error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: result.identityToken,
        });

        if (error) {
          toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
        } else {
          const userId = signInData.user?.id;
          if (userId) {
            const fullName = [result.givenName, result.familyName].filter(Boolean).join(" ") || null;
            await supabase.from("profiles").upsert(
              { id: userId, full_name: fullName || signInData.user?.email?.split("@")[0] || "Usuário" },
              { onConflict: "id", ignoreDuplicates: true }
            );
            if (fullName) {
              await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId);
              await supabase.auth.updateUser({ data: { full_name: fullName } });
            }
          }
          navigate("/");
        }
      } else {
        await supabase.auth.signInWithOAuth({ provider: "apple" });
      }
    } catch (error: any) {
      console.error("[Login] Apple Sign In full error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      if (error?.message?.includes("1001") || error?.message?.includes("cancelled") || error?.message?.includes("canceled")) return;
      if (error?.message?.includes("1000")) {
        toast({ title: "Erro ao entrar", description: "Não foi possível conectar ao Apple Sign In. Tente novamente.", variant: "destructive" });
        return;
      }
      toast({ title: "Erro ao entrar", description: error?.message || "Falha na autenticação", variant: "destructive" });
    } finally {
      setAppleLoading(false);
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
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md pointer-events-auto overflow-y-auto max-h-[90dvh]">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary p-3 rounded-xl w-fit mb-4">
            <Landmark className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Mandato Intelligence</CardTitle>
          <CardDescription>Gestão Parlamentar</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Sign in with Apple - always enabled */}
          <Button
            className="w-full h-12 text-base font-semibold bg-black text-white hover:bg-black/90 touch-manipulation"
            onClick={handleAppleSignIn}
            disabled={appleLoading}
          >
            {appleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Apple className="h-5 w-5 mr-2" />
            )}
            Continuar com Apple
          </Button>

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
