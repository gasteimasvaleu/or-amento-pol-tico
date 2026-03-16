import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Vote, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { consultarDadosEleitorais, type ResultadoEleitoral } from "@/lib/tseClient";

const ANOS = ["2024", "2022"];

const UFS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

const CARGOS_POR_ANO: Record<string, string[]> = {
  "2022": ["Presidente", "Governador", "Senador", "Deputado Federal", "Deputado Estadual"],
  "2024": ["Prefeito", "Vereador"],
};

export default function DadosEleitorais() {
  const [ano, setAno] = useState("");
  const [uf, setUf] = useState("");
  const [cargo, setCargo] = useState("");
  const [nomeCandidato, setNomeCandidato] = useState("");
  const [resultados, setResultados] = useState<ResultadoEleitoral[]>([]);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [source, setSource] = useState("");
  const { toast } = useToast();

  const cargosDisponiveis = useMemo(() => {
    return ano ? (CARGOS_POR_ANO[ano] || []) : [];
  }, [ano]);

  const handleAnoChange = (novoAno: string) => {
    setAno(novoAno);
    const novosCargos = CARGOS_POR_ANO[novoAno] || [];
    if (!novosCargos.includes(cargo)) setCargo("");
  };

  const canSearch = ano && uf && cargo;

  const handleConsultar = async () => {
    if (!canSearch) return;
    setLoading(true);
    setResultados([]);
    setSource("");
    setProgressMsg("");

    try {
      const result = await consultarDadosEleitorais(
        parseInt(ano),
        uf,
        cargo,
        nomeCandidato || undefined,
        setProgressMsg,
      );

      setResultados(result.data);
      setSource(result.source);

      if (result.data.length === 0) {
        toast({
          title: "Sem resultados",
          description: "Nenhum resultado encontrado para os filtros selecionados.",
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro",
        description: err.message || "Falha ao consultar dados eleitorais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProgressMsg("");
    }
  };

  const formatVotes = (n: number) => n.toLocaleString("pt-BR");

  const getSituacaoBadge = (situacao: string) => {
    if (!situacao) return null;
    const upper = situacao.toUpperCase();
    if (upper.includes("ELEIT") && !upper.includes("NÃO")) {
      return <Badge className="bg-green-600 text-white">{situacao}</Badge>;
    }
    if (upper.includes("2º TURNO") || upper.includes("SEGUNDO")) {
      return <Badge variant="outline" className="border-primary text-primary">{situacao}</Badge>;
    }
    return <Badge variant="secondary">{situacao}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dados Eleitorais</h1>
          <p className="text-muted-foreground">
            Consulte resultados de eleições do TSE
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5 text-primary" />
              Filtros de Consulta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Ano da Eleição *</Label>
                <Select value={ano} onValueChange={handleAnoChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {ANOS.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estado (UF) *</Label>
                <Select value={uf} onValueChange={setUf}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {UFS.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cargo *</Label>
                <Select value={cargo} onValueChange={setCargo} disabled={!ano}>
                  <SelectTrigger>
                    <SelectValue placeholder={ano ? "Selecione o cargo" : "Selecione o ano primeiro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cargosDisponiveis.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nome do Candidato</Label>
                <Input
                  placeholder="Buscar por nome (opcional)"
                  value={nomeCandidato}
                  onChange={(e) => setNomeCandidato(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button
                onClick={handleConsultar}
                disabled={!canSearch || loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {loading ? "Consultando..." : "Consultar"}
              </Button>

              {loading && progressMsg && (
                <span className="text-xs text-muted-foreground animate-pulse">
                  {progressMsg}
                </span>
              )}

              {!loading && source && (
                <span className="text-xs text-muted-foreground">
                  Fonte: {source === "cache" ? "Cache local" : "Portal TSE"}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {resultados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados ({resultados.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidato</TableHead>
                      <TableHead>Partido</TableHead>
                      <TableHead>Nº</TableHead>
                      <TableHead className="text-right">Votos</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead>Turno</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultados.map((r, i) => (
                      <TableRow key={r.id || i}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{r.nome_urna || r.nome_candidato}</p>
                            {r.nome_urna && r.nome_urna !== r.nome_candidato && (
                              <p className="text-xs text-muted-foreground">{r.nome_candidato}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{r.sigla_partido}</TableCell>
                        <TableCell>{r.numero_candidato}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatVotes(r.qtd_votos)}
                        </TableCell>
                        <TableCell>{getSituacaoBadge(r.situacao_eleito)}</TableCell>
                        <TableCell>{r.turno}º</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && resultados.length === 0 && ano && (
          <div className="text-center py-12 text-muted-foreground">
            <Vote className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Selecione os filtros e clique em "Consultar" para ver os resultados.</p>
            <p className="text-xs mt-2">
              A primeira consulta pode demorar até 60 segundos (download do portal TSE). Consultas seguintes são instantâneas (cache).
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
