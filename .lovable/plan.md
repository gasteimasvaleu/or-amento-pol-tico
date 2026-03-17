

## Plano: Página Gestão de Cidades (sem card na Home)

### 1. Migration: criar tabela `cidades`
Campos: `id` uuid PK, `user_id` uuid NOT NULL, `nome` text NOT NULL, `estado` text DEFAULT '', `populacao` integer DEFAULT 0, `eleitorado` integer DEFAULT 0, `prefeito` text DEFAULT '', `vice_prefeito` text DEFAULT '', `vereadores` text DEFAULT '', `recursos_destinados` numeric DEFAULT 0, `acoes_realizadas` text DEFAULT '', `emendas_parlamentares` text DEFAULT '', `observacoes` text DEFAULT '', `created_at`/`updated_at` timestamps.

RLS: 4 policies (select, insert, update, delete) vinculadas a `auth.uid() = user_id`.
Trigger `update_updated_at_column` no update.

### 2. `src/types/cidade.ts`
Interfaces `Cidade` e `CidadeInsert`.

### 3. `src/hooks/useCidades.ts`
Hook CRUD seguindo padrão de `useEleitores`.

### 4. `src/components/cidades/CidadeModal.tsx`
Modal com formulário organizado em seções:
- **Dados gerais**: nome, estado, população, eleitorado
- **Governo local**: prefeito, vice-prefeito, vereadores (textarea)
- **Atuação parlamentar**: recursos destinados (R$), ações realizadas (textarea), emendas parlamentares (textarea)
- **Observações**: textarea

Suporta criação e edição (prop `cidade?`).

### 5. `src/pages/GestaoCidades.tsx`
- Busca + botão "Nova Cidade"
- Cards com info resumida (nome, estado, população, prefeito, valor destinado)
- Botões editar/deletar
- Modal para criar/editar

### 6. Rota e navegação (sem Home)
- **`App.tsx`**: rota `/gestao-de-cidades` protegida
- **`AppSidebar.tsx`**: item "Cidades" com ícone `Building2`
- **`BottomNav.tsx`**: item "Cidades" no menu "Mais"
- **NÃO** adicionar card na página Home

