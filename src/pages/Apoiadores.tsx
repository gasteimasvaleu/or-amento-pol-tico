import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowLeft,
} from "lucide-react";

export default function Apoiadores() {
  const { apoiadores, isLoading, createApoiador, deleteApoiador, isCreating } = useApoiadores();
  const [modalOpen, setModalOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const navigate = useNavigate();

  const handleWhatsApp = (telefone: string) => {
    const clean = telefone.replace(/\D/g, "");
    window.open(`https://wa.me/55${clean}`, "_blank");
  };

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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/equipe")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Apoiadores</h1>
            <p className="text-xs text-muted-foreground">
              {apoiadores.length} apoiador{apoiadores.length !== 1 ? "es" : ""} cadastrado{apoiadores.length !== 1 ? "s" : ""}
              </p>
            </div>
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
                  <div className="flex items-center gap-1 shrink-0">
                    {(a.whatsapp || a.telefone) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsApp((a.whatsapp || a.telefone)!);
                        }}
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-green-500">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </Button>
                    )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive">
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
