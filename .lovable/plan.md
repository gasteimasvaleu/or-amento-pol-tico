

## Plano: Adicionar botao de remover noticias individuais

### Mudancas

**1. Hook `useNoticias.ts`**
- Adicionar mutation `deleteNoticia` que faz `DELETE` na tabela `noticias_resumos` pelo `id`
- Invalidar query `noticias_resumos` no `onSuccess`

**2. Pagina `Noticias.tsx`**
- Adicionar botao `Trash2` ao lado do link externo em cada card de noticia
- Usar `AlertDialog` para confirmar antes de deletar
- Chamar `deleteNoticia.mutate(id)` na confirmacao

Nenhuma migracao necessaria — a tabela `noticias_resumos` ja tem policy de DELETE para o usuario autenticado.

