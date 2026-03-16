

## Conectar Cards ao Menu Inferior

O `main` tem `pb-20` (80px) que cria espaço acima da bottom nav. Os cards precisam "invadir" esse espaço para que o card vermelho (Histórico, o último/na frente) fique colado ao menu e o primeiro card (Dashboard) fique parcialmente escondido atrás do menu.

### Alterações

**`src/pages/Home.tsx`**
- Adicionar margem inferior negativa no container dos cards: `mb-[-5rem]` (equivalente a ~80px) para empurrar o stack para baixo, eliminando o gap entre o último card e a bottom nav

**`src/components/layout/Layout.tsx`**
- No `main` mobile, trocar `overflow-hidden` por `overflow-visible` para permitir que o conteúdo com margem negativa se estenda visualmente para a área da bottom nav

Resultado: o stack desce ~80px, o card vermelho (Histórico) fica colado à bottom nav, e o card verde (Dashboard) fica parcialmente atrás dela.

