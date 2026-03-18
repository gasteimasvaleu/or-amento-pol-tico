

## Configurar Ionic Appflow — Próximos Passos

Agora que o app está criado no Appflow (ID: `0ec0d586`) e os certificados foram configurados, preciso fazer dois ajustes no projeto:

### 1. Adicionar script `ionic:build` ao `package.json`
O Appflow procura o script `ionic:build` para executar o build. Vou adicionar:
```json
"ionic:build": "vite build"
```

### 2. Configurar Live Updates no `capacitor.config.ts`
Adicionar o plugin de Live Updates apontando para o App ID do Appflow (`0ec0d586`) com canal `Production` e atualização em background.

### 3. Instalar SDK de Live Updates
Instalar o pacote `@capacitor/live-updates` para habilitar atualizações OTA.

### Após a configuração no código:
1. Fazer **git pull** do projeto
2. Rodar `npm install` e `npx cap sync`
3. No **Appflow Dashboard**:
   - Configurar **Environment** com as variáveis `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
   - Iniciar o primeiro **Native Build** (iOS, branch `main`)
   - Criar um **Channel** chamado "Production" para Live Updates

### Arquivos modificados
- `package.json` — adicionar script `ionic:build`
- `capacitor.config.ts` — adicionar config `LiveUpdates`

