# iOS Native App — Guia Completo (Capacitor)

## 1. Arquitetura Geral

O app usa **Capacitor** como bridge nativo, com:
- **CocoaPods** para gerenciamento de dependências iOS
- **Ionic Appflow** (App ID: `0ec0d586`) para CI/CD e builds nativos
- **RevenueCat** para In-App Purchases (assinatura mensal)
- **Apple Sign In nativo** via plugin Swift customizado
- **Capacitor Live Updates** para atualizações OTA sem precisar de nova versão na App Store

Stack: React + Vite + Tailwind → build para `dist/` → Capacitor embarca no app nativo.

---

## 2. Configuração do Capacitor

Arquivo: `capacitor.config.ts`

```ts
const config: CapacitorConfig = {
  appId: 'app.mandatointeligente.app',
  appName: 'Mandato Intelligence',
  webDir: 'dist',
  ios: {
    backgroundColor: '#FFFFFF',
    scheme: 'mandatointeligente',
    buildNumber: '3',  // Incrementar a cada submissão
  },
  plugins: {
    Camera: {
      NSCameraUsageDescription: '...',
      NSPhotoLibraryUsageDescription: '...',
      NSPhotoLibraryAddUsageDescription: '...',
    },
    LiveUpdates: {
      appId: '0ec0d586',
      channel: 'Production',
      autoUpdateMethod: 'background',
    },
  },
};
```

### Regras importantes:
- **Bundle ID**: `app.mandatointeligente.app` (deve coincidir com App Store Connect e Apple Developer)
- **buildNumber**: Incrementar manualmente antes de cada build no Appflow
- **NÃO** incluir `server.url` em produção (usado apenas para dev/hot-reload)

---

## 3. Apple Sign In Nativo

### Arquivos envolvidos:

| Arquivo | Local | Função |
|---------|-------|--------|
| `NativeAppleSignInPlugin.swift` | `ios/App/App/` | Plugin Swift que chama `ASAuthorizationController` |
| `NativeAppleSignInPlugin.m` | `ios/App/App/` | Bridge Objective-C (`CAP_PLUGIN`) |
| `MyViewController.swift` | `ios/App/App/` | Registra o plugin no bridge do Capacitor |
| `AppDelegate.swift` | `ios/App/App/` | Usa `MyViewController` em vez do padrão |
| `App-Bridging-Header.h` | `ios/App/App/` | Header de bridging Swift/ObjC |
| `App.entitlements` | `ios/App/App/` | Contém capability "Sign in with Apple" |
| `nativeAppleSignIn.ts` | `src/lib/` | Wrapper TypeScript que chama o plugin via `registerPlugin` |

### Como funciona:
1. TypeScript chama `NativeAppleSignIn.authorize()` via `registerPlugin`
2. O plugin Swift apresenta a tela nativa de Apple Sign In
3. Retorna `identityToken`, `authorizationCode`, `givenName`, `familyName`, `email`
4. TypeScript usa `supabase.auth.signInWithIdToken({ provider: 'apple', token: identityToken })`
5. Faz upsert no perfil com o nome retornado pela Apple

### Observações:
- Apple só retorna `givenName`/`familyName`/`email` na **primeira vez** que o usuário autoriza
- O plugin trata cancelamento (código 1001) separadamente
- Erro de cancelamento NÃO deve mostrar toast de erro ao usuário

---

## 4. Pasta `ios-native-backup/`

Contém cópias dos arquivos nativos customizados. **Devem ser restaurados** após rodar `npx cap add ios`.

### Procedimento após `npx cap add ios`:
1. Copiar todos os `.swift`, `.m`, `.h` e `.entitlements` de `ios-native-backup/` para `ios/App/App/`
2. Abrir `ios/App/App.xcworkspace` no Xcode (NÃO o `.xcodeproj`)
3. Arrastar os arquivos copiados para o target **App** (marcar "Copy items if needed")
4. Em **Signing & Capabilities**, adicionar "Sign in with Apple"
5. Verificar Bundle ID = `app.mandatointeligente.app`

### Arquivos no backup:
- `AppDelegate.swift` — Usa `MyViewController`
- `MyViewController.swift` — Registra `NativeAppleSignInPlugin`
- `NativeAppleSignInPlugin.swift` — Plugin nativo
- `NativeAppleSignInPlugin.m` — Bridge ObjC
- `App-Bridging-Header.h` — Header bridging
- `App.entitlements` — Sign in with Apple

---

## 5. RevenueCat / In-App Purchases

Arquivo: `src/lib/revenuecat.ts`

### Configuração:
- **API Key**: `appl_mdFZtyVKDhsAdhWxqrjGIdEniXP`
- **Entitlement ID**: `"Mandato Intelligence Pro"`
- **Tipo**: Assinatura mensal com renovação automática

### Fluxo:
1. `initRevenueCat()` — Configura SDK (chamado no mount da tela de login)
2. `restorePurchases()` — Verifica se já tem assinatura ativa
3. `purchaseMonthly()` — Apresenta oferta e processa compra
4. `checkSubscriptionStatus()` — Verifica entitlement ativo
5. `identifyUser(userId)` — Associa o usuário Supabase ao RevenueCat
6. `syncSubscriptionAfterLogin(userId, email)` — Sincroniza status com tabela `subscribers` no Supabase

### Webhook (Edge Function):
- `supabase/functions/revenuecat-webhook/index.ts`
- Recebe eventos do RevenueCat e atualiza tabela `subscribers`
- Campos: `user_id`, `email`, `status`, `product_id`, `original_transaction_id`, `expires_at`

### Tabela `subscribers`:
- `user_id` (FK para auth.users)
- `status`: "active" | "expired"
- `product_id`, `original_transaction_id`, `expires_at`

---

## 6. Login Flow no iOS

O fluxo na tela de login (`src/pages/Login.tsx`) segue esta ordem:

```
1. initRevenueCat() + restorePurchases() → verifica assinatura existente
2. Se não tem assinatura → botão "Assinar via App Store" habilitado
3. Usuário compra assinatura → setHasPurchased(true)
4. Botão "Continuar com Apple" fica habilitado
5. Apple Sign In → signInWithIdToken → upsert profile
6. syncSubscriptionAfterLogin() → salva status no Supabase
7. Navigate para "/"
```

### Regras Apple Review:
- Botão "Restaurar Compras" DEVE estar visível
- Texto sobre renovação automática e cobrança DEVE estar presente
- Links para Política de Privacidade e Termos de Uso (EULA da Apple) DEVEM estar visíveis
- Login com e-mail/senha também disponível (para usuários admin/web)

---

## 7. Câmera Nativa

Arquivo: `src/lib/capacitorCamera.ts`

### Funcionalidade:
- `pickImage()` — Abre câmera/galeria no nativo, file input no web
- `dataUrlToBlob()` — Converte data URL para Blob para upload

### Comportamento:
- **Nativo**: Usa `@capacitor/camera` com `CameraResultType.DataUrl`
- **Web**: Cria `<input type="file">` dinamicamente
- Suporta 3 fontes: `prompt` (usuário escolhe), `camera`, `gallery`
- Trata cancelamento silenciosamente (retorna `null`)

### Permissões (configuradas no `capacitor.config.ts`):
- `NSCameraUsageDescription`
- `NSPhotoLibraryUsageDescription`
- `NSPhotoLibraryAddUsageDescription`

---

## 8. Appflow CI/CD

### Variáveis de Ambiente no Appflow:
✅ **Obrigatórias**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

❌ **NÃO usar** (causam erros de build):
- `GYM_XCARGS` com `CODE_SIGN_STYLE=Automatic` — conflita com signing do Appflow
- `ENABLE_SPM_SUPPORT` — conflita com CocoaPods

### Troubleshooting "Exit status 65":
1. Ler o erro principal no log do Appflow
2. Procurar linhas com ❌
3. Erros comuns:
   - `"conflicting provisioning settings"` → variáveis de ambiente conflitantes (remover `GYM_XCARGS`)
   - `"did not have any applicable content"` → ícone com tamanho errado
   - `"no signing certificate"` → certificado/perfil não configurado no Appflow
   - `"duplicate symbol"` / `"redefinition"` → arquivo duplicado no projeto Xcode

### Script de build:
O Appflow executa o script `ionic:build` do `package.json`:
```json
"ionic:build": "npm run build"
```

---

## 9. App Icon (Xcode 15+)

### Requisitos:
- Ícone DEVE ser exatamente **1024x1024 pixels**
- Formato PNG, sem transparência, sem cantos arredondados
- Arquivo em: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### Contents.json (formato universal):
```json
{
  "images": [
    {
      "filename": "AppIcon-1024@1x.png",
      "idiom": "universal",
      "platform": "ios",
      "size": "1024x1024"
    }
  ],
  "info": {
    "author": "xcode",
    "version": 1
  }
}
```

### Fonte do ícone:
- `public/app-icon.png` (1024x1024) — copiar para o appiconset

---

## 10. Podfile — Hardening Recomendado

Arquivo: `ios/App/Podfile`

### Pods necessários:
- `Capacitor`, `CapacitorCordova` — Core
- `CapacitorApp` — Lifecycle
- `CapacitorCamera` — Câmera nativa
- `CapacitorHaptics` — Feedback tátil
- `CapacitorLiveUpdates` — OTA updates
- `CapacitorStatusBar` — Controle da status bar
- `RevenuecatPurchasesCapacitor` — In-App Purchases

### Hardening para code signing (adicionar no `post_install`):
```ruby
post_install do |installer|
  assertDeploymentTarget(installer)
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['CODE_SIGNING_ALLOWED'] = 'NO'
      config.build_settings['CODE_SIGNING_REQUIRED'] = 'NO'
      config.build_settings['CODE_SIGN_IDENTITY'] = ''
    end
  end
end
```

Isso evita erros de signing nos Pods durante builds no Appflow.

---

## 11. Comandos de Deploy

### Fluxo para disparar build no Appflow:
```bash
git add .
git commit -m "fix: descrição da mudança"
git pull --rebase
git push
```

O push para a branch conectada no Appflow dispara automaticamente o build.

### Antes de submeter nova versão:
1. Incrementar `buildNumber` em `capacitor.config.ts`
2. Fazer commit e push
3. Aguardar build no Appflow
4. Verificar no App Store Connect se o build apareceu
5. Submeter para review

### Após `npx cap add ios` (recriando a pasta ios):
1. Restaurar arquivos de `ios-native-backup/`
2. Atualizar `Contents.json` do AppIcon
3. Copiar ícone 1024x1024 para o appiconset
4. Aplicar hardening no Podfile
5. Rodar `npx cap sync ios`
6. Commit e push
