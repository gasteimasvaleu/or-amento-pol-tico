

## Plano: Adicionar rota /equipe no menu "Mais" e na Sidebar

### 1. `src/components/layout/BottomNav.tsx`
- Importar ícone `Heart` (usado na página Equipe)
- Adicionar NavLink para `/equipe` com título "Equipe" no menu "Mais", entre os itens existentes (antes de Dados Eleitorais)

### 2. `src/components/layout/AppSidebar.tsx`
- Importar ícone `Heart`
- Adicionar item "Equipe" com link `/equipe` no menu lateral, posicionado logicamente junto aos outros módulos de gestão

Alterações mínimas — apenas 2 arquivos, adicionando o link de navegação que está faltando.

