import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Landmark, AlertCircle } from "lucide-react";

const CadastroInstitucional = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [orgao, setOrgao] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    if (!token) {
      setValidating(false);
      return;
    }

    supabase
      .from("convites_institucionais")
      .select("orgao, usado")
      .eq("token", token)
      .eq("usado", false)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setTokenValid(false);
        } else {
          setTokenValid(true);
          setOrgao(data.orgao);
        }
        setValidating(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await supabase.functions.invoke("cadastro-institucional", {
        body: { token, fullName, email, password },
      });

      if (res.error || res.data?.error) {
        toast({
          title: "Erro ao cadastrar",
          description: res.data?.error || "Erro inesperado. Tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Sua conta foi criada com sucesso. Faça login para continuar.",
        });
        navigate("/login");
      }
    } catch {
      toast({
        title: "Erro ao cadastrar",
        description: "Erro de conexão. Tente novamente.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!token || !tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-destructive p-3 rounded-xl w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-destructive-foreground" />
            </div>
            <CardTitle className="text-2xl">Convite Inválido</CardTitle>
            <CardDescription>
              {!token
                ? "Nenhum token de convite foi informado na URL."
                : "Este convite já foi utilizado ou não existe."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={() => navigate("/login")}>
              Ir para Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary p-3 rounded-xl w-fit mb-4">
            <Landmark className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Cadastro Institucional</CardTitle>
          <CardDescription>Convite de: <strong>{orgao}</strong></CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgao">Órgão / Instituição</Label>
              <Input id="orgao" value={orgao} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Criar Conta
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CadastroInstitucional;
