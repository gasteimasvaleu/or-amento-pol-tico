

## Diagnóstico

O erro de signing foi resolvido. Agora o build falha por causa do ícone do app:

```
AppIcon-512@2x.png is 512x512 but should be 1024x1024
```

O Xcode 15+ exige que o ícone universal iOS seja exatamente **1024x1024 pixels**. O arquivo atual (`AppIcon-512@2x.png`) tem apenas 512x512.

## Plano

1. **Substituir o ícone** — Gerar uma versão 1024x1024 do ícone do app a partir do `public/app-icon.png` existente e substituir o arquivo em `ios/App/App/Assets.xcassets/AppIcon.appiconset/`.

2. **Atualizar o Contents.json** — Renomear a referência do filename para o novo arquivo (ex: `AppIcon-1024@1x.png`).

3. **Commit e push** para disparar novo build no Appflow.

