

## Página /noticias — Monitoramento de Sites de Notícias

### Visão Geral

Criar uma página onde o parlamentar cadastra sites de notícias. Uma edge function busca as últimas 5 notícias de cada site, gera resumos via IA e armazena no banco. Um cron job executa isso diariamente às 5h.

### Banco de Dados

**Tabela `sites_noticias`** — sites cadastrados pelo usuário:
- `id`, `user_id`, `nome` (nome do site), `url` (URL base), `ativo` (boolean), `created_at`, `updated_at`
- RLS: CRUD vinculado ao `user_id`

**Tabela `noticias_resumos`** — notícias extraídas com resumo:
- `id`, `user_id`, `site_id` (FK para sites_noticias), `titulo`, `url`, `resumo`, `data_extracao`, `created_at`
- RLS: SELECT/DELETE vinculado ao `user_id`

### Edge Function `extrair-noticias`

1. Busca todos os sites ativos na tabela `sites_noticias`
2. Para cada site, faz fetch do HTML, extrai links de notícias (tags `<a>` com padrões de artigos)
3. Para as 5 primeiras notícias, faz fetch do conteúdo e usa o Lovable AI Gateway para gerar um resumo curto
4. Salva os resumos na tabela `noticias_resumos`
5. Trata erros 429/402 do gateway

### Cron Job

Usar `pg_cron` + `pg_net` para chamar a edge function diariamente às 5:00 AM (UTC-3 = 08:00 UTC):

```sql
select cron.schedule('extrair-noticias-diario', '0 8 * * *', $$...$$);
```

Será executado via SQL insert tool (não migration, pois contém dados específicos do projeto).

### Frontend — Página `/noticias`

| Componente | Descrição |
|-----------|-----------|
| Lista de sites | Cards com nome, URL e toggle ativo/inativo |
| Modal de cadastro | Nome do site + URL |
| Lista de notícias | Cards com título, resumo e data, agrupados por site |
| Botão "Atualizar agora" | Chama a edge function manualmente |

### Arquivos

| Arquivo | Ação |
|---------|------|
| Migration SQL | Criar tabelas `sites_noticias` e `noticias_resumos` |
| `supabase/functions/extrair-noticias/index.ts` | Edge function de extração + resumo |
| `supabase/config.toml` | Adicionar `[functions.extrair-noticias]` |
| `src/pages/Noticias.tsx` | Página principal |
| `src/hooks/useNoticias.ts` | Hook para sites e resumos |
| `src/App.tsx` | Adicionar rota `/noticias` |
| `src/components/layout/AppSidebar.tsx` | Adicionar link Notícias |
| `src/components/layout/BottomNav.tsx` | Adicionar no menu "Mais" |

