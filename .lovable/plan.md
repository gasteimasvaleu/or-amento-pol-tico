

## Plano: Atualizar Edge Function com Content Template do Twilio

### Situação
O template WhatsApp foi aprovado. Agora preciso do **Content SID** (formato `HX...`) para configurar como secret e atualizar o código.

### Passos

1. **Adicionar secret `TWILIO_CONTENT_SID`** com o valor informado pelo usuário
2. **Atualizar `supabase/functions/whatsapp-notificacoes/index.ts`** — modificar a função `sendWhatsApp` para usar `ContentSid` e `ContentVariables` em vez de `Body`
3. **Deploy da Edge Function**

### Alteração no código

Na função `sendWhatsApp`, substituir:
```ts
body: new URLSearchParams({
  To: `whatsapp:${phone}`,
  From: TWILIO_WHATSAPP_FROM,
  Body: message,
}),
```

Por:
```ts
body: new URLSearchParams({
  To: `whatsapp:${phone}`,
  From: TWILIO_WHATSAPP_FROM,
  ContentSid: TWILIO_CONTENT_SID,
  ContentVariables: JSON.stringify({ "1": message }),
}),
```

### Arquivo alterado
- `supabase/functions/whatsapp-notificacoes/index.ts`

### Próximo passo imediato
Preciso que você informe o **Content SID** (`HX...`) do template aprovado.

