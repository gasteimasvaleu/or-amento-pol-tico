

## Plano: Notificações no dia para lembretes e compromissos

Atualmente o sistema só avisa sobre lembretes e compromissos de **amanhã**. Vamos adicionar avisos para os de **hoje** também.

### Mudanças

**Edge Function `whatsapp-notificacoes/index.ts`**

1. Expandir a interface `NotificationData` com dois novos campos: `lembretesHoje` e `compromissosHoje`
2. Adicionar queries para buscar lembretes e compromissos do dia atual (usando `todayStr` que já existe)
3. Atualizar `buildMessage()` para incluir as novas seções:
   - `📋 *Lembretes para hoje:*` — lista lembretes pendentes com `data_lembrete` = hoje
   - `📅 *Compromissos hoje:*` — lista compromissos com `data_inicio` = hoje
4. As seções de "hoje" aparecem antes das de "amanhã" na mensagem

### Ordem da mensagem final

1. Lembretes hoje
2. Compromissos hoje
3. Lembretes amanhã
4. Compromissos amanhã
5. Despesas amanhã
6. Despesas atrasadas

Nenhuma migração necessária — apenas alteração na Edge Function.

