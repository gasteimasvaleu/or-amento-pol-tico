

## Plano: Automação de Notificações via WhatsApp

### Visão Geral

Criar um sistema de notificações automáticas via WhatsApp que avisa o usuário sobre:

1. **Despesas** — 1 dia antes do vencimento + 5 dias depois se ainda pendente
2. **Lembretes** — 1 dia antes da data do lembrete
3. **Agenda** — 1 dia antes do compromisso

### Tecnologia

- **Twilio WhatsApp API** via conector gateway (já disponível como conector Lovable)
- **Edge Function agendada** via `pg_cron` (roda 1x por dia, ex: 8h da manhã)
- **Telefone do usuário** — já existe coluna `phone` na tabela `profiles`

### Arquitetura

```text
pg_cron (diário 8h)
  └─► Edge Function "whatsapp-notificacoes"
        ├─ Consulta despesas (vencimento amanhã OU pendentes há 5+ dias)
        ├─ Consulta lembretes (data_lembrete = amanhã, não concluídos)
        ├─ Consulta compromissos (data_inicio = amanhã)
        ├─ Agrupa por user_id
        ├─ Busca phone de cada user em profiles
        └─ Envia WhatsApp via Twilio Gateway
```

### Alterações

1. **Conectar Twilio** — vincular conector ao projeto
2. **Edge Function `whatsapp-notificacoes/index.ts`** — lógica principal:
   - Query despesas recorrentes cujo dia de vencimento é amanhã (sem `pagamento_feito_em` no mês atual)
   - Query despesas com vencimento há 5+ dias sem `pagamento_feito_em`
   - Query lembretes pendentes com `data_lembrete` = amanhã
   - Query compromissos com `data_inicio` = amanhã
   - Agrupa tudo por usuário, monta mensagem formatada
   - Envia via Twilio WhatsApp gateway
3. **Configurar pg_cron** — agendar execução diária às 8h (UTC-3 = 11h UTC)
4. **Tela de configuração** — campo para o usuário informar/editar seu telefone WhatsApp no perfil (já existe `phone` em profiles, só garantir que está acessível na UI)
5. **Tabela `notificacao_config`** (opcional) — permitir o usuário ativar/desativar cada tipo de notificação

### Pré-requisitos

- Você precisa ter uma conta Twilio com um número habilitado para WhatsApp (Twilio Sandbox para testes ou número aprovado para produção)
- O telefone do usuário precisa estar no formato internacional (+55...)

### Mensagem exemplo

```
📋 *Lembretes para amanhã:*
• Reunião com assessores (Alta)

📅 *Compromissos amanhã:*
• Audiência pública - 14:00, Câmara Municipal

💰 *Despesas com vencimento amanhã:*
• João Silva - R$ 2.500,00 (Assessor)

⚠️ *Despesas pendentes (atrasadas):*
• Maria Santos - R$ 1.800,00 (venceu há 5 dias)
```

### Considerações

- Twilio WhatsApp requer templates aprovados para mensagens proativas (fora da janela de 24h). Para produção, será necessário registrar templates no Twilio. Para testes, o Sandbox funciona com mensagens livres.
- A coluna `phone` já existe em `profiles` — só precisamos garantir que o usuário a preencha.

