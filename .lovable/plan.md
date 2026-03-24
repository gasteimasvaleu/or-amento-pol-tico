

## Plano: Atualizar Build Number para 5

Build atual é `4`. Precisa ir para `5` em dois arquivos:

### Arquivos a editar

1. **`capacitor.config.ts`** — linha 10: `buildNumber: '4'` → `buildNumber: '5'`
2. **`ios/App/App.xcodeproj/project.pbxproj`** — duas ocorrências de `CURRENT_PROJECT_VERSION = 4` → `CURRENT_PROJECT_VERSION = 5` (configs Debug e Release)

Após implementação, fazer `git pull` + `npx cap sync ios` antes de buildar no Xcode/Appflow.

