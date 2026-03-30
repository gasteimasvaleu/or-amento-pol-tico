

## Problema: Apple Sign In bloqueado por paywall

A Apple rejeitou porque o botão "Continuar com Apple" esta **desabilitado** ate o usuario comprar a assinatura. A Apple exige que o Sign in with Apple funcione sem pre-condicoes. Gatear autenticacao atras de uma compra viola as diretrizes.

## Solucao

Inverter o fluxo: permitir o login com Apple **primeiro**, e exibir o paywall **depois** do login, antes de acessar o app.

### Arquitetura

```text
Login (Apple/Email) → Verifica assinatura → Paywall (se nao assinante) → App
```

### Alteracoes

**1. `src/pages/Login.tsx`**
- Remover a condicao `disabled={!hasPurchased && isNative}` do botao Apple Sign In
- Remover o bloco de assinatura/paywall da tela de login (preco, botao "Assinar", textos de assinatura)
- Manter apenas: botao Apple Sign In (sempre habilitado) + formulario email/senha + links obrigatorios
- Manter "Restaurar Compras" e textos legais na tela de login para compliance

**2. `src/components/layout/ProtectedRoute.tsx`** (ou novo componente `Paywall.tsx`)
- Apos login, verificar se o usuario tem assinatura ativa via RevenueCat
- Se nao tiver, exibir tela de paywall com botao de compra e restaurar compras
- Se tiver, renderizar o app normalmente
- No ambiente web (nao nativo), pular a verificacao de assinatura

**3. Novo arquivo: `src/components/paywall/PaywallScreen.tsx`**
- Mover a logica de compra (purchaseMonthly, restorePurchases, priceLabel) para este componente
- Exibir as informacoes da assinatura Pro, botao de compra, restaurar compras e textos legais
- Apos compra bem-sucedida, liberar acesso ao app

### Fluxo revisado

1. Usuario abre o app → tela de login com Apple Sign In **habilitado**
2. Faz login com Apple → autenticado no Supabase
3. ProtectedRoute verifica assinatura RevenueCat (apenas em nativo)
4. Sem assinatura → PaywallScreen
5. Com assinatura → app normal

### Build number
- `capacitor.config.ts`: `'10'` → `'11'`
- `project.pbxproj`: `CURRENT_PROJECT_VERSION` 10 → 11

3 arquivos modificados, 1 arquivo novo.

