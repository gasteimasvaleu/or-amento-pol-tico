

## Plano: 4 melhorias aprovadas

### 1. Relatório PDF das despesas

**Arquivo: `src/pages/Despesas.tsx`**
- Adicionar botão "Gerar PDF" ao lado do botão "Nova Despesa"
- Usar `jspdf` + `jspdf-autotable` para gerar o PDF no client-side
- O PDF incluirá: cabeçalho com mês/ano, tabela com todas as despesas do mês filtrado, totais, e rodapé com data de geração
- Instalar dependência: `jspdf` e `jspdf-autotable`

**Novo arquivo: `src/lib/exportPDF.ts`**
- Função `exportDespesasToPDF(despesas, month, year)` que gera o PDF com:
  - Título: "Relatório de Despesas - Mês/Ano"
  - Tabela: Município, Responsável, Cargo, Tipo, Valor, Status Pagamento
  - Rodapé: Total geral e data de geração

### 2. Política de Privacidade pública

**Arquivo: `src/App.tsx`**
- Mover a rota `/politica-de-privacidade` para fora do `ProtectedRoute`, tornando-a acessível sem login

### 3. Pull-to-refresh nas listagens

**Arquivos: `src/pages/Despesas.tsx`, `src/pages/GestaoEleitores.tsx`, `src/pages/Agenda.tsx`, `src/pages/Apoiadores.tsx`, `src/pages/Assessores.tsx`, `src/pages/Lembretes.tsx`**
- Implementar pull-to-refresh usando evento de touch (touchstart/touchmove/touchend)
- Criar hook reutilizável `src/hooks/usePullToRefresh.ts` que:
  - Detecta gesto de puxar para baixo quando no topo da página
  - Mostra indicador de loading (spinner)
  - Chama `queryClient.invalidateQueries()` para recarregar dados
  - Retorna ref para o container e estado de refreshing
- Integrar o hook em cada página de listagem

### 4. Corrigir hooks em loop no Histórico

**Sobre o bug:** No React, hooks (como `useDespesas`) precisam ser chamados sempre na mesma ordem e quantidade. No `Historico.tsx`, o hook é chamado dentro de um `.map()` — ou seja, 12 vezes em loop. Se o número mudar, o React quebra. Funciona "por sorte" porque são sempre 12, mas é uma violação das regras e pode causar bugs difíceis de debugar.

**Arquivo: `src/pages/Historico.tsx`**
- Substituir as 12 chamadas de `useDespesas` em loop por uma única query que busca todas as despesas do ano selecionado (sem filtro de mês)
- Agrupar os resultados por mês no client-side usando `reduce()`
- Resultado: 1 query ao invés de 12, código correto e mais performático

