

## Plano: Criar Knowledge Base Completa — App Nativo iOS com Capacitor

Vou criar o arquivo `.lovable/knowledge/ios-native-app.md` documentando **todo o processo** de implementação do app nativo, desde a configuração inicial até o deploy no App Store Connect.

### Conteúdo do arquivo

O documento cobrirá estas seções:

1. **Arquitetura Geral** — Capacitor + CocoaPods + Appflow + RevenueCat + Apple Sign In
2. **Configuração do Capacitor** — `capacitor.config.ts` com Bundle ID, build number, Live Updates, permissões de câmera
3. **Apple Sign In Nativo** — Plugin Swift customizado (`NativeAppleSignIn`) com bridge ObjC, `MyViewController`, `AppDelegate` customizado, entitlements
4. **Pasta `ios-native-backup/`** — Arquivos que devem ser restaurados após `npx cap add ios`
5. **RevenueCat / In-App Purchases** — Fluxo de compra antes do login, sincronização com Supabase via webhook, entitlement ID
6. **Login Flow no iOS** — Comprar assinatura → Apple Sign In → `signInWithIdToken` → upsert profile → sync RevenueCat
7. **Câmera Nativa** — `capacitorCamera.ts` com fallback web
8. **Appflow CI/CD** — Variáveis de ambiente obrigatórias e proibidas, troubleshooting de Exit 65
9. **App Icon** — Requisito de 1024x1024 para Xcode 15+
10. **Podfile** — Hardening recomendado para code signing dos Pods
11. **Comandos de Deploy** — Fluxo git para disparar builds no Appflow

### Implementação

Criar **um único arquivo**: `.lovable/knowledge/ios-native-app.md`

