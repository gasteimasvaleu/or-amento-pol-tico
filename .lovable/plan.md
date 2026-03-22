

## Plano: Corrigir normalização de telefone brasileiro no webhook

### Problema
O número armazenado em `notificacao_config` é `+5583988615781` (formato completo com o 9 do celular), mas o Twilio envia `+558388615781` (12 dígitos, sem o 9). A busca por `eq('whatsapp_phone', ...)` falha porque os formatos não batem.

### Correção

**Arquivo: `supabase/functions/whatsapp-webhook/index.ts`**

Alterar a lógica de identificação do usuário (linhas ~448-473) para:

1. Normalizar o telefone recebido extraindo DDD e número
2. Se o número tem 12 dígitos (55 + DDD + 8 dígitos), adicionar o "9" para gerar variante com 13 dígitos
3. Se tem 13 dígitos (55 + DDD + 9 + 8 dígitos), gerar variante sem o "9"
4. Buscar na tabela `notificacao_config` usando `.in('whatsapp_phone', [variante1, variante2, ...])`

Isso cobre todas as combinações:
- `+5583988615781` (armazenado) vs `+558388615781` (recebido do Twilio)
- Com e sem prefixo `+`

### Resultado
O webhook vai encontrar o `user_id` independente de como o número foi salvo ou como o Twilio o envia.

