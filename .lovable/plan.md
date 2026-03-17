

## Plano: Mover gráficos da Home para /dashboard

### 1. `src/pages/DashboardGeral.tsx`
- Importar `DashboardCharts`
- Adicionar o componente no topo da página, antes do card de avatar/perfil, com um título "Painel de Atividades"

### 2. `src/pages/Home.tsx`
- Remover a importação e uso de `DashboardCharts`

Apenas 2 arquivos alterados — mover o componente de lugar.

