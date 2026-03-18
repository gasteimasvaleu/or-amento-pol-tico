

## Plano: Configurar número WhatsApp de produção e webhook no Twilio

### 1. Adicionar secret `TWILIO_WHATSAPP_FROM`

Adicionar o secret `TWILIO_WHATSAPP_FROM` com o valor `whatsapp:+15559346984` nas Edge Functions do Supabase. Atualmente o código faz fallback para o número do Sandbox — com esse secret configurado, usará o número de produção.

### 2. Configurar Webhook no Twilio

Na página de configuração do WhatsApp Sender no Twilio (os screenshots que você enviou), preencher:

- **Webhook URL for incoming messages**: `https://wrriittiqsmzbapbrcwm.supabase.co/functions/v1/whatsapp-webhook`
- **Webhook method**: HTTP Post

Isso permitirá receber respostas dos usuários no futuro (confirmações, interações).

### 3. Criar Edge Function `whatsapp-webhook`

Uma Edge Function simples para receber callbacks do Twilio (mensagens recebidas e status de entrega). Por agora, apenas loga os dados recebidos para monitoramento. Futuramente pode ser expandida para processar respostas dos usuários.

### Alterações no código

- Criar `supabase/functions/whatsapp-webhook/index.ts` — recebe POST do Twilio com `application/x-www-form-urlencoded`, loga e retorna 200
- Atualizar `supabase/config.toml` — registrar a nova function com `verify_jwt = false` (Twilio não envia JWT)
- Adicionar secret `TWILIO_WHATSAPP_FROM` = `whatsapp:+15559346984`

### Configuração manual no Twilio

Após o deploy, você preencherá no painel do Twilio:
- **Webhook URL**: `https://wrriittiqsmzbapbrcwm.supabase.co/functions/v1/whatsapp-webhook`
- **Status callback URL**: mesmo URL (opcional, para tracking de entrega)

