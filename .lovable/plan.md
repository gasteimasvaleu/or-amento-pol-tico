

## Plano: Splash Screen com vídeo na Home (mobile)

### Abordagem
Adicionar um estado `showSplash` no componente `Home` que, apenas no mobile e apenas uma vez por sessão, exibe o vídeo em tela cheia por 8 segundos antes de mostrar o conteúdo. Usar `sessionStorage` para garantir que a splash só aparece uma vez por sessão.

### Alterações em `src/pages/Home.tsx`
- Importar `useIsMobile` e adicionar estados `showSplash` + `useState`
- No mount, verificar se é mobile e se `sessionStorage` não tem flag `splashShown`; se sim, mostrar splash
- Renderizar um `<div>` fullscreen fixo com fundo preto e o `<video>` centralizado, `autoPlay`, `muted`, `playsInline`
- Após 8s (via `setTimeout`) ou ao vídeo terminar (`onEnded`), setar `showSplash = false` e gravar flag no `sessionStorage`
- Adicionar botão "Pular" discreto no canto para o usuário poder fechar antes
- Quando `showSplash` é true, retornar apenas a splash (sem Layout/header/bottomnav)
- URL do vídeo: `https://wrriittiqsmzbapbrcwm.supabase.co/storage/v1/object/public/criativos/splash1.mp4`

