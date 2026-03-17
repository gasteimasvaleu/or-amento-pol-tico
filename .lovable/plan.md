

## Plano: Adicionar "Novo Bairro" com modal e lideranças dinâmicas

### 1. Migration: criar tabela `bairros`

Campos: `id` uuid PK, `cidade_id` uuid FK para `cidades` (ON DELETE CASCADE), `user_id` uuid NOT NULL, `nome` text NOT NULL, `liderancas` jsonb DEFAULT '[]' (array de strings — nomes das lideranças), `populacao` integer DEFAULT 0, `eleitorado` integer DEFAULT 0, `recursos_destinados` jsonb DEFAULT '[]' (mesma estrutura `RecursoItem`), `acoes_realizadas` text DEFAULT '', `emendas_parlamentares` jsonb DEFAULT '[]', `observacoes` text DEFAULT '', `created_at`/`updated_at` timestamps.

RLS: 4 policies (select, insert, update, delete) vinculadas a `auth.uid() = user_id`.

### 2. Atualizar `src/types/cidade.ts`

Adicionar interfaces `Bairro` e `BairroInsert`, com `liderancas: string[]` no lugar de prefeito/vice/vereadores.

### 3. Criar hook `useBairros` em `src/hooks/useCidades.ts`

Hook CRUD para bairros, seguindo o mesmo padrão de `useCidades`. Recebe `cidadeId` opcional para filtrar.

### 4. Criar `src/components/cidades/BairroModal.tsx`

Modal similar ao `CidadeModal` mas com as seguintes diferenças na seção "Governo Local":
- Substituir Prefeito, Vice-Prefeito e Vereadores por **lista dinâmica de Lideranças** (botão "+ Adicionar", cada item é um Input de texto com botão "X" para remover)
- Manter as demais seções: Dados Gerais (nome, população, eleitorado), Recursos Destinados, Emendas Parlamentares, Ações Realizadas, Observações, Mídias

### 5. Atualizar `src/pages/GestaoCidades.tsx`

- Adicionar botão **"+ Novo Bairro"** abaixo do botão "Nova Cidade" (requer selecionar a cidade ao criar)
- Listar bairros dentro dos cards de cidade (ou em seção expandível)
- Modal de bairro com select de cidade vinculada
- Botões editar/deletar bairro

### 6. Atualizar cards em `GestaoCidades`

- Exibir contagem de bairros cadastrados por cidade
- Exibir lideranças no card do bairro

