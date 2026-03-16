

## Plano: Cores alternadas na tabela de despesas

Adicionar zebra-striping na tabela para melhor legibilidade.

### Alterações em `src/components/despesas/DespesasTable.tsx`

- **Header (TableHeader/TableRow)**: fundo branco (`bg-white dark:bg-card`)
- **Linhas do body**: alternância via `even:bg-muted/40 odd:bg-white dark:odd:bg-card dark:even:bg-muted/20` no `TableRow`

Apenas classes Tailwind inline, sem alterar componentes base da UI.

