

## Plano: Corrigir prefixo do remetente WhatsApp

O erro "channel mismatch" ocorre porque o `From` precisa ter o prefixo `whatsapp:` para mensagens WhatsApp. O código usa o secret `TWILIO_WHATSAPP_FROM` diretamente como valor do `From`, então há duas opções:

### Abordagem escolhida: Adicionar lógica no código

Alterar a Edge Function `whatsapp-notificacoes` para garantir que o prefixo `whatsapp:` seja adicionado automaticamente caso o secret não o contenha. Isso é mais robusto.

### Alteração

**Arquivo:** `supabase/functions/whatsapp-notificacoes/index.ts` (linha 58)

Trocar:
```ts
const TWILIO_WHATSAPP_FROM = Deno.env.get('TWILIO_WHATSAPP_FROM') || 'whatsapp:+14155238886'
```

Por:
```ts
const rawFrom = Deno.env.get('TWILIO_WHATSAPP_FROM') || '+14155238886'
const TWILIO_WHATSAPP_FROM = rawFrom.startsWith('whatsapp:') ? rawFrom : `whatsapp:${rawFrom}`
```

Isso garante que independente de como o secret foi salvo (com ou sem prefixo), o valor enviado ao Twilio sempre terá `whatsapp:`. Após o deploy, invocar novamente a function para testar o envio real.

