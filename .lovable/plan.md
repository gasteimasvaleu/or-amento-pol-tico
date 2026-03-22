
Diagnóstico rápido do problema atual:

- O webhook está tratando mensagens recebidas como se fossem “status callback”.
- No payload real da Twilio para mensagem recebida, costuma vir `SmsStatus=received`/`MessageStatus=received`; hoje o código interpreta isso como callback e retorna cedo.
- Isso explica o log só com `Status callback: received ...` e nenhum processamento do áudio.
- Há um segundo ponto provável para áudio: `MediaContentType0` pode vir como formatos não cobertos (ex.: `application/ogg`) e o download do `MediaUrl0` precisa ser robusto para Twilio.

Plano de correção (sem mudar arquitetura):

1) Corrigir a detecção de inbound vs status callback  
Arquivo: `supabase/functions/whatsapp-webhook/index.ts`
- Substituir a regra atual:
  - hoje: `if (body.MessageStatus || body.SmsStatus) ...`
- Por uma regra explícita:
  - considerar **inbound** quando existir `From` e (`Body` presente ou `NumMedia > 0`)
  - considerar **status callback** apenas quando **não** for inbound.
- Resultado: mensagens de áudio/texto deixam de ser descartadas no início.

2) Fortalecer o processamento de áudio  
Arquivo: `supabase/functions/whatsapp-webhook/index.ts`
- Ampliar detecção de áudio para aceitar variações de content type (`audio/*`, `application/ogg`, `opus`).
- Melhorar log de diagnóstico para incluir `NumMedia` e `MediaContentType0`.
- Ajustar tratamento de erro de transcrição para responder ao usuário com mensagem clara (em vez de silêncio operacional).

3) Garantir leitura correta da mídia da Twilio  
Arquivo: `supabase/functions/whatsapp-webhook/index.ts`
- Revisar `transcribeAudio` para baixar mídia de forma compatível com Twilio (incluindo autenticação e URL de mídia), sem depender de comportamento implícito.
- Manter ElevenLabs STT (`scribe_v2`) como está.

4) Validação pós-correção (obrigatória)  
- Teste 1 (simulado): chamar webhook com payload contendo `From`, `NumMedia`, `SmsStatus=received`; confirmar que cai no fluxo de inbound e não em status callback.
- Teste 2 (real): enviar áudio no WhatsApp; verificar:
  - log `Incoming message... Media: 1`
  - log de transcrição
  - registro em `whatsapp_conversas` (`role=user` e `role=assistant`)
  - resposta chegando no WhatsApp.
- Teste 3 (controle): enviar texto simples e confirmar que continua funcionando.

Se após isso ainda não entrar log de inbound, o próximo passo é validar no Twilio Console se o “When a message comes in” está apontando para `.../functions/v1/whatsapp-webhook` (não apenas status callback).
