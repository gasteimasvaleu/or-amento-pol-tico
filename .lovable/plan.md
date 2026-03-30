

## Corrigir rota de editar despesa (erro 404)

**Problema:** O botao de editar em `DespesasTable.tsx` navega para `/editar/:id` mas a rota definida no `App.tsx` eh `/despesas/editar/:id`.

**Correcao:** Em `src/components/despesas/DespesasTable.tsx`, alterar as duas ocorrencias:

- Linha 172: `/editar/${despesa.id}` → `/despesas/editar/${despesa.id}`
- Linha 292: `/editar/${selectedDespesa.id}` → `/despesas/editar/${selectedDespesa.id}`

1 arquivo, 2 linhas.

