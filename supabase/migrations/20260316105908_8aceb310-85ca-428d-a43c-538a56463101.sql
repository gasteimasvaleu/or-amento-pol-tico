SELECT cron.schedule(
  'extrair-noticias-diario',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://wrriittiqsmzbapbrcwm.supabase.co/functions/v1/extrair-noticias',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndycmlpdHRpcXNtemJhcGJyY3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTcwODEsImV4cCI6MjA4MDE3MzA4MX0.hYEjxKv7tJVReWRPxPG1s5l8mNDQgLrTvBIUFaUqL-Q"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);