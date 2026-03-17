

## Plano: WhatsApp, editar eleitor e classificador por cor

### 1. Migration: adicionar coluna `classificacao` na tabela `eleitores`
- Adicionar coluna `classificacao text default 'neutro'` com valores possíveis: `positivo`, `neutro`, `negativo`

### 2. Atualizar tipo `Eleitor` e `EleitorInsert`
- **`src/types/eleitor.ts`**: adicionar `classificacao: string` ao `Eleitor`

### 3. Atualizar `EleitorModal` para suportar criação e edição
- **`src/components/eleitores/EleitorModal.tsx`**:
  - Aceitar prop opcional `eleitor?: Eleitor` para modo edição (preencher form com dados existentes)
  - Título dinâmico: "Novo Eleitor" / "Editar Eleitor"
  - Adicionar seletor de classificação com 3 botões coloridos (vermelho/amarelo/verde) representando negativo/neutro/positivo
  - Inicializar form com `classificacao: "neutro"` por padrão

### 4. Atualizar card do eleitor na página `GestaoEleitores`
- **`src/pages/GestaoEleitores.tsx`**:
  - Adicionar botão WhatsApp (ícone verde pequeno) que abre `https://wa.me/{telefone}` em nova aba (com `stopPropagation`), visível apenas se o eleitor tiver telefone
  - Adicionar botão editar (ícone Pencil) ao lado do delete, que abre o modal em modo edição
  - Exibir um pequeno indicador de cor (bolinha) no card baseado na `classificacao` do eleitor
  - Passar `updateEleitor` do hook para o modal de edição

### 5. Hook `useEleitores` — sem mudanças necessárias
- `updateMutation` já existe e aceita campos parciais

