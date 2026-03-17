

## Correção: Safe Area excessiva no iOS (topo e rodapé)

### Problema
O `capacitor.config.ts` tem `contentInset: 'always'`, que faz o iOS aplicar safe area insets automaticamente no WebView. Porém, o CSS já aplica safe area manualmente (`pt-[env(safe-area-inset-top)]` no header, `pb-[env(safe-area-inset-bottom)]` no BottomNav). Isso gera **padding duplicado** — o sistema aplica uma vez e o CSS aplica novamente.

Além disso, o `apple-mobile-web-app-status-bar-style` está como `black`, o que pode causar uma barra preta extra no topo.

### Solução

1. **`capacitor.config.ts`** — Remover `contentInset: 'always'` para que o iOS não aplique safe area automaticamente (o CSS já cuida disso):
   ```ts
   ios: {
     backgroundColor: '#FFFFFF',
     scheme: 'mandatointeligente',
   },
   ```

2. **`index.html`** — Trocar o status bar style de `black` para `default` para evitar barra preta extra:
   ```html
   <meta name="apple-mobile-web-app-status-bar-style" content="default" />
   ```

Após essas mudanças, será necessário rebuild + sync:
```
npm run build && npx cap sync ios && npx cap open ios
```

