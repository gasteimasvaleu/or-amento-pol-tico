

## Alinhar conteúdo dos cards ao topo

Os cards usam `items-center` no flex, o que centraliza verticalmente o conteúdo. Como os cards ficam parcialmente cobertos pelos cards da frente, o conteúdo centralizado acaba cortado.

### Alteração em `src/pages/Home.tsx` (linha 60)

Trocar `items-center` por `items-start` no className do button, para que tanto o texto/badges quanto o botão de seta fiquem alinhados ao topo de cada card. O `p-5` já garante o espaçamento adequado.

