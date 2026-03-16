import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useApoiadores } from "@/hooks/useApoiadores";
import { ApoiadorModal } from "@/components/apoiadores/ApoiadorModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Users,
  Phone,
  MapPin,
  Trash2,
  Instagram,
  Crown,
} from "lucide-react";

export default function Apoiadores() {
  const { apoiadores, isLoading, createApoiador, deleteApoiador, isCreating } = useApoiadores();
  const [modalOpen, setModalOpen] = useState(false);
  const [busca, setBusca] = useState("");

  const filtered = apoiadores.filter((a) => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    return (
      a.nome.toLowerCase().includes(q) ||
      a.cidade.toLowerCase().includes(q) ||
      a.bairro.toLowerCase().includes(q) ||
      a.partido.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Apoiadores</h1>
            <p className="text-xs text-muted-foreground">
              {apoiadores.length} apoiador{apoiadores.length !== 1 ? "es" : ""} cadastrado{apoiadores.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, cidade, bairro ou partido..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              {busca ? "Nenhum apoiador encontrado" : "Nenhum apoiador cadastrado"}
            </p>
            {!busca && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar apoiador
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => (
              <Card key={a.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-primary/10 rounded-full p-2.5 shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground text-sm truncate">{a.nome}</p>
                        {a.lideranca_comunitaria && (
                          <Badge variant="secondary" className="text-[10px] gap-0.5 px-1.5 py-0">
                            <Crown className="h-2.5 w-2.5" /> Líder
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {a.partido && (
                          <Badge variant="outline" className="text-[10px]">{a.partido}</Badge>
                        )}
                        {a.cargo_pretendido && (
                          <Badge variant="outline" className="text-[10px]">{a.cargo_pretendido}</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        {(a.cidade || a.bairro) && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {[a.bairro, a.cidade].filter(Boolean).join(", ")}
                          </span>
                        )}
                        {a.telefone && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {a.telefone}
                          </span>
                        )}
                        {a.instagram && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Instagram className="h-3 w-3" />
                            {a.instagram}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover apoiador?</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{a.nome}" será removido permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteApoiador(a.id)}>
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ApoiadorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={createApoiador}
        isSubmitting={isCreating}
      />
    </Layout>
  );
}
