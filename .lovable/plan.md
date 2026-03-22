
Diagnóstico confirmado pelos logs:
- O webhook está recebendo o áudio corretamente (`NumMedia: 1`, `audio/ogg`), mas o download falha com `404`.
- A URL usada hoje no `transcribeAudio` está assim: `https://connector-gateway.lovable.dev/twilio/2010-04-01/Accounts/.../Messages/.../Media/...`.
- No gateway do conector Twilio, o prefixo `/2010-04-01/Accounts/{AccountSid}` já é adicionado automaticamente. Ao enviar a URL completa, o caminho fica duplicado internamente e retorna 404.

Plano de correção (direto ao ponto):

1) Ajustar montagem da URL de mídia no `supabase/functions/whatsapp-webhook/index.ts`
- Na função `transcribeAudio`, parar de trocar apenas o domínio.
- Fazer parse do `audioUrl` e extrair somente o path relativo do recurso Twilio:
  - de: `/2010-04-01/Accounts/{sid}/Messages/{sid}/Media/{sid}`
  - para: `/Messages/{sid}/Media/{sid}`
- Montar URL final como `${GATEWAY_URL}${relativePath}` (preservando querystring se existir).

2) Melhorar observabilidade de erro de download
- Quando `audioResponse.ok === false`, logar status + trecho do body de erro do gateway.
- Isso evita diagnóstico cego caso haja novo problema (permissão, rota, mídia expirada etc.).

3) Melhorar fallback de STT para não “mascarar” falha
- Em vez de sempre seguir com `[áudio não reconhecido]`, responder ao usuário com uma mensagem técnica amigável quando o download/STT falhar (“não consegui processar este áudio agora, tente reenviar em 1 minuto”).
- Evita que o modelo invente respostas como “não consigo ouvir áudios” quando o problema é temporário de fetch.

4) Validação pós-ajuste
- Enviar novo áudio real via WhatsApp.
- Confirmar nos logs:
  - URL de download sem o prefixo completo (`.../twilio/Messages/.../Media/...`).
  - ausência de `STT error: Failed to download audio: 404`.
  - presença de `Transcribed audio: ...`.
- Confirmar em `whatsapp_conversas` que a mensagem `role=user` não está mais como `[áudio não reconhecido]`.
