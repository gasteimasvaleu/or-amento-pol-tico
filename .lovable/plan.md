

## Plano: Calendário ocupar toda a largura no mobile

### Problema
As células do calendário têm tamanho fixo (`w-9 h-9` = 36px), totalizando ~252px para 7 colunas. No mobile (390px), sobra espaço à direita.

### Solução
Alterar `calendar.tsx` para que as células e cabeçalhos usem `flex-1` em vez de `w-9` fixo, distribuindo igualmente a largura disponível.

### Alterações em `src/components/ui/calendar.tsx`
- `head_row`: adicionar `w-full` (já tem no row)
- `head_cell`: trocar `w-9` por `flex-1`
- `cell`: trocar `w-9` por `flex-1`, manter `h-9`
- `day`: trocar `w-9` por `w-full`, manter `h-9`

Isso faz o calendário preencher 100% da largura do container.

