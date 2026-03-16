

## Padronizar modais com o estilo do modal "Adicionar Mídia"

O modal de Mídia usa `max-w-[calc(100vw-2rem)] rounded-2xl` no `DialogContent`, criando bordas arredondadas e margem lateral. Os modais base (`dialog.tsx` e `alert-dialog.tsx`) usam `sm:rounded-lg` sem margem, ficando colados nas bordas em mobile.

### Plano

Alterar os estilos **base** dos componentes `DialogContent` e `AlertDialogContent` para que **todos os modais** herdem o estilo consistente:

| Arquivo | Alteração |
|---------|-----------|
| `src/components/ui/dialog.tsx` | Trocar `w-full max-w-lg sm:rounded-lg` por `w-[calc(100vw-2rem)] max-w-lg rounded-2xl` no `DialogContent` |
| `src/components/ui/alert-dialog.tsx` | Mesma alteração no `AlertDialogContent` |

Isso garante que **todos** os modais do app (Assessores, Agenda, Despesas, Mídia) terão:
- Bordas arredondadas (`rounded-2xl`)
- Margem lateral em mobile (`calc(100vw-2rem)`)
- Overlay escuro (já existente via `bg-black/80`)

Os modais de Mídia que já passam `max-w-[calc(100vw-2rem)]` via className continuarão funcionando normalmente pois o `cn()` faz merge.

