

## Plano: Corrigir Info.plist e Ícone do App

### Problema 1: NSPhotoLibraryUsageDescription ausente no Info.plist

O `Info.plist` não tem as chaves de privacidade para câmera/galeria. O `capacitor.config.ts` define essas strings, mas o Capacitor nem sempre as injeta no Info.plist — precisam estar explicitamente lá.

**Correção**: Adicionar ao `Info.plist`:
- `NSPhotoLibraryUsageDescription`
- `NSCameraUsageDescription`
- `NSPhotoLibraryAddUsageDescription`

### Problema 2: Ícone não aparece no TestFlight

O `Contents.json` referencia `AppIcon-1024x1024.png`, e esse arquivo **existe** na pasta. Porém, também existem arquivos extras (`AppIcon-1024@1x.png`, `AppIcon-512@2x.png`) que podem causar confusão.

Da última vez, o knowledge base menciona que o `Contents.json` deveria referenciar `AppIcon-1024@1x.png`. Há uma inconsistência: o `Contents.json` aponta para `AppIcon-1024x1024.png` mas o knowledge base diz `AppIcon-1024@1x.png`.

**Correção**: Atualizar o `Contents.json` para referenciar `AppIcon-1024@1x.png` (que é o arquivo correto de 1024x1024 pixels), ou verificar qual dos arquivos PNG é realmente 1024x1024. Vou padronizar para `AppIcon-1024@1x.png` conforme o knowledge base.

### Problema 3: buildNumber

Precisa ser incrementado para `4` já que o build `3` já foi enviado.

### Alterações

1. **`ios/App/App/Info.plist`** — Adicionar as 3 chaves de privacidade (câmera, galeria leitura, galeria escrita)
2. **`ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json`** — Alterar filename para `AppIcon-1024@1x.png`
3. **`capacitor.config.ts`** — Incrementar buildNumber para `'4'`

