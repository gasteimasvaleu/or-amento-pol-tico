

## Simplificar Dashboard - Foco no Usuário

Remover os cards de módulos e estatísticas do Dashboard, já que o acesso a essas funcionalidades existe via menu. Substituir por informações do usuário.

### Alteração em `src/pages/DashboardGeral.tsx`

- Remover os 3 cards de estatísticas (Total do Mês, Pendentes, Pagas)
- Remover o card de "Módulos"
- Remover dependência do `useDespesas` e ícones não utilizados
- Adicionar seção com informações do usuário autenticado (nome, email) usando `useAuth()`
- Layout simples: avatar/iniciais, nome completo, email, data de criação da conta
- Manter o `Layout` wrapper e título "Dashboard"

