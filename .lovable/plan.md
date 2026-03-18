

## Plano: Adicionar secret e criar webhook

### Alterações

1. **Adicionar secret `TWILIO_WHATSAPP_FROM`** com valor `whatsapp:+15559346984` nos secrets do Supabase
2. **Criar Edge Function `whatsapp-webhook/index.ts`** — recebe POST do Twilio (incoming messages + status callbacks), loga e retorna 200
3. **Atualizar `supabase/config.toml`** — registrar `whatsapp-webhook` com `verify_jwt = false`

### Configuração manual no Twilio (após deploy)

Na tela do WhatsApp Sender no Twilio, preencher:
- **Webhook URL**: `https://wrriittiqsmzbapbrcwm.supabase.co/functions/v1/whatsapp-webhook`
- **Method**: HTTP Post

