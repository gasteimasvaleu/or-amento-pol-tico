

## Atualizar Build Number para 8

Ambos os arquivos estao atualmente no build `7`. Precisa incrementar para `8` nos dois locais:

| Arquivo | Campo | Atual | Novo |
|---------|-------|-------|------|
| `capacitor.config.ts` | `buildNumber` | `'7'` | `'8'` |
| `ios/App/App.xcodeproj/project.pbxproj` | `CURRENT_PROJECT_VERSION` (Debug) | `7` | `8` |
| `ios/App/App.xcodeproj/project.pbxproj` | `CURRENT_PROJECT_VERSION` (Release) | `7` | `8` |

Apenas 2 arquivos, 3 linhas alteradas.

