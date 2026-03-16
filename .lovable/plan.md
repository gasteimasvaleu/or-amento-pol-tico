

## Ajustar layout das tags de categoria na página Mídia

Alterar o container das tags de categoria (linha 123-124) de scroll horizontal para `flex-wrap`, permitindo que as tags quebrem linha naturalmente sem scroll horizontal.

### Alteração em `src/pages/Midia.tsx`

- Trocar `overflow-x-auto no-scrollbar` por `flex-wrap` no container das tags
- Remover `shrink-0` dos botões para permitir quebra de linha

