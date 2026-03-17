

## Plano: Adicionar campo "Cidade" ao eleitor

### 1. Migration: adicionar coluna `cidade` na tabela `eleitores`
- `ALTER TABLE public.eleitores ADD COLUMN cidade text NOT NULL DEFAULT '';`

### 2. Atualizar tipo `EleitorInsert` em `src/types/eleitor.ts`
- Adicionar `cidade: string` ao tipo `Eleitor`

### 3. Atualizar `EleitorModal` (`src/components/eleitores/EleitorModal.tsx`)
- Adicionar `cidade: ""` ao `emptyForm`
- Adicionar input "Cidade" no formulário (antes do campo Bairro)
- Incluir `cidade` no `useEffect` que preenche o form em modo edição

### 4. Atualizar card em `GestaoEleitores` (`src/pages/GestaoEleitores.tsx`)
- Na linha que mostra `MapPin` + bairro, exibir `cidade / bairro` (mostrando cidade antes, separados por `/`)
- Mostrar apenas o que estiver preenchido (só cidade, só bairro, ou ambos com `/`)

