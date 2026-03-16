

## Corrigir rotas de Assessores e Apoiadores para dentro de /equipe

As páginas `/assessores` e `/apoiadores` devem estar acessíveis como `/equipe/assessores` e `/equipe/apoiadores`.

### Alterações

| Arquivo | O que muda |
|---------|-----------|
| `src/App.tsx` | Trocar rotas `/assessores` → `/equipe/assessores` e `/apoiadores` → `/equipe/apoiadores` |
| `src/pages/Equipe.tsx` | Atualizar URLs nos cards para `/equipe/assessores` e `/equipe/apoiadores` |
| `src/components/layout/BottomNav.tsx` | Se houver links diretos, atualizar para as novas rotas |

Nenhuma alteração nas páginas `Assessores.tsx` e `Apoiadores.tsx` em si — apenas as rotas e links que apontam para elas.

