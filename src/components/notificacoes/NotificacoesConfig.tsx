import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Save, Loader2, Bell } from "lucide-react";

interface NotifConfig {
  whatsapp_phone: string;
  notif_despesas: boolean;
  notif_lembretes: boolean;
  notif_agenda: boolean;
}

const NotificacoesConfig = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<NotifConfig>({
    whatsapp_phone: "",
    notif_despesas: true,
    notif_lembretes: true,
    notif_agenda: true,
  });

  useEffect(() => {
    if (user) fetchConfig();
  }, [user]);

  const fetchConfig = async () => {
    const { data, error } = await supabase
      .from("notificacao_config" as any)
      .select("whatsapp_phone, notif_despesas, notif_lembretes, notif_agenda")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (data) {
      setConfig({
        whatsapp_phone: (data as any).whatsapp_phone || "",
        notif_despesas: (data as any).notif_despesas ?? true,
        notif_lembretes: (data as any).notif_lembretes ?? true,
        notif_agenda: (data as any).notif_agenda ?? true,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    // Upsert config
    const { error } = await supabase
      .from("notificacao_config" as any)
      .upsert(
        {
          user_id: user.id,
          whatsapp_phone: config.whatsapp_phone || null,
          notif_despesas: config.notif_despesas,
          notif_lembretes: config.notif_lembretes,
          notif_agenda: config.notif_agenda,
        } as any,
        { onConflict: "user_id" }
      );

    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Configurações salvas", description: "Suas preferências de notificação foram atualizadas." });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-primary" />
          Notificações WhatsApp
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="whatsapp_phone">Número do WhatsApp</Label>
          <div className="relative">
            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="whatsapp_phone"
              className="pl-9"
              value={config.whatsapp_phone}
              onChange={(e) => setConfig((c) => ({ ...c, whatsapp_phone: e.target.value }))}
              placeholder="+5583999999999"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Formato internacional: +55 + DDD + número (ex: +5583999999999)
          </p>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Tipos de notificação</Label>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">💰 Despesas</p>
              <p className="text-xs text-muted-foreground">1 dia antes do vencimento + alerta de atraso (5 dias)</p>
            </div>
            <Switch
              checked={config.notif_despesas}
              onCheckedChange={(v) => setConfig((c) => ({ ...c, notif_despesas: v }))}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">📋 Lembretes</p>
              <p className="text-xs text-muted-foreground">1 dia antes da data do lembrete</p>
            </div>
            <Switch
              checked={config.notif_lembretes}
              onCheckedChange={(v) => setConfig((c) => ({ ...c, notif_lembretes: v }))}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">📅 Agenda</p>
              <p className="text-xs text-muted-foreground">1 dia antes do compromisso</p>
            </div>
            <Switch
              checked={config.notif_agenda}
              onCheckedChange={(v) => setConfig((c) => ({ ...c, notif_agenda: v }))}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Notificações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificacoesConfig;
