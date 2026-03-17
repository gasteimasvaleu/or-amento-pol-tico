

## Plano: Mover splash screen para antes do Login

### Alterações

1. **`src/pages/Login.tsx`** — Adicionar a lógica de splash screen (8 segundos, mobile only, uma vez por sessão via `sessionStorage`) antes de exibir o formulário de login. Mesma lógica atual: vídeo fullscreen com `autoPlay`, `muted`, `playsInline`, dismiss por `onEnded` ou `setTimeout(8000)`.

2. **`src/pages/Home.tsx`** — Remover toda a lógica de splash screen (estado `showSplash`, `useEffect`, bloco condicional do vídeo) e a importação de `useIsMobile`, deixando apenas o conteúdo normal da Home.

