

## Plano: Trocar EleitorDetalhe para bottom sheet

### Alteração
No `src/components/eleitores/EleitorDetalhe.tsx`, trocar o `SheetContent` de side right para `side="bottom"` com classe `rounded-t-2xl`, seguindo o mesmo padrão visual usado no detalhe de despesas (`DespesasTable.tsx` linha 219).

### Arquivo alterado
- `src/components/eleitores/EleitorDetalhe.tsx` — alterar `<SheetContent className="w-full sm:max-w-lg overflow-y-auto">` para `<SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">`

