

## Diagnóstico

O app **crasha** ao tentar usar a câmera porque:

1. As permissões `NSCameraUsageDescription` e `NSPhotoLibraryUsageDescription` no `capacitor.config.ts` só são injetadas no `Info.plist` quando o plugin `@capacitor/camera` está registrado nativamente via `npx cap sync`. Porém, o código atual **não usa a API do Capacitor Camera** — usa `<input type="file" accept="image/*">` (HTML padrão).

2. No iOS nativo (WebView), quando o usuário clica no input de arquivo e escolhe "Tirar Foto", o sistema pede permissão de câmera. Se a chave `NSCameraUsageDescription` não estiver no `Info.plist`, o app **crasha imediatamente** (é um comportamento do iOS — termina o processo).

## Solução

Duas abordagens possíveis — a mais confiável para um app Capacitor é usar a **API nativa do Capacitor Camera**:

### Opção recomendada: Usar `@capacitor/camera` API

Nos pontos do código onde o usuário seleciona imagens (avatar no `DashboardGeral.tsx` e referência no `GeradorMidia.tsx`), substituir o `<input type="file">` pela API nativa:

```ts
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const photo = await Camera.getPhoto({
  resultType: CameraResultType.DataUrl,
  source: CameraSource.Prompt, // mostra opções: Câmera ou Galeria
  quality: 80,
});
```

Isso garante que:
- O Capacitor gerencia as permissões corretamente
- O plugin injeta as chaves no `Info.plist` via `cap sync`
- Funciona tanto na câmera quanto na galeria
- Fallback automático no navegador web (file picker)

### Alterações nos arquivos

1. **`src/pages/DashboardGeral.tsx`** — Substituir o `<input type="file">` e `handleAvatarUpload` por uma função que usa `Camera.getPhoto()`, convertendo o DataUrl em blob para upload ao Supabase Storage.

2. **`src/components/suporte/GeradorMidia.tsx`** — Substituir o `<input type="file">` de imagem de referência pela mesma API, usando `CameraSource.Photos` (apenas galeria) ou `CameraSource.Prompt`.

3. **Manter compatibilidade web** — Verificar se está rodando no Capacitor (`Capacitor.isNativePlatform()`) e usar file input como fallback no browser.

### Após o commit (no Mac)
```bash
git pull
npm run build
npx cap sync ios
npx cap open ios
```

O `cap sync` vai registrar o plugin Camera corretamente e injetar as permissões no `Info.plist`.

