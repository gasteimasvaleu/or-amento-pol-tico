

## Plano: Corrigir scroll iOS (rubber-banding) com navbars fixas

### Alterações

**1. `index.html`** — Adicionar `<meta name="theme-color" content="#000000" />` e mudar `apple-mobile-web-app-status-bar-style` de `black-translucent` para `black`.

**2. `src/index.css`** — Adicionar regras globais de scroll:
- `html, body`: `overflow: hidden; height: 100%; overscroll-behavior: none;`
- `body`: safe-area paddings em todos os lados
- `#root`: `overflow-y: auto; overflow-x: hidden; height: 100%; -webkit-overflow-scrolling: touch; overscroll-behavior: none;` + ocultar scrollbar

**3. `src/components/layout/Layout.tsx`** — No mobile:
- Header: mudar de `sticky` para `fixed top-0 left-0 right-0`, adicionar `pt-[max(0.5rem,env(safe-area-inset-top))]`, e propriedades GPU: `style={{ WebkitTransform: 'translateZ(0)', willChange: 'transform' }}`
- Wrapper div: remover `min-h-screen`, usar `flex flex-col h-full`
- Main: adicionar `flex-1 overflow-y-auto` com margem superior para compensar o header fixo

**4. `src/components/layout/BottomNav.tsx`** — Na nav fixa inferior, adicionar `style={{ WebkitTransform: 'translateZ(0)', willChange: 'transform' }}` para forçar composição GPU e evitar tremor.

### Resultado
O scroll fica contido apenas no `#root` (ou na `main`), impedindo o rubber-banding do Safari de deslocar as barras fixas superior e inferior.

