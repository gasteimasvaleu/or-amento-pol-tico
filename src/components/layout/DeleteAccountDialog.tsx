import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteAccountDialogProps {
  variant?: "sidebar" | "menu";
  collapsed?: boolean;
  onClose?: () => void;
}

export function DeleteAccountDialog({ variant = "menu", collapsed = false, onClose }: DeleteAccountDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Erro", description: "Sessão expirada.", variant: "destructive" });
        return;
      }

      const res = await supabase.functions.invoke("delete-account");

      if (res.error || res.data?.error) {
        toast({
          title: "Erro ao excluir conta",
          description: res.data?.error || "Tente novamente mais tarde.",
          variant: "destructive",
        });
        return;
      }

      await signOut();
      navigate("/login");
      toast({ title: "Conta excluída", description: "Sua conta e dados foram removidos permanentemente." });
    } catch (err: any) {
      toast({ title: "Erro", description: err?.message || "Falha ao excluir conta.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {variant === "sidebar" ? (
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            {!collapsed && <span>Excluir Conta</span>}
          </Button>
        ) : (
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-muted transition-colors w-full"
            onClick={onClose}
          >
            <Trash2 className="h-5 w-5" />
            <span>Excluir Conta</span>
          </button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação é irreversível. Todos os seus dados, incluindo eleitores, despesas, compromissos, mídias e demais informações serão permanentemente removidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Sim, excluir minha conta
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
