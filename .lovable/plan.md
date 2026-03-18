

## Alterar Build Number para 3

O build number do iOS (CFBundleVersion) pode ser controlado pelo `capacitor.config.ts`. A versão do app (CFBundleShortVersionString) fica como `1.0.0`.

### Alterações:

**1. `package.json`** — Atualizar versão para `1.0.0`:
- `"version": "0.0.0"` → `"version": "1.0.0"`

**2. `capacitor.config.ts`** — Adicionar campo `ios.buildNumber` para definir o build como `"3"`:
```ts
ios: {
  backgroundColor: '#FFFFFF',
  scheme: 'mandatointeligente',
  buildNumber: '3',
},
```

Isso garante que o Appflow gere o build com **versão 1.0.0** e **build number 3** para o App Store Connect.

