

## Plano: App embarcado (sem server.url)

### Problema atual
O `capacitor.config.ts` tem `server.url` apontando para `https://app.mandatointeligente.app`. Isso faz o WebView carregar esse site remoto. Se o DNS, SSL ou domínio tiver qualquer problema, o app mostra uma página errada ou erro de carregamento.

### Solução
Remover o bloco `server` inteiro do `capacitor.config.ts`. Isso faz o Capacitor carregar os arquivos HTML/JS/CSS do bundle local (pasta `dist/`) que já está compilado dentro do binário iOS. O app funciona **offline** e carrega instantaneamente.

### Alteração

**`capacitor.config.ts`** — remover o bloco `server`:

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.mandatointeligente.app',
  appName: 'Mandato Intelligence',
  webDir: 'dist',
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

export default config;
```

### Após o commit (no Mac)
```bash
git pull
npm run build
npx cap sync ios
npx cap open ios
```

O `npm run build` gera a pasta `dist/` e o `cap sync` copia para dentro do projeto iOS. O app agora carrega localmente.

### Importante
- Cada vez que você fizer alterações no código, precisa rodar `npm run build && npx cap sync ios` para atualizar o app nativo
- O hot-reload não funciona mais (era o propósito do `server.url`), mas o app fica muito mais rápido e confiável
- O Supabase continua funcionando normalmente (as chamadas de API são feitas via rede)

