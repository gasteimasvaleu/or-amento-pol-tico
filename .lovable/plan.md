

## Plano: Refatorar para fluxo App Store + Sign in with Apple (igual ao outro app)

### Resumo da mudanca
Remover a paywall separada e o link "Criar nova conta". A tela de login passa a ter: botao "App Store" (comprar assinatura), botao "Continuar com Apple" (desabilitado ate assinar), formulario email/senha, botao "Restaurar Compras", e links obrigatorios Apple.

### Arquivos a criar

**1. `src/lib/nativeAppleSignIn.ts`** — Plugin Capacitor para Sign in with Apple nativo
- `registerPlugin('NativeAppleSignIn')` com metodo `authorize()`
- Retorna `identityToken`, `authorizationCode`, `givenName`, `familyName`, `email`
- Instrucoes para criar os arquivos Swift no Xcode (NativeAppleSignInPlugin.swift, bridge .m, MyViewController.swift)

**2. `src/lib/revenuecat.ts`** — Reescrever unificando revenueCat.ts + revenueCatNative.ts
- `isNativePlatform()`, `getPlatform()`
- `initRevenueCat()` — configure sem appUserID (anonimo ate login)
- `identifyUser(userId)` — `Purchases.logIn()`
- `logOutRevenueCat()` — `Purchases.logOut()`
- `purchaseMonthly()` — busca offerings, compra pacote, retorna `{ success, expiresAt?, error? }`
- `checkSubscriptionStatus()` — verifica entitlements.active
- `restorePurchases()` — obrigatorio Apple Guidelines
- `syncSubscriptionAfterLogin(userId, email)` — verifica status, faz upsert na tabela `subscribers`
- Tudo com `import()` dinamico para nao quebrar na web

**3. `supabase/functions/revenuecat-webhook/index.ts`** — Edge Function webhook
- Recebe eventos do RevenueCat (INITIAL_PURCHASE, RENEWAL, CANCELLATION, EXPIRATION)
- Mapeia para status na tabela `subscribers`
- Resolve user_id do app_user_id (ignora $RCAnonymousID)
- Upsert na tabela `subscribers`

### Arquivos a modificar

**4. `src/pages/Login.tsx`** — Refatorar completamente
- Remover link "Criar nova conta"
- Adicionar estado `hasPurchased` (inicia false)
- No mount, se nativo: `initRevenueCat()` + `restorePurchases()` silencioso → se ativo, `hasPurchased = true`
- Botao " App Store" → chama `purchaseMonthly()`, no sucesso seta `hasPurchased = true`
- Botao " Continuar com Apple" → disabled se `!hasPurchased`; ao clicar: `nativeAppleSignIn()` → `signInWithIdToken({ provider: 'apple', token })`. Na web: fallback `signInWithOAuth({ provider: 'apple' })`
- Divisor "ou" + formulario email/senha (sempre visivel)
- Botao "Restaurar Compras"
- Links "Termos de Uso" e "Politica de Privacidade"
- Info de assinatura (nome do plano, duracao, renovacao automatica) — Apple Guideline

**5. `src/contexts/AuthContext.tsx`** — Integrar RevenueCat
- `onAuthStateChange`: no SIGNED_OUT chamar `logOutRevenueCat()`; no login chamar `identifyUser(userId)` + `syncSubscriptionAfterLogin(userId, email)`
- `signOut()`: chamar `logOutRevenueCat()` antes de `supabase.auth.signOut()`

**6. `src/components/layout/ProtectedRoute.tsx`** — Simplificar
- Remover checagem de subscription/paywall
- Apenas verificar autenticacao (session). Se nao logado → `/login`
- Remover import do SubscriptionContext

**7. `src/App.tsx`** — Limpar
- Remover rota `/paywall` e import do Paywall
- Remover `SubscriptionProvider` (nao e mais necessario, controle fica no login)
- Manter rota `/cadastro` (escondida, sem link)
- Adicionar `initRevenueCat()` no carregamento do app

**8. `capacitor.config.ts`** — Adicionar registro do plugin
- Adicionar `NativeAppleSignInPlugin` no `plugins` ou `packageClassList`

### Arquivos a deletar
- `src/pages/Paywall.tsx`
- `src/lib/revenueCat.ts` (substituido por revenuecat.ts)
- `src/lib/revenueCatNative.ts` (unificado)
- `src/contexts/SubscriptionContext.tsx` (nao mais necessario)

### Migracao de banco — Tabela `subscribers`
```sql
CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  status text NOT NULL DEFAULT 'expired',
  product_id text,
  expires_at timestamptz,
  original_transaction_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscribers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
  ON public.subscribers FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

### Config TOML — Adicionar webhook
```toml
[functions.revenuecat-webhook]
verify_jwt = false
```

### Fluxo final
1. Abrir app → tela de login
2. "Continuar com Apple" desabilitado
3. Toca " App Store" → compra via RevenueCat nativo
4. Sucesso → "Continuar com Apple" habilitado
5. Toca → Sign in with Apple nativo → `signInWithIdToken` no Supabase
6. AuthContext detecta login → `identifyUser` + `syncSubscriptionAfterLogin`
7. Webhook RevenueCat atualiza tabela `subscribers`
8. Usuario acessa o app normalmente

### Instrucoes para o usuario apos implementacao
- No Xcode: criar os 3 arquivos Swift, ativar capability "Sign in with Apple"
- No Supabase Dashboard: ativar provider Apple em Authentication → Providers
- No RevenueCat Dashboard: configurar webhook URL apontando para a edge function

