import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Copy, Loader2, Crown, Phone } from "lucide-react";

const ADMIN_EMAIL = "caiorobbb@gmail.com";
const APP_URL = window.location.origin;

interface ConviteGerado {
  token: string;
  telefone: string;
}

interface ConviteExistente {
  id: string;
  token: string;
  orgao: string;
  usado: boolean;
  usado_em: string | null;
  created_at: string;
  duracao_dias: number;
}

export default function Admin() {
  const { user } = useAuth();
  const [orgao, setOrgao] = useState("");
  const [duracaoDias, setDuracaoDias] = useState(365);
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(false);
  const [convitesGerados, setConvitesGerados] = useState<ConviteGerado[]>([]);
  const [convitesExistentes, setConvitesExistentes] = useState<ConviteExistente[]>([]);
  const [loadingExistentes, setLoadingExistentes] = useState(true);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (isAdmin) fetchConvites();
  }, [isAdmin]);

  const fetchConvites = async () => {
    setLoadingExistentes(true);
    const { data, error } = await supabase
      .from("convites_institucionais")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setConvitesExistentes(data as ConviteExistente[]);
    }
    setLoadingExistentes(false);
  };

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleGerar = async () => {
    if (!orgao.trim()) {
      toast.error("Informe o nome do órgão");
      return;
    }
    if (quantidade < 1 || quantidade > 500) {
      toast.error("Quantidade deve ser entre 1 e 500");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("gerar-convites", {
        body: { orgao: orgao.trim(), duracaoDias, quantidade, userEmail: user?.email },
      });

      if (error) throw error;

      const tokens: string[] = data.tokens || [];
      setConvitesGerados(tokens.map((t) => ({ token: t, telefone: "" })));
      toast.success(`${tokens.length} convite(s) gerado(s) com sucesso!`);
      fetchConvites();
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar convites");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (token: string) => {
    const link = `${APP_URL}/cadastro-institucional?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const updateTelefone = (index: number, value: string) => {
    setConvitesGerados((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], telefone: value };
      return next;
    });
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Crown className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gerar Convites Institucionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="orgao">Nome do Órgão</Label>
                <Input id="orgao" placeholder="Câmara Municipal de..." value={orgao} onChange={(e) => setOrgao(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (dias)</Label>
                <Input id="duracao" type="number" min={1} value={duracaoDias} onChange={(e) => setDuracaoDias(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qtd">Quantidade</Label>
                <Input id="qtd" type="number" min={1} max={500} value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />
              </div>
            </div>
            <Button onClick={handleGerar} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gerar Convites
            </Button>
          </CardContent>
        </Card>

        {convitesGerados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Convites Gerados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead className="w-48">
                        <div className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Telefone</div>
                      </TableHead>
                      <TableHead className="w-20">Copiar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {convitesGerados.map((c, i) => (
                      <TableRow key={c.token}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-mono text-xs break-all">{`${APP_URL}/cadastro-institucional?token=${c.token}`}</TableCell>
                        <TableCell>
                          <Input placeholder="5583999999999" value={c.telefone} onChange={(e) => updateTelefone(i, e.target.value)} className="h-8 text-sm" />
                        </TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" onClick={() => copyLink(c.token)}><Copy className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Todos os Convites</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingExistentes ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : convitesExistentes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum convite gerado ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Órgão</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {convitesExistentes.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.orgao}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs">{c.token.slice(0, 12)}…</span>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyLink(c.token)}><Copy className="h-3 w-3" /></Button>
                          </div>
                        </TableCell>
                        <TableCell>{c.duracao_dias} dias</TableCell>
                        <TableCell>
                          <Badge variant={c.usado ? "secondary" : "default"}>{c.usado ? "Usado" : "Disponível"}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
