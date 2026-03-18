

## Plano: Corrigir buildNumber no project.pbxproj

### Problema
O `capacitor.config.ts` define `buildNumber: '4'`, mas o arquivo `ios/App/App.xcodeproj/project.pbxproj` tem `CURRENT_PROJECT_VERSION = 1` em todas as build configurations. O Appflow/Xcode usa o valor do `.pbxproj`, ignorando o do Capacitor config.

### Correção
Atualizar todas as ocorrências de `CURRENT_PROJECT_VERSION = 1` para `CURRENT_PROJECT_VERSION = 4` no `project.pbxproj` (são ~10 ocorrências nas diferentes build configurations: Debug e Release, para os targets App e App-App).

### Arquivo alterado
- `ios/App/App.xcodeproj/project.pbxproj` — trocar `CURRENT_PROJECT_VERSION = 1` → `CURRENT_PROJECT_VERSION = 4` em todas as ocorrências

### Próximos deploys
Para cada novo build, será necessário incrementar esse valor **tanto** no `capacitor.config.ts` quanto no `project.pbxproj`, ou garantir que o `npx cap sync` esteja propagando corretamente.

