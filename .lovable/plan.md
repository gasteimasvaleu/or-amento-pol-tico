

## Plano: Corrigir consulta de despesas recorrentes no agente WhatsApp

### Problema
A função `loadUserContext` no webhook filtra despesas por `pagamento_agendado` do mês atual. Despesas recorrentes ficam com o `pagamento_agendado` original (jan/fev), então nunca aparecem em março. O dashboard web tem lógica especial para recorrentes (mostra desde o mês de cadastro em diante), mas o webhook não replica isso.

### Correção

**Arquivo: `supabase/functions/whatsapp-webhook/index.ts`** (função `loadUserContext`, linhas ~239-249)

Substituir o filtro simples por lógica equivalente ao `useDespesas`:

- **Recorrentes**: incluir se `ultimo_pagamento <= último dia do mês atual` (aparecem todo mês a partir do cadastro)
- **Extra**: incluir apenas se `pagamento_agendado` cai no mês atual

Também incluir no contexto uma lista resumida das despesas do mês (responsável, município, valor, status pago/pendente) para que a IA possa responder com detalhes, em vez de apenas totais.

### Resultado
O agente WhatsApp verá as mesmas despesas que o dashboard web e poderá responder corretamente sobre despesas do mês.

