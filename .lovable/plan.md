

## Plano: Transformar em Unale - Gestão Parlamentar

### Visao Geral

Reestruturar o app atual em uma plataforma completa de Gestao Parlamentar com autenticacao, sidebar de navegacao e a pagina de despesas como um modulo dentro do app. A pagina inicial sera um Dashboard geral.

### Estrutura de Paginas

```text
/login          -> Tela de login/cadastro
/               -> Dashboard geral (nova pagina inicial)
/despesas       -> Dashboard de despesas (atual Index)
/despesas/nova  -> Nova despesa
/despesas/editar/:id -> Editar despesa
/despesas/historico  -> Historico de despesas
```

### Alteracoes

**1. Banco de Dados - Profiles + User Roles**

- Criar tabela `profiles` (id, full_name, avatar_url) com trigger auto-create no signup
- Criar tabela `user_roles` com enum (admin, user) conforme padrao de seguranca
- Adicionar `user_id` na tabela `despesas_politicas` (nullable inicialmente para dados existentes)
- Atualizar RLS de `despesas_politicas` para exigir autenticacao

**2. Autenticacao**

- Criar pagina `/login` com email/senha via Supabase Auth
- Criar pagina `/reset-password`
- Criar componente `ProtectedRoute` que redireciona para /login
- Criar `AuthProvider` com contexto de sessao

**3. Layout - Sidebar**

- Substituir Header atual por sidebar lateral usando componente `sidebar.tsx` (ja existe)
- Itens: Dashboard, Despesas (com sub-itens), e futuros modulos
- Header superior com nome do usuario e logout
- Mobile: sidebar colapsavel

**4. Branding**

- Renomear para "Unale - Gestao Parlamentar" no title, header e sidebar
- Atualizar meta tags no index.html

**5. Dashboard Geral (nova pagina /)**

- Cards resumo: total despesas do mes, despesas pendentes, proximos vencimentos
- Links rapidos para os modulos
- Visao consolidada dos dados

**6. Rotas**

- `src/App.tsx`: reorganizar rotas com ProtectedRoute
- Mover dashboard de despesas de `/` para `/despesas`
- Criar novo `Index.tsx` como dashboard geral

### Arquivos Novos

- `src/pages/Login.tsx`
- `src/pages/ResetPassword.tsx`
- `src/pages/DashboardGeral.tsx`
- `src/components/layout/AppSidebar.tsx`
- `src/components/layout/ProtectedRoute.tsx`
- `src/contexts/AuthContext.tsx`
- Migration SQL para profiles, user_roles, e auth trigger

### Arquivos Modificados

- `src/App.tsx` - novas rotas + AuthProvider
- `src/components/layout/Layout.tsx` - sidebar em vez de header
- `src/pages/Index.tsx` -> renomear para `Despesas.tsx` e mover para `/despesas`
- `src/pages/NovaDespesa.tsx` - ajustar navegacao para `/despesas`
- `src/pages/EditarDespesa.tsx` - ajustar navegacao
- `src/pages/Historico.tsx` - ajustar navegacao
- `index.html` - titulo e meta tags

### Ordem de Implementacao

1. Migration SQL (profiles, user_roles, trigger)
2. Auth (login, contexto, rotas protegidas)
3. Layout com sidebar
4. Dashboard geral
5. Reorganizar rotas de despesas

