-- Restaurar ultimo_pagamento e pagamento_feito_em para fevereiro
-- Para todas as despesas que tiveram ultimo_pagamento movido para março e tinham pagamento
UPDATE despesas_politicas 
SET ultimo_pagamento = pagamento_agendado,
    pagamento_feito_em = '2026-02-28'
WHERE ultimo_pagamento >= '2026-03-01'
  AND pagamento_feito_em IS NOT NULL;

-- Restaurar ultimo_pagamento para Tarcisim (Caiçara) que teve pagamento desmarcado
UPDATE despesas_politicas 
SET ultimo_pagamento = pagamento_agendado
WHERE id = 'fc11e20d-5aab-49e6-82ae-903aced7285e';