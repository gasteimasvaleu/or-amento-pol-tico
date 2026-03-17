

## Plano: Corrigir dependências (date-fns + Capacitor CLI)

Dois problemas no `package.json`:

1. **`date-fns` ainda em `^4.1.0`** — precisa ir para `^3.6.0` para resolver o conflito com `react-day-picker@8.10.1`
2. **`@capacitor/cli` ausente** — precisa ser adicionado em `devDependencies` para que `npx cap sync` funcione

### Alterações

| Arquivo | Mudança |
|---|---|
| `package.json` | `"date-fns": "^4.1.0"` → `"date-fns": "^3.6.0"` |
| `package.json` | Adicionar `"@capacitor/cli": "^8.2.0"` em `devDependencies` |

### Após o commit, rodar localmente:
```bash
git pull
rm -rf node_modules package-lock.json
npm install
npm run build
npx cap sync ios
npx cap open ios
```

