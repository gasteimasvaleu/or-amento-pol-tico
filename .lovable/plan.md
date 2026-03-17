

## Plano: Gráficos no Dashboard

O DashboardGeral atual (`/dashboard`) é a página de perfil. Os gráficos serão adicionados à página Home (`/`) ou ao DashboardGeral. Faz mais sentido adicionar na Home, que é a landing page após login.

### 1. Migration: criar tabela `geracoes_log`

Tabela para rastrear discursos, projetos de lei e mídias geradas via IA:
- `id` uuid PK, `user_id` uuid NOT NULL, `tipo` text NOT NULL (valores: 'discurso', 'projeto_lei', 'midia_criativa'), `created_at` timestamptz DEFAULT now()
- RLS por `user_id`

Isso permite contar gerações por mês para o gráfico de Produtividade.

### 2. Registrar gerações nos componentes de Suporte

Nos componentes `GeradorDiscurso`, `GeradorProjetoLei` e `GeradorMidia`, após uma geração bem-sucedida, inserir um registro na tabela `geracoes_log`.

### 3. Criar componente `src/components/dashboard/DashboardCharts.tsx`

Três gráficos usando Recharts (já disponível via `chart.tsx`):

**Gráfico 1 — Evolução de Despesas (Line/Bar Chart):**
- Query `despesas_politicas` agrupando valor total por mês (últimos 6-12 meses)
- Eixo X: meses, Eixo Y: R$ total

**Gráfico 2 — Produtividade (Bar Chart agrupado):**
- Query `geracoes_log` contando por tipo e mês
- 3 barras por mês: Discursos, Projetos de Lei, Mídias

**Gráfico 3 — Crescimento Eleitoral (Area/Line Chart):**
- Query `eleitores` contando registros por mês (created_at)
- Linha cumulativa ou por mês

### 4. Adicionar gráficos na página Home (`src/pages/Home.tsx`)

Inserir o componente `DashboardCharts` entre a saudação e os cards de acesso rápido. Cada gráfico dentro de um Card com título e ícone.

### 5. Hook `src/hooks/useDashboardStats.ts`

Hook dedicado com 3 queries:
- Despesas agrupadas por mês
- Gerações agrupadas por tipo/mês
- Eleitores agrupados por mês

Processamento client-side para montar os dados dos gráficos a partir dos registros retornados.

