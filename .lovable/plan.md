

## Diagnóstico

### Problema 1: Nome errado abaixo do ícone
O Xcode cacheia o `appName` antigo. Mesmo com o config atualizado, é preciso sincronizar novamente.

### Problema 2: Redirecionando para página do Lovable
A URL no `server.url` aponta para `https://238c6c3f-cd3d-4924-bcd9-404c97bcf042.lovableproject.com` — essa é a URL de preview, que pode estar mostrando a landing page do Lovable. O app precisa apontar para o domínio publicado correto.

Há duas opções:
- **Se você tem domínio custom configurado** (`app.mandatointeligente.app`): usar esse domínio
- **Se não tem domínio custom**: usar a URL publicada `https://politico-controle-facil.lovable.app`

---

## Plano

### Alteração em `capacitor.config.ts`

Atualizar a `server.url` para o domínio correto. Baseado na memória do projeto, o domínio custom é `app.mandatointeligente.app`:

```ts
server: {
  url: 'https://app.mandatointeligente.app?forceHideBadge=true',
  cleartext: true,
},
```

### Após o commit (no Mac):
```bash
git pull
npx cap sync ios
npx cap open ios
```

O `npx cap sync` vai:
1. Atualizar o `CFBundleDisplayName` para "Mandato Intelligence" (corrige o nome)
2. Atualizar a URL do servidor para o domínio correto (corrige o redirecionamento)

**Importante**: O app precisa estar **publicado** no Lovable para que a URL funcione no dispositivo. Certifique-se de que o projeto está publicado clicando em "Publish" no editor.

