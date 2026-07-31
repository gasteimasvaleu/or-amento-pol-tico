import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import { pickImage, dataUrlToBlob } from "@/lib/capacitorCamera";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FotoResponsavelFieldProps {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export function FotoResponsavelField({ value, onChange }: FotoResponsavelFieldProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handlePick = async () => {
    try {
      const dataUrl = await pickImage({ source: "prompt", quality: 80 });
      if (!dataUrl) return;

      setUploading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      const blob = dataUrlToBlob(dataUrl);
      const ext = blob.type.split("/")[1] || "jpg";
      const filePath = `${userData.user.id}/despesas/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, { contentType: blob.type, upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      onChange(urlData.publicUrl);
      toast({ title: "Foto adicionada com sucesso!" });
    } catch (err: any) {
      toast({
        title: "Erro ao enviar foto",
        description: err?.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20 border border-border">
        {value ? <AvatarImage src={value} alt="Foto do responsável" /> : null}
        <AvatarFallback className="bg-muted">
          <User className="h-8 w-8 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      <div className="space-y-1">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handlePick} disabled={uploading}>
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Camera className="h-4 w-4 mr-2" />
            )}
            {value ? "Trocar foto" : "Adicionar foto"}
          </Button>
          {value && !uploading && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <Trash2 className="h-4 w-4 mr-2 text-destructive" />
              Remover
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Foto da pessoa vinculada a esta despesa (opcional)
        </p>
      </div>
    </div>
  );
}
