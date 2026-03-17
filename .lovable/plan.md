

## Plano: Corrigir Sheet lateral — margem esquerda e border-radius só nos cantos esquerdos

O problema é duplo na variante `right`:

1. **Border-radius nos 4 cantos** — deveria ser só nos cantos esquerdos (`rounded-l-2xl` em vez de `rounded-2xl`), pois o painel cola na borda direita.
2. **Sem margem horizontal visível** — o `w-[calc(100vw-2rem)]` deveria criar espaço à esquerda, mas preciso confirmar que está funcionando. Caso o sheet esteja ocupando a tela toda, o espaço não aparece.

### Alteração em `src/components/ui/sheet.tsx`

**Variante `right` (linha 40-41):**
- `rounded-2xl` → `rounded-l-2xl` (border-radius só nos cantos top-left e bottom-left)
- Manter `right-0`, `top-4 bottom-4`, `w-[calc(100vw-2rem)]`
- Manter `border border-border/50`

**Variante `left` (linha 39) — mesma lógica espelhada:**
- `rounded-2xl` → `rounded-r-2xl` (border-radius só nos cantos top-right e bottom-right)

**Variante `bottom` (linha 37-38):**
- Manter `rounded-2xl` (já está correto para bottom)

