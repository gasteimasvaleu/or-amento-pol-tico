

## Incrementar Build Number

### O que mudar

**Dois arquivos** precisam ser atualizados com o mesmo valor:

1. **`capacitor.config.ts`** — linha 10: `buildNumber: '5'` → `buildNumber: '6'`

2. **`ios/App/App.xcodeproj/project.pbxproj`** — todos os campos `CURRENT_PROJECT_VERSION` de `'5'` → `'6'`

### Por que os dois arquivos

O App Store Connect rejeita builds com número duplicado. O `capacitor.config.ts` é usado pelo Capacitor e o `project.pbxproj` é o que o Xcode/Appflow realmente lê para assinar o build. Ambos devem estar sincronizados.

### Após a alteração

Fazer commit e push para disparar o build no Appflow:
```bash
git add capacitor.config.ts ios/App/App.xcodeproj/project.pbxproj
git commit -m "chore: bump build number to 6"
git push
```

