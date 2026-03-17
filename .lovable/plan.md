

## Plano: Configuração completa do iOS (câmera, display name, splash branca)

### Alterações no código

**1. `capacitor.config.ts`** — Atualizar config completo:
- `appName`: mudar de `politico-controle-facil` para `Mandato Intelligence` (é o display name que aparece no iOS)
- `backgroundColor`: mudar de `#000000` para `#FFFFFF`
- Adicionar permissões de câmera/galeria no bloco `ios` (NSCameraUsageDescription, NSPhotoLibraryUsageDescription)

**2. `package.json`** — Adicionar dependência:
- `@capacitor/camera` — plugin que habilita acesso à câmera e galeria com mensagem de autorização nativa

### Configuração final do `capacitor.config.ts`:
```ts
const config: CapacitorConfig = {
  appId: 'app.mandatointeligente.app',
  appName: 'Mandato Intelligence',
  webDir: 'dist',
  server: {
    url: 'https://238c6c3f-cd3d-4924-bcd9-404c97bcf042.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#FFFFFF',
    scheme: 'mandatointeligente',
  },
  plugins: {
    Camera: {
      NSCameraUsageDescription: 'Este app precisa acessar a câmera para capturar fotos.',
      NSPhotoLibraryUsageDescription: 'Este app precisa acessar suas fotos para enviar mídias.',
      NSPhotoLibraryAddUsageDescription: 'Este app precisa salvar fotos na sua galeria.',
    },
  },
};
```

### O que o `@capacitor/camera` resolve automaticamente:
- Mensagem de autorização nativa ao acessar câmera
- Mensagem de autorização nativa ao acessar galeria
- Entradas no `Info.plist` geradas pelo `npx cap sync` (sem editar Xcode)

### Após o commit (no Mac):
```bash
git pull
npm install
npx cap sync ios
npx cap open ios
```

### Único passo manual restante:
- **Ícone do app**: arrastar o `icon1024.png` no Asset Catalog do Xcode (Assets.xcassets > AppIcon). Não existe forma de automatizar isso via Capacitor — é obrigatório pelo Xcode.

