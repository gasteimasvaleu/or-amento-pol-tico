

## Plano: Ajustar Sheet lateral no mobile

### Alteração em `src/components/ui/sheet.tsx`

Modificar a variante `right` do `sheetVariants` para:
- Não ocupar a altura total no mobile: trocar `inset-y-0 h-full` por margens verticais (`top-4 bottom-4`) no mobile, mantendo `inset-y-0 h-full` no `sm:`
- Reduzir largura horizontal: usar `w-[calc(100vw-2rem)]` no mobile em vez de `w-3/4`
- Adicionar `rounded-2xl` no mobile (border-radius em todas as bordas, incluindo as esquerdas) e voltar para `sm:rounded-none sm:rounded-l-none` no desktop
- Adicionar borda discreta: `border border-border/50`
- Manter no desktop o comportamento atual (`sm:inset-y-0 sm:h-full sm:w-3/4 sm:max-w-sm sm:rounded-none`)

Também ajustar a variante `left` com o mesmo padrão espelhado, e `bottom` com `rounded-t-2xl` + margens laterais (`mx-4`).

### Resultado visual (mobile)
- Sheet lateral com margens de ~1rem nas 4 bordas
- Cantos arredondados (`rounded-2xl`)
- Borda sutil ao redor

