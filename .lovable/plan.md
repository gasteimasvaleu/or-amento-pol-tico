

## Plano: Corrigir gráfico de despesas no dashboard para incluir recorrentes

### Problema
O `useDashboardStats` agrupa despesas pelo `pagamento_agendado` literal. Despesas recorrentes têm `pagamento_agendado` fixo em jan/fev, então março fica zerado. A página de Despesas (`useDespesas`) já resolve isso buscando recorrentes com `ultimo_pagamento <= fim do mês`, mas o dashboard não replica essa lógica.

### Correção

**Arquivo: `src/hooks/useDashboardStats.ts`** (query de despesas, linhas 24-45)

Substituir a query simples por lógica equivalente ao `useDespesas`:

1. Buscar todas as despesas com `select('valor, tipo, ultimo_pagamento, pagamento_agendado')`  sem filtro por data (para pegar recorrentes antigas)
2. Para cada mês dos últimos 6:
   - **Recorrente**: somar valor se `ultimo_pagamento <= último dia do mês`
   - **Extra**: somar valor se `pagamento_agendado` cai dentro do mês
3. Montar o array `byMonth` com os totais corretos

Isso alinha o gráfico do dashboard com a mesma regra usada na tela de despesas e no webhook WhatsApp.

### Resultado
O gráfico "Evolução de Despesas" mostrará corretamente o total de março (e todos os meses), incluindo despesas recorrentes.

