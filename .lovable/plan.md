

# Criar cron job `expire-subscriptions-daily`

## O que será feito

Inserir um job no `pg_cron` que roda diariamente às 03:00 UTC, atualizando registros na tabela `subscribers` onde `expires_at < now()` e `status` é `active` ou `cancelled`, marcando-os como `expired`.

## Implementacao

Usar o **supabase insert tool** para executar o seguinte SQL (contém dados específicos do projeto, não deve ser migration):

```sql
SELECT cron.schedule(
  'expire-subscriptions-daily',
  '0 3 * * *',
  $$
    UPDATE public.subscribers
    SET status = 'expired',
        updated_at = now()
    WHERE expires_at < now()
      AND status IN ('active', 'cancelled');
  $$
);
```

## Verificacao

Após inserir, consultar `cron.job` para confirmar que o job foi criado corretamente.

## Notas

- As extensoes `pg_cron` e `pg_net` ja estao habilitadas (o job `extrair-noticias-diario` ja existe)
- Este e um UPDATE direto no banco, nao precisa de edge function nem `pg_net`
- Nao requer alteracao de codigo no frontend

