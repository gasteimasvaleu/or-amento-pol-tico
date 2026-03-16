

## Plano: Página Principal em Branco com Navbar

### Alterações

1. **Criar `src/pages/Home.tsx`** — página simples em branco usando o `Layout` (sidebar) existente, sem conteúdo além de um título placeholder.

2. **Mover Dashboard para `/dashboard`** — atualizar `App.tsx`:
   - `/` → `Home`
   - `/dashboard` → `DashboardGeral`

3. **Atualizar `AppSidebar.tsx`** — adicionar link "Início" (`/`) acima do Dashboard, e mover Dashboard para `/dashboard`.

