

## Plano: Job diário para expirar assinaturas vencidas

### Objetivo
Criar um cron job via `pg_cron` + `pg_net` que roda 1x por dia e atualiza o `status` de assinaturas com `expires_at` no passado para `'expired'`.

### Abordagem

Em vez de criar uma edge function separada, usar **SQL puro direto no pg_cron** -- é mais simples e eficiente para este caso.

### Implementação

1. **Habilitar extensões** `pg_cron` e `pg_net` (se ainda nao ativas)

2. **Criar o cron job** via SQL (executado pelo insert tool, nao por migration):

```sql
-- Roda todo dia às 03:00 UTC
SELECT cron.schedule(
  'expire-subscriptions-daily',
  '0 3 * * *',
  $$
  UPDATE public.subscribers
  SET status = 'expired',
      updated_at = now()
  WHERE status IN ('active', 'cancelled')
    AND expires_at IS NOT NULL
    AND expires_at < now();
  $$
);
```

Isso garante que mesmo se o webhook do RevenueCat falhar ou atrasar, assinaturas vencidas sejam marcadas como `expired` automaticamente.

### Observacoes
- O cron roda com permissoes de superuser, entao acessa a tabela `subscribers` sem restricao de RLS
- Nao afeta assinaturas sem `expires_at` (lifetime ou indefinidas)
- Assinaturas renovadas pelo webhook voltam a `active` normalmente

