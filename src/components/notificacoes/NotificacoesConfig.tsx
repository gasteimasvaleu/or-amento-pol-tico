import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Save, Loader2, Bell, Mic, Phone } from "lucide-react";

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
  const [showInstructions, setShowInstructions] = useState(false);
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
    const { data } = await supabase
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
      toast({ title: "Configurações salvas", description: "Suas preferências foram atualizadas." });
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            Notificações e Comandos WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Número do assistente */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Número do Assistente</span>
            </div>
            <p className="text-lg font-bold text-primary">+1 (555) 934-6984</p>
            <p className="text-xs text-muted-foreground">
              Salve este número nos seus contatos e envie uma mensagem para começar a usar o assistente por voz ou texto.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp_phone">Seu Número do WhatsApp</Label>
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

          <div className="flex flex-col gap-2">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar Configurações
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setShowInstructions(true)}>
              <Mic className="h-4 w-4" />
              Instruções de Comando por Voz
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de instruções */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Comandos por Voz e Texto
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="px-6 pb-6 max-h-[65vh]">
            <div className="space-y-5 pr-3">
              {/* Consultas */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">📊 Consultas</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="rounded-md bg-muted/50 px-3 py-2 italic">"Quais são minhas despesas do mês?"</li>
                  <li className="rounded-md bg-muted/50 px-3 py-2 italic">"Quanto tenho de despesas pendentes?"</li>
                  <li className="rounded-md bg-muted/50 px-3 py-2 italic">"Quantos eleitores eu tenho cadastrados?"</li>
                  <li className="rounded-md bg-muted/50 px-3 py-2 italic">"Quais meus compromissos da semana?"</li>
                  <li className="rounded-md bg-muted/50 px-3 py-2 italic">"Quais são meus lembretes pendentes?"</li>
                  <li className="rounded-md bg-muted/50 px-3 py-2 italic">"Me dê um resumo geral do meu dashboard"</li>
                </ul>
              </div>

              {/* Cadastros */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">📝 Cadastros</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="rounded-md bg-muted/50 px-3 py-2 italic">"Cadastre o eleitor João Silva da cidade de Campina Grande, bairro Centro, telefone 83999999999, classificação positivo"</li>
                  <li className="rounded-md bg-muted/50 px-3 py-2 italic">"Crie um lembrete para ligar para o vereador amanhã, prioridade alta"</li>
                  <li className="rounded-md bg-muted/50 px-3 py-2 italic">"Agende um compromisso de reunião para amanhã às 14h no gabinete"</li>
                  <li className="rounded-md bg-muted/50 px-3 py-2 italic">"Cadastre o apoiador Maria Santos de João Pessoa, partido PSD, telefone 83988888888"</li>
                  <li className="rounded-md bg-muted/50 px-3 py-2 italic">"Cadastre uma despesa de R$ 1.500 para João Silva, município Campina Grande, cargo assessor"</li>
                </ul>
              </div>

              {/* Dicas */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">💡 Dicas</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
                  <li>Pode enviar <strong>áudio</strong> ou <strong>texto</strong></li>
                  <li>Se faltar algum dado obrigatório, o assistente vai pedir</li>
                  <li>Pergunte de forma natural, como se estivesse conversando</li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificacoesConfig;
