

## Posicionar Cards na Parte Inferior

O problema atual: os cards usam `mt-auto` mas o `main` do Layout tem `pb-[calc(4rem+env(safe-area-inset-bottom))]` que os mantém acima da bottom nav. Precisamos que os cards fiquem ancorados ao fundo da tela, com o último card parcialmente escondido atrás da bottom nav.

### Alterações

**1. `src/pages/Home.tsx`**
- Inverter a ordem visual: reverter o array para renderizar de baixo para cima
- Usar `bottom` em vez de `top` no posicionamento absoluto dos cards
- Adicionar margem negativa inferior no container para que os cards "invadam" a área da bottom nav

**2. `src/components/layout/Layout.tsx`**
- Na versão mobile, remover o `pb-[calc(4rem+env(safe-area-inset-bottom))]` do `main` quando o conteúdo precisa se estender até o fundo — ou deixar o Home controlar isso com margem negativa

### Abordagem
- O container dos cards terá `position: absolute; bottom: 0; left: 0; right: 0` dentro de um wrapper flex-1
- Cada card posicionado com `bottom` incremental (card 0 = mais embaixo/atrás da nav, card 3 = mais acima/na frente)
- Adicionar `mb-[-4rem]` ou similar no container para empurrar os cards para trás da bottom nav

