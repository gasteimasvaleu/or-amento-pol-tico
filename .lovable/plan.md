

## Corrigir erro Twilio 21656 (ContentVariables inválido)

**Problema**: A função `buildMessage` gera texto com `\n` entre itens e `\n\n` entre seções. O Twilio Content API rejeita newlines, tabs e 4+ espaços consecutivos dentro de `ContentVariables`.

**Correção**: No arquivo `supabase/functions/whatsapp-notificacoes/index.ts`, sanitizar o conteúdo da variável antes de enviar ao Twilio.

### Alteração

Na função `sendWhatsApp`, antes de montar o body, adicionar sanitização:

```typescript
const sanitized = message
  .replace(/\n\n/g, ' — ')
  .replace(/\n/g, ' | ')
  .replace(/\t/g, ' ')
  .replace(/ {4,}/g, '   ');
```

E usar `sanitized` no lugar de `message` no `ContentVariables`:

```typescript
ContentVariables: JSON.stringify({ "1": sanitized }),
```

### Arquivo afetado
- `supabase/functions/whatsapp-notificacoes/index.ts` — função `sendWhatsApp`

### Resultado esperado
A mensagem será enviada com separadores inline (`—` entre seções, `|` entre itens) em vez de quebras de linha, eliminando o erro 21656.

