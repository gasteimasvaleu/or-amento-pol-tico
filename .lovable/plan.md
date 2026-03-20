

## Plano: Adicionar aviso abaixo da busca

Adicionar uma linha de texto informativo entre o campo de busca e a listagem de eleitores.

### Mudança

**`src/pages/GestaoEleitores.tsx`** (após linha 83, depois do `</div>` do input de busca):
- Inserir um `<p>` com texto "Para cadastrar demanda, clique no eleitor" em estilo `text-xs text-muted-foreground` com ícone informativo opcional.

