

## Plano: Corrigir Rejeições da Apple (3 Issues)

Precisa resolver 3 problemas para aprovação na App Store:

### Issue 1: Preço da assinatura não está claro (Guideline 3.1.2c)

O texto atual na tela de login é genérico ("Assinatura mensal com renovação automática...") mas **não mostra o preço real**. A Apple exige que o valor cobrado seja o elemento mais visível.

**Correção em `src/pages/Login.tsx`:**
- No botão "Assinar via App Store", exibir o preço real (ex: "Assinar — R$ 29,90/mês")
- Idealmente buscar o preço do RevenueCat dinamicamente via `getOfferings()` ao montar
- Criar estado `priceLabel` que é preenchido ao inicializar RevenueCat
- Reformular o texto informativo para incluir: **título do serviço** ("Mandato Intelligence Pro"), **duração** ("Mensal"), **preço** (dinâmico do RevenueCat), e os links já existentes de privacidade/EULA
- O preço deve ser o elemento mais proeminente (fonte maior, bold) no fluxo de compra

### Issue 2: Informações obrigatórias de assinatura incompletas (Guideline 3.1.2c)

Falta exibir claramente:
- Título da assinatura
- Duração
- Preço por período

**Correção em `src/pages/Login.tsx`:**
- Adicionar um bloco informativo visível (antes ou ao redor do botão de compra) com:
  - "**Mandato Intelligence Pro**"
  - "Assinatura Mensal — R$ XX,XX/mês" (preço dinâmico)
  - Texto de renovação automática em tamanho subordinado
  - Links de Privacidade e Termos já existentes

### Issue 3: Falta opção de excluir conta (Guideline 5.1.1v)

O app não oferece exclusão de conta.

**Correções:**
1. **Nova Edge Function `supabase/functions/delete-account/index.ts`:**
   - Recebe `userId` do header Authorization (JWT)
   - Usa `supabase.auth.admin.deleteUser(userId)` com service role
   - Deleta dados relacionados (cascade já configurado na maioria das tabelas)

2. **Adicionar opção na sidebar/menu:**
   - Na `AppSidebar.tsx`: botão "Excluir Conta" no footer, ao lado de "Sair"
   - Na `BottomNav.tsx`: item "Excluir Conta" no menu "Mais"
   - Ao clicar: AlertDialog de confirmação com texto claro ("Esta ação é irreversível...")
   - Após confirmação: chama edge function, faz signOut, redireciona para login

3. **Registrar função no `supabase/config.toml`**

### Arquivos afetados
- `src/pages/Login.tsx` — preço dinâmico e info obrigatória
- `src/lib/revenuecat.ts` — nova função `getSubscriptionPrice()`
- `supabase/functions/delete-account/index.ts` — nova edge function
- `src/components/layout/AppSidebar.tsx` — botão excluir conta
- `src/components/layout/BottomNav.tsx` — item excluir conta
- `supabase/config.toml` — registrar nova função

