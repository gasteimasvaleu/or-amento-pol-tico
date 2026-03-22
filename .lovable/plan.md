

## Plano: Corrigir URL do AI Gateway no webhook

### Problema
A edge function `whatsapp-webhook` usa a URL `https://ai-gateway.lovable.dev` (com hífen), mas a URL correta usada em todas as outras edge functions do projeto é `https://ai.gateway.lovable.dev` (com ponto). Isso causa erro de DNS e o agente não responde.

### Correção

**`supabase/functions/whatsapp-webhook/index.ts`** (linha 9):
- Trocar `https://ai-gateway.lovable.dev/v1/chat/completions` por `https://ai.gateway.lovable.dev/v1/chat/completions`

Após deploy, re-testar com a mesma mensagem.

