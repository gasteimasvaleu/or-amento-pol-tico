

## Plano: Painel Admin para Geração de Convites em Lote

### Resumo
Criar uma página `/admin` acessível apenas por `caiorobbb@gmail.com`, com formulário para gerar convites institucionais em lote. Cada convite terá um campo de telefone para envio futuro via Z-API (WhatsApp). Link para o painel aparece na sidebar e no menu mobile.

### 1. Nova página: `src/pages/Admin.tsx`

**Funcionalidades:**
- Verificação de acesso: se `user.email !== 'caiorobbb@gmail.com'`, redireciona para `/`
- Formulário com:
  - Nome do órgão (text)
  - Duração em dias (number, default 365)
  - Quantidade de convites (number)
- Botão "Gerar Convites" que chama uma edge function `gerar-convites`
- Após geração, exibe tabela com:
  - Link do token (copiável)
  - Campo de telefone ao lado de cada token (para uso futuro com Z-API)
  - Botão copiar link individual
- Seção abaixo: lista de convites já gerados (da tabela `convites_institucionais`), mostrando token, órgão, status (usado/disponível)

### 2. Edge Function: `supabase/functions/gerar-convites/index.ts`

- Recebe `{ orgao, duracaoDias, quantidade, userEmail }`
- Valida que `userEmail === 'caiorobbb@gmail.com'`
- Usa `SUPABASE_SERVICE_ROLE_KEY` para inserir N registros na tabela `convites_institucionais`
- Retorna os tokens gerados

### 3. Navegação

**AppSidebar.tsx** — Adicionar item "Admin" com ícone `Settings` (ou `Crown`), visível apenas quando `user.email === 'caiorobbb@gmail.com'`

**BottomNav.tsx** — Adicionar link "Admin" no menu "Mais", com mesma condição de email

### 4. Rota em `App.tsx`

Adicionar rota protegida: `/admin` → `<ProtectedRoute><Admin /></ProtectedRoute>`

### 5. Configuração

- Adicionar função ao `supabase/config.toml` com `verify_jwt = false`
- Telefones ficam armazenados apenas no estado local da página por enquanto (não persistidos no banco); quando você fornecer as keys do Z-API, implementamos o envio e podemos adicionar coluna `telefone` à tabela `convites_institucionais` se necessário

### Estrutura de arquivos
- `src/pages/Admin.tsx` — nova página
- `supabase/functions/gerar-convites/index.ts` — nova edge function
- `src/App.tsx` — nova rota
- `src/components/layout/AppSidebar.tsx` — link admin
- `src/components/layout/BottomNav.tsx` — link admin
- `supabase/config.toml` — registrar função

