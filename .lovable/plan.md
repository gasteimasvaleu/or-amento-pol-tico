

## Corrigir Layout dos Cards - Estilo Runna

O problema: os cards estão posicionados com `bottom` e lógica invertida complexa. Na imagem de referência (Runna), os cards simplesmente se empilham **de cima para baixo**, cada um com `top` incremental, e o **último card fica na frente** (maior z-index). O stack inteiro fica ancorado na parte inferior da página.

### Alteração em `src/pages/Home.tsx`

Simplificar completamente a lógica:
- Cada card usa `top: index * 80px` (empilhamento de cima pra baixo)
- `zIndex: index + 1` (último card na frente)
- Container com altura calculada posicionado com `mt-auto` para ficar no fundo
- Remover o `bottom` positioning e a lógica de `reversedIndex`

### Alteração em `src/components/layout/Layout.tsx`

- O `main` mobile precisa de `overflow-visible` ou `overflow-hidden` removido para permitir que os cards se estendam até a bottom nav
- Remover padding-bottom excessivo para a Home poder ocupar o espaço até embaixo

