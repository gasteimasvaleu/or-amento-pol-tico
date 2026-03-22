

## Plano: Corrigir download de áudio do Twilio via Gateway

### Problema
`STT error: Failed to download audio: 401` — todas as tentativas de áudio falham. O código na função `transcribeAudio` (linha 154) faz `fetch(audioUrl, ...)` onde `audioUrl` é a URL direta do Twilio (`https://api.twilio.com/2010-04-01/Accounts/.../Messages/.../Media/...`). Os headers `Authorization: Bearer LOVABLE_API_KEY` + `X-Connection-Api-Key` só funcionam contra o gateway, não contra a API do Twilio diretamente.

### Correção

**Arquivo: `supabase/functions/whatsapp-webhook/index.ts`** (função `transcribeAudio`, linha ~154)

Transformar a URL do Twilio para passar pelo gateway antes de fazer o fetch:

```typescript
// Antes (falha com 401):
const audioResponse = await fetch(audioUrl, { headers: { ... } })

// Depois (roteia pelo gateway):
const gatewayAudioUrl = audioUrl.replace(
  /^https?:\/\/api\.twilio\.com/,
  'https://connector-gateway.lovable.dev/twilio'
)
const audioResponse = await fetch(gatewayAudioUrl, { headers: { ... } })
```

O gateway cuida da autenticação com o Twilio automaticamente, igual já faz para envio de mensagens.

### Resultado
- Áudio baixado com sucesso via gateway
- ElevenLabs STT recebe o arquivo e transcreve
- O agente entende a pergunta e responde corretamente

