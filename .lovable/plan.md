

## Diagnóstico

O layout está "desmantelado" por **dupla aplicação de safe-area insets**:

1. O `body` tem `padding-top: env(safe-area-inset-top)` e `padding-bottom: env(safe-area-inset-bottom)` — isso empurra todo o `#root` para baixo e encurta por baixo.
2. O header fixo (`fixed top-0`) fica no topo do **viewport** (atrás da status bar), e internamente aplica `pt-[max(0.5rem,env(safe-area-inset-top))]` — mas como tem altura fixa `h-12`, o padding come o espaço da logo, que fica espremida ou desalinhada.
3. O bottom nav tem `pb-[env(safe-area-inset-bottom)]` + o body padding = espaço duplo embaixo.

O gap enorme entre a barra superior e o banner é o `padding-top` do body + o `mt-12` do main somados.

## Correções

### 1. `src/index.css` — Remover safe-area paddings do body
Elementos `position: fixed` não são afetados pelo padding do body, então cada componente fixo deve gerenciar seu próprio safe-area. O body não deve ter esses paddings.

```css
body {
  /* REMOVER todos os padding de safe-area */
}
```

### 2. `src/components/layout/Layout.tsx` — Ajustar header mobile
- Remover `h-12` fixo do header; usar altura automática com padding
- Manter `pt-[env(safe-area-inset-top)]` para empurrar conteúdo abaixo da status bar
- Adicionar padding interno (`py-2 px-4`) para a logo
- No `main`, trocar `mt-12` por um valor que considere a safe-area: `mt-[calc(env(safe-area-inset-top)+3rem)]`

```tsx
<header
  className="fixed top-0 left-0 right-0 z-50 flex items-center border-b border-border bg-card px-4 pt-[env(safe-area-inset-top)] pb-2"
  style={{ WebkitTransform: 'translateZ(0)', willChange: 'transform' }}
>
```

```tsx
<main className="flex-1 flex flex-col px-4 py-4 pb-24 mt-[calc(env(safe-area-inset-top)+3rem)]">
```

### 3. Bottom nav — já está correto
O `pb-[env(safe-area-inset-bottom)]` no nav é suficiente. Sem o body padding duplo, volta ao normal. O `pb-20` no main precisa subir para `pb-24` para dar espaço adequado ao bottom nav + safe area.

### Resumo das mudanças
- **`src/index.css`**: remover 4 linhas de `padding-*: env(safe-area-inset-*)` do `body`
- **`src/components/layout/Layout.tsx`**: ajustar header (remover `h-12`, usar `pt-[env(safe-area-inset-top)] pb-2`) e main (`mt-[calc(...)]`, `pb-24`)

