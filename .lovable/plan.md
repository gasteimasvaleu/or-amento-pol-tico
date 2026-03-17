

## Plano: Ajustar margem do Sheet lateral (direita → esquerda)

O Sheet `right` surge do lado direito, então a margem deveria estar no lado esquerdo (para criar o efeito "flutuante" afastado da borda esquerda), não no direito.

### Alteração em `src/components/ui/sheet.tsx`

Na variante `right` do `sheetVariants`, trocar `right-4` por `right-0` e adicionar margem à esquerda implicitamente via `w-[calc(100vw-2rem)]` (o sheet já não ocupa 100% da largura, então ele fica naturalmente afastado da borda esquerda). Porém o `right-4` está empurrando o sheet para dentro — o correto é manter `right-0` no mobile para que ele fique colado à direita e o espaço livre fique à esquerda.

Mesma lógica espelhada para a variante `left`: trocar `left-4` por `left-0` para que fique colado à esquerda e o espaço fique à direita.

**Resumo das mudanças na variante `right`:**
- `right-4` → `right-0` (cola na borda direita)
- Manter `top-4 bottom-4` (margens vertical)
- Manter `w-[calc(100vw-2rem)]`, `rounded-2xl`, `border border-border/50`

**Variante `left`:**
- `left-4` → `left-0` (cola na borda esquerda)
- Resto igual

