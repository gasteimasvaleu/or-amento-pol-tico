

## Plano: Implementar RevenueCat com Paywall e Controle de Assinatura

A API Key pública `appl_mdFZtyVKDhsAdhWxqrjGIdEniXP` será armazenada diretamente no código (é uma chave pública/publishable).

Como o RevenueCat SDK nativo requer iOS/Android, e o app roda como web via Capacitor, a abordagem será usar a **REST API do RevenueCat** no frontend para verificar assinaturas, combinada com uma **página de paywall** que redireciona para a compra nativa quando em Capacitor ou mostra informações quando na web.

### Arquivos a criar/modificar

**1. `src/lib/revenueCat.ts`** — Cliente RevenueCat via REST API
- Funções para verificar status de assinatura do usuário (`getSubscriberInfo`)
- Usar o `user_id` do Supabase Auth como app_user_id no RevenueCat
- API Key pública no header

**2. `src/contexts/SubscriptionContext.tsx`** — Contexto de assinatura
- Provider que verifica se o usuário tem o entitlement `premium` ativo
- Expõe `isPremium`, `loading`, `checkSubscription()`
- Consulta RevenueCat ao montar e quando o user muda

**3. `src/pages/Paywall.tsx`** — Página de paywall
- Design atrativo com benefícios do plano premium
- Botão de assinar que usa o Capacitor plugin ou mostra instruções
- Integração com `@revenuecat/purchases-capacitor` para compra nativa

**4. `src/components/layout/ProtectedRoute.tsx`** — Modificar
- Após verificar autenticação, verificar assinatura
- Se não for premium, redirecionar para `/paywall`
- Permitir acesso livre a rotas específicas (login, cadastro, paywall)

**5. `src/App.tsx`** — Modificar
- Adicionar `SubscriptionProvider` envolvendo as rotas
- Adicionar rota `/paywall`

**6. Instalar dependência**: `@revenuecat/purchases-capacitor` para compras nativas no iOS

### Fluxo
1. Usuário faz login → AuthContext carrega sessão
2. SubscriptionContext consulta RevenueCat REST API com `user_id`
3. Se tem entitlement `premium` → acesso liberado
4. Se não tem → redireciona para Paywall
5. No Paywall, botão "Assinar" inicia compra via Capacitor plugin nativo
6. Após compra, re-verifica status e libera acesso

### Detalhes técnicos
- REST API endpoint: `https://api.revenuecat.com/v1/subscribers/{app_user_id}`
- Header: `Authorization: Bearer appl_mdFZtyVKDhsAdhWxqrjGIdEniXP`
- O entitlement a verificar: o identifier que você criou ("Mandato Intelligence Pro" ou similar)
- No ambiente web (preview), a compra nativa não funciona — mostrará uma mensagem informativa
- No Capacitor iOS nativo, usará o SDK para apresentar o produto e processar a compra

