# iOS Native Backup Files

Esses arquivos devem ser copiados para `ios/App/App/` após rodar:

```bash
npx cap add ios --packagemanager cocoapods
npx cap sync ios
```

## Passo a passo

1. Copie todos os `.swift`, `.m`, `.h` e `.entitlements` para `ios/App/App/`
2. Abra `ios/App/App.xcworkspace` no Xcode (NÃO o `.xcodeproj`)
3. No Xcode, arraste os arquivos copiados para o target **App** (marque "Copy items if needed")
4. Em **Signing & Capabilities**, adicione "Sign in with Apple"
5. Verifique que o Bundle ID é `app.mandatointeligente.app`
6. O `AppDelegate.swift` gerado pelo Capacitor deve ser **substituído** pelo desta pasta

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `AppDelegate.swift` | Usa `MyViewController` em vez do padrão |
| `MyViewController.swift` | Registra o plugin `NativeAppleSignIn` |
| `NativeAppleSignInPlugin.swift` | Plugin nativo de Apple Sign In |
| `NativeAppleSignInPlugin.m` | Bridge Objective-C para o plugin |
| `App-Bridging-Header.h` | Header de bridging Swift/ObjC |
| `App.entitlements` | Entitlements com Sign in with Apple |
