

## Plano: Recursos/Emendas como lista dinâmica + Upload de mídias da cidade

### 1. Migration: alterar colunas e criar tabela de mídias

- Alterar `recursos_destinados` de `numeric` para `jsonb DEFAULT '[]'` — armazena array de `{objeto, valor}`
- Alterar `emendas_parlamentares` de `text` para `jsonb DEFAULT '[]'` — mesma estrutura
- Criar tabela `cidade_midias` com: `id`, `cidade_id` (FK para cidades), `user_id`, `arquivo_url`, `arquivo_nome`, `arquivo_tipo`, `descricao`, `created_at`
- RLS na `cidade_midias` vinculada ao `user_id`

### 2. Atualizar `src/types/cidade.ts`

- Criar tipo `RecursoItem = { objeto: string; valor: number }`
- `recursos_destinados` e `emendas_parlamentares` passam a ser `RecursoItem[]`
- Criar interface `CidadeMidia` para a nova tabela

### 3. Atualizar `CidadeModal`

**Seção Recursos Destinados:**
- Lista dinâmica de itens, cada um com Input "Objeto" + Input "R$" na mesma linha
- Botão "+" para adicionar novo item, botão "X" para remover
- Total calculado automaticamente exibido abaixo

**Seção Emendas Parlamentares:**
- Mesma estrutura de lista dinâmica (Objeto + R$)

**Seção Mídias da Cidade (nova):**
- Input de upload de arquivo + Input de descrição
- Lista das mídias já enviadas com preview e botão de remover
- Upload vai para o bucket `midias` do Supabase Storage
- Mídias são salvas na tabela `cidade_midias` após o save da cidade

### 4. Atualizar hook `useCidades`

- Parsear `recursos_destinados` e `emendas_parlamentares` como JSON ao ler
- Serializar como JSON ao salvar

### 5. Criar hook ou lógica para `cidade_midias`

- Funções de upload (usar bucket `midias`), create e delete para mídias vinculadas à cidade
- Integrar no `CidadeModal` — carregar mídias ao abrir em modo edição

### 6. Atualizar card em `GestaoCidades`

- Exibir soma total dos recursos (calculada do array JSON) no card
- Exibir contagem de mídias se houver

