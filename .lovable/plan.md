
Objetivo: destravar o build iOS no Appflow que falha em `RevenueCat_RevenueCat requires a development team` mesmo após já ter `DEVELOPMENT_TEAM` no `project.pbxproj`.

Diagnóstico (com base no código + logs):
- O `ios/App/App.xcodeproj/project.pbxproj` já tem `DEVELOPMENT_TEAM = CASJQDDA7L` em nível de projeto e target.
- O erro continua acontecendo dentro de `SourcePackages/checkouts/purchases-ios-spm/...` (target do pacote SPM, não do app).
- Isso indica problema de herança de signing no CI (Appflow/Fastlane + SPM), não falta simples no target App.

Do I know what the issue is? Sim.
- O signing está correto no app, mas o build de pacotes SPM (RevenueCat) não está recebendo a configuração de team/signing de forma consistente no Appflow.

Plano de implementação (faseado para reduzir risco):

1) Harden de signing no repositório (persistente)
- Arquivos:
  - `ios/App/App.xcodeproj/project.pbxproj`
  - `package.json`
  - `scripts/ios-fix-signing.cjs` (novo)
- Ações:
  - Garantir explicitamente em Debug/Release (project + target): `DEVELOPMENT_TEAM`, `CODE_SIGN_STYLE`.
  - Criar script de pós-sync do Capacitor para reaplicar essas chaves no `project.pbxproj` (porque Appflow executa `cap sync` em todo build e pode reescrever ajustes).
  - Registrar hook em `package.json`: `capacitor:sync:after` apontando para esse script.

2) Forçar assinatura no passo gym do Appflow (sem depender só do Xcode project)
- No Appflow Environment (dashboard), definir:
  - `ENABLE_SPM_SUPPORT=true` (manter)
  - `GYM_XCARGS=CODE_SIGN_STYLE=Manual DEVELOPMENT_TEAM=CASJQDDA7L`
- Motivo: esse override entra no `xcodebuild` da fase de build e costuma resolver erro de team em targets SPM no CI.

3) Validação
- Rodar novo build iOS no Appflow.
- Critério de sucesso: não aparecer mais `Signing for "RevenueCat_RevenueCat" requires a development team`.
- Se falhar, coletar trecho do comando `xcodebuild` e confirmar que `GYM_XCARGS` foi aplicado no job.

4) Plano B (somente se a fase 1+2 não resolver)
- Migrar iOS de SPM para CocoaPods (mais estável em Appflow para esse cenário):
  - `npx cap rm ios`
  - `npx cap add ios --packagemanager cocoapods`
- Reaplicar customizações nativas existentes (Apple Sign-In nativo e `MyViewController`).
- Remover necessidade de `ENABLE_SPM_SUPPORT`.
- Isso é fallback porque é mudança maior no projeto iOS.

Resultado esperado:
- Build iOS no Appflow concluindo archive sem erro de signing do RevenueCat.
- Manutenção das funcionalidades atuais (RevenueCat + Apple Sign In nativo) sem regressão.
