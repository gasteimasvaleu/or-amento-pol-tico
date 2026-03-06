

## Plano: Corrigir Logica de Pagamento + Restaurar Dados

### Entendimento

Correto. O mes visualizado na dashboard e a referencia. Se voce esta vendo fevereiro e clica "pago", o pagamento e registrado PARA fevereiro, independente de quando voce clicou.

### Problema Atual

O `useMarkAsPaid` faz duas coisas erradas:
1. Seta `pagamento_feito_em = hoje` (data real) em vez de uma data dentro do mes visualizado
2. Atualiza `ultimo_pagamento = hoje`, fazendo a despesa sair do filtro do mes

### Dados a Corrigir

21 despesas tiveram `ultimo_pagamento` movido para marco (03-05 ou 03-06). Todas precisam ter `ultimo_pagamento` restaurado para `pagamento_agendado` (data original) e `pagamento_feito_em` ajustado para uma data dentro de fevereiro.

Alem disso, 2 despesas (Bevilacqua e Tarcisim) tiveram `pagamento_feito_em` limpo para null - precisam ser verificadas se devem voltar como pagas em fevereiro ou nao.

### Alteracoes

**1. SQL - Restaurar dados (via insert tool)**

```sql
-- Restaurar ultimo_pagamento e pagamento_feito_em para fevereiro
UPDATE despesas_politicas 
SET ultimo_pagamento = pagamento_agendado,
    pagamento_feito_em = '2026-02-28'
WHERE ultimo_pagamento >= '2026-03-01'
  AND pagamento_feito_em IS NOT NULL;

-- Restaurar ultimo_pagamento das que foram desmarcadas  
UPDATE despesas_politicas 
SET ultimo_pagamento = pagamento_agendado
WHERE id = 'fc11e20d-5aab-49e6-82ae-903aced7285e'; -- Caiçara/Tarcisim
```

**2. `src/hooks/useDespesas.ts`**

- `useMarkAsPaid`: receber `{ id, month, year }`. Setar `pagamento_feito_em` como ultimo dia do mes selecionado. NAO alterar `ultimo_pagamento`.
- `useUnmarkAsPaid`: ja esta correto (so limpa `pagamento_feito_em`).

**3. `src/components/despesas/DespesasTable.tsx`**

- Passar `selectedMonth` e `selectedYear` ao chamar `markAsPaid.mutate()`

### Pergunta

Preciso confirmar: Bevilacqua (Juazeirinho) e Tarcisim (Caicara) estavam pagos em fevereiro? Devo restaura-los como pagos tambem?

