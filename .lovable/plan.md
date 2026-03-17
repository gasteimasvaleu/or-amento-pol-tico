

## Plano: Configurar Capacitor para iOS com domínio customizado

### Correções no plano anterior

- **appId**: `app.mandatointeligente.app` (formato reverse-domain) → usar `app.mandatointeligente.app` como bundle ID
- **server.url**: `https://app.mandatointeligente.app` (domínio próprio, hot-reload direto do domínio customizado)
- **appName**: `Mandato Intelligence`

### Arquivos a criar/editar

| Arquivo | Ação |
|---|---|
| `capacitor.config.ts` | **Criar** — appId: `app.mandatointeligente.app`, server.url: `https://app.mandatointeligente.app`, webDir: `dist` |
| `index.html` | **Editar** — adicionar `viewport-fit=cover`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` |
| `src/index.css` | **Editar** — garantir `env(safe-area-inset-*)` no body/layout |
| `package.json` | **Editar** — adicionar `@capacitor/core`, `@capacitor/ios`, `@capacitor/app`, `@capacitor/haptics`, `@capacitor/keyboard`, `@capacitor/status-bar` e `@capacitor/cli` (dev) |

### Nota sobre o domínio

Se o domínio `app.mandatointeligente.app` ainda não estiver conectado ao projeto, será preciso conectá-lo em **Settings → Domains** no Lovable antes de usar o hot-reload. Caso contrário, o app nativo não conseguirá carregar o conteúdo.

### Passos pós-implementação (rodar localmente)

1. Export to GitHub → git pull
2. `npm install`
3. `npx cap add ios`
4. `npx cap sync`
5. `npx cap open ios`

4 arquivos, 1 novo + 3 editados.

