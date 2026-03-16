

## Plano: Fixar botão visualizar sem scroll no mobile

O problema é que as 3 colunas (Município, Responsável, Cargo) + botão Eye ultrapassam 390px, causando scroll horizontal.

### Alterações em `src/components/despesas/DespesasTable.tsx`

- Adicionar classes de truncamento e largura máxima nas cells mobile:
  - `TableCell` de Município: `max-w-[100px] truncate`
  - `TableCell` de Responsável: `max-w-[100px] truncate`
  - `TableCell` de Cargo: `max-w-[80px] truncate`
- Reduzir padding nas cells no mobile: `p-2 md:p-4`
- Coluna do botão Eye: `w-10` fixo, sem crescer

### Alterações em `src/components/ui/table.tsx`
- Nenhuma — o ajuste será via classes inline nas cells do `DespesasTable`

### Resultado
- As 3 colunas + botão cabem em 390px sem scroll
- Textos longos são truncados com `...`
- Desktop inalterado

