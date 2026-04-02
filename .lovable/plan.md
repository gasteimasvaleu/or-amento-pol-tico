

# Correção: Apple Sign In no iPad (Review 2.1a) + Respostas ao Review

## Problema confirmado

O build **Release** no `project.pbxproj` (linha 388-408) **não tem** `CODE_SIGN_ENTITLEMENTS`, enquanto o Debug tem `App/AppDebug.entitlements`. Isso significa que o app distribuído via TestFlight/App Store **não inclui a entitlement de Sign in with Apple**, causando `ASAuthorizationError 1000` no iPad do revisor.

## Plano de implementação

### 1. Adicionar entitlements ao build Release
**Arquivo:** `ios/App/App.xcodeproj/project.pbxproj`

Adicionar `CODE_SIGN_ENTITLEMENTS = App/App.entitlements;` no bloco Release (linha ~393, junto com as outras settings).

O arquivo `App.entitlements` já existe e contém a capability de Sign in with Apple.

### 2. Responder ao Review no App Store Connect

Além da correção de código, você precisa responder às 3 issues no App Store Connect:

**Issue 2.1(a) — Bug do Apple Sign In:**
> "We identified and fixed the root cause. The Release build configuration was missing the Sign in with Apple entitlement (CODE_SIGN_ENTITLEMENTS). This has been corrected and the new build includes the proper entitlements for both Debug and Release configurations."

**Issue 2.1(b) — In-App Purchase não encontrada:**
> "The In-App Purchase (Assinatura Mensal) is displayed after the user successfully signs in. Please use the test credentials (teste@mandatointelligence.app / teste123) to log in via the Email/Password form (not the Apple Sign In button). After login, the subscription paywall screen will appear automatically, showing the 'Assinatura Mensal' purchase option."

**Issue 2.1 — Conta com assinatura expirada:**
> Você precisa criar uma conta de teste com assinatura expirada no sandbox do RevenueCat/App Store Connect e fornecer as credenciais no App Review Information.

### 3. Passos pós-implementação

1. Git pull o projeto
2. `npx cap sync`
3. Rebuild no Xcode (Archive → Release)
4. Incrementar build number para **15**
5. Upload novo build para TestFlight
6. Resubmeter para review com as respostas acima

## Detalhe técnico

```text
project.pbxproj Release block — antes:
  ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
  CLANG_ENABLE_MODULES = YES;
  CODE_SIGN_STYLE = Automatic;
  ...

project.pbxproj Release block — depois:
  ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
  CLANG_ENABLE_MODULES = YES;
  CODE_SIGN_ENTITLEMENTS = App/App.entitlements;   ← ADICIONADO
  CODE_SIGN_STYLE = Automatic;
  ...
```

