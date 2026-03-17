

## Plano: Corrigir App ID do Capacitor

### Alteração

| Arquivo | Campo | De | Para |
|---|---|---|---|
| `capacitor.config.ts` | `appId` | `app.lovable.238c6c3fcd3d4924bcd9404c97bcf042` | `app.mandatointeligente.app` |

### Após o commit:
```bash
git pull
npx cap add ios
npm run build
npx cap sync ios
npx cap open ios
```

