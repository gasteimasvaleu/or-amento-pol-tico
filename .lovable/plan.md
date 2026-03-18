

## Plano: Testar envio de notificação WhatsApp

Invocar manualmente a Edge Function `whatsapp-notificacoes` para verificar se o lembrete criado gera uma mensagem WhatsApp real para o número configurado.

### Acao

1. Chamar `POST /whatsapp-notificacoes` via `supabase--curl_edge_functions`
2. Verificar o resultado (status sent vs no_notifications)
3. Se retornar `no_notifications`, verificar a data do lembrete criado -- a function busca lembretes para **amanha** (2026-03-19), entao o lembrete precisa ter `data_lembrete` nessa data

### Detalhes tecnicos

- A Edge Function filtra lembretes com `data_lembrete` entre `2026-03-19T00:00:00` e `2026-03-19T23:59:59` e `concluido = false`
- Se o lembrete foi criado com data de hoje (2026-03-18), nao sera incluido na notificacao
- Caso necessario, orientar o usuario a editar a data do lembrete para amanha

