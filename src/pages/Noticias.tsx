import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useNoticias, SiteNoticia, NoticiaResumo } from "@/hooks/useNoticias";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, RefreshCw, Trash2, ExternalLink, Newspaper, Globe } from "lucide-react";

export default function Noticias() {
  const {
    sites,
    resumos,
    isLoadingSites,
    isLoadingResumos,
    addSite,
    toggleSite,
    deleteSite,
    deleteNoticia,
    atualizarNoticias,
  } = useNoticias();

  const [nome, setNome] = useState("");
  const [url, setUrl] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [noticiaToDelete, setNoticiaToDelete] = useState<string | null>(null);

  const handleAddSite = () => {
    if (!nome.trim() || !url.trim()) return;
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http")) formattedUrl = `https://${formattedUrl}`;
    addSite.mutate(
      { nome: nome.trim(), url: formattedUrl },
      {
        onSuccess: () => {
          setNome("");
          setUrl("");
          setDialogOpen(false);
        },
      }
    );
  };

  const resumosBySite = (siteId: string) =>
    resumos.filter((r) => r.site_id === siteId);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground">Notícias</h1>
            <p className="text-sm text-muted-foreground">
              Monitore sites de notícias com resumos automáticos
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => atualizarNoticias.mutate()}
              disabled={atualizarNoticias.isPending || sites.length === 0}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${atualizarNoticias.isPending ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Site
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Site de Notícias</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do site</Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: G1, Folha, UOL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://g1.globo.com"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={handleAddSite} disabled={addSite.isPending}>
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Sites list */}
        {isLoadingSites ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : sites.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Globe className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum site cadastrado</p>
              <p className="text-sm text-muted-foreground">
                Adicione sites para monitorar notícias automaticamente
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {sites.map((site) => (
              <Card key={site.id} className="relative">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{site.nome}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Switch
                      checked={site.ativo}
                      onCheckedChange={(ativo) => toggleSite.mutate({ id: site.id, ativo })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteSite.mutate(site.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* News summaries grouped by site */}
        {isLoadingResumos ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : resumos.length === 0 ? (
          sites.length > 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma notícia extraída ainda</p>
                <p className="text-sm text-muted-foreground">
                  Clique em "Atualizar" para buscar notícias dos sites cadastrados
                </p>
              </CardContent>
            </Card>
          )
        ) : (
          <div className="space-y-6">
            {sites
              .filter((s) => resumosBySite(s.id).length > 0)
              .map((site) => (
                <div key={site.id} className="space-y-3">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    {site.nome}
                  </h2>
                  <div className="space-y-3">
                    {resumosBySite(site.id).map((noticia) => (
                      <Card key={noticia.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-sm leading-tight">
                              {noticia.titulo}
                            </CardTitle>
                            <div className="flex items-center gap-1 shrink-0">
                              <a
                                href={noticia.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                              </a>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => setNoticiaToDelete(noticia.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <CardDescription className="text-xs">
                            {new Date(noticia.data_extracao).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{noticia.resumo}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        <AlertDialog open={!!noticiaToDelete} onOpenChange={(open) => !open && setNoticiaToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover notícia?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (noticiaToDelete) {
                    deleteNoticia.mutate(noticiaToDelete);
                    setNoticiaToDelete(null);
                  }
                }}
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
