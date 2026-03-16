

## Cards de Acesso Rápido na Home

Inspirado no estilo do screenshot (Runna/Strava), criar cards coloridos empilhados com cantos arredondados na página inicial.

### Design

- Cards coloridos (verde, azul, amarelo, vermelho) com título, badges descritivos e botão de seta (→)
- Cada card linka para uma seção do app: Dashboard, Despesas, Nova Despesa, Histórico
- Cards com leve sobreposição vertical (negative margin ou gap pequeno), estilo "stack"
- O último card fica parcialmente coberto pela bottom nav, dando sensação de profundidade
- Cantos arredondados grandes (`rounded-2xl`)

### Alterações

**1. Atualizar `src/pages/Home.tsx`**
- Adicionar saudação ao usuário no topo
- Criar array de cards com: título, descrição/badges, cor de fundo, ícone, rota de destino
- Renderizar cards empilhados com cores vibrantes (green-500, blue-500, yellow-400, red-500)
- Cada card: título em branco/bold, badges com borda, botão circular preto com seta → à direita
- Sem padding extra no final para que o último card fique "por trás" da bottom nav

