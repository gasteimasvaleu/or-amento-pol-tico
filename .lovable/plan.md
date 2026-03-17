

## Problema

O `isMobile` hook retorna `undefined`/`false` no primeiro render (antes de medir o viewport), então o `useEffect` executa com `isMobile = false` e nunca ativa a splash. Quando o hook finalmente resolve `true`, o effect já rodou e não roda de novo (ou roda tarde demais). Além disso, o timer de 8s compete com o `onEnded` — se o vídeo demora a carregar, o timer esconde a splash antes do vídeo terminar.

## Correção em `src/pages/Login.tsx`

1. **Esperar o hook `isMobile` estabilizar** — Só decidir sobre a splash depois que `isMobile` tiver um valor confiável. O hook `useIsMobile` usa um state que começa `undefined` e só fica definido após o primeiro `useEffect`. Precisamos tratar esse estado inicial.

2. **Remover o timer fixo de 8s** — Confiar apenas no `onEnded` do vídeo. Se o vídeo falhar ao carregar, usar `onError` como fallback para esconder a splash.

3. **Adicionar `onCanPlay`/`onLoadedData`** não é necessário — o `autoPlay` já cuida disso.

### Mudanças concretas:

**useEffect** — Adicionar guard para `isMobile === undefined`:
```tsx
useEffect(() => {
  if (isMobile === undefined) return; // hook ainda não mediu
  if (isMobile && !sessionStorage.getItem("splashShown")) {
    setShowSplash(true);
    sessionStorage.setItem("splashShown", "1");
  }
}, [isMobile]);
```
Sem timer. A splash só fecha via `onEnded` ou `onError`.

**Video element** — Adicionar `onError` como fallback:
```tsx
<video
  ...
  onEnded={() => setShowSplash(false)}
  onError={() => setShowSplash(false)}
  ...
/>
```

Isso garante que:
- A splash só aparece quando `isMobile` é confirmado `true`
- A splash dura exatamente o tempo do vídeo (não é cortada por timer)
- Se o vídeo falhar, a splash fecha graciosamente

