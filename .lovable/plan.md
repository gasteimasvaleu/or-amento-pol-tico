

## Plano: Migração iOS de SPM para CocoaPods

### O que vou fazer aqui (no Lovable)
1. **Remover** o hook `capacitor:sync:after` do `package.json`
2. **Limpar** o arquivo `scripts/ios-fix-signing.cjs` (não é mais necessário)

### O que você faz no Mac (passo a passo)

```bash
# 1. Pull as mudanças do Lovable
git pull

# 2. Remover a pasta ios atual
rm -rf ios

# 3. Recriar com CocoaPods
npx cap add ios --packagemanager cocoapods

# 4. Sincronizar
npx cap sync ios
```

### Depois: Reaplique as customizações nativas

Após o `cap add`, você precisa copiar de volta 4 arquivos nativos no Xcode (ou diretamente na pasta `ios/App/App/`):

1. **`AppDelegate.swift`** -- substituir pelo que usa `MyViewController`
2. **`MyViewController.swift`** -- copiar para `ios/App/App/`
3. **`NativeAppleSignInPlugin.swift`** -- copiar para `ios/App/App/`
4. **`NativeAppleSignInPlugin.m`** + **`App-Bridging-Header.h`** -- copiar para `ios/App/App/`
5. **`App.entitlements`** -- recriar com Sign in with Apple

Eu vou preparar **todos esses arquivos prontos** aqui no repositório para facilitar. Você só precisa:
- Abrir o projeto no Xcode
- Arrastar os arquivos para o target App
- Verificar que o Bundle ID é `app.mandatointeligente.app`
- Adicionar a capability "Sign in with Apple" no Xcode

### Appflow
- **Remover**: `ENABLE_SPM_SUPPORT`, `GYM_XCARGS`
- O build vai detectar `IOS_PACKAGE_MANAGER = cocoapods` automaticamente

### Arquivos alterados
- `package.json` -- remover hook
- `scripts/ios-fix-signing.cjs` -- deletar/limpar
- `ios/` -- será recriada pelo usuário localmente com CocoaPods

