
## Plano de correção: “zero despesas” no agente WhatsApp

### Diagnóstico confirmado
Encontrei a causa no `loadUserContext` da função `supabase/functions/whatsapp-webhook/index.ts`:

- A query de despesas busca só: `valor, pagamento_agendado, pagamento_feito_em`.
- Mas a lógica de filtro usa também `tipo` e `ultimo_pagamento` para recorrentes.
- Como `tipo` não vem no select, ele fica `undefined`, então todas as despesas caem no ramo de “Extra” e são filtradas apenas por `pagamento_agendado` no mês atual.
- Resultado: despesas recorrentes cadastradas em jan/fev são excluídas em março e o agente responde “R$ 0,00”.

Validação de contexto:
- `notificacao_config` do número está ligado ao `user_id` correto (`5b37e6e6-...`).
- Esse `user_id` tem 39 despesas em `despesas_politicas`.
- Ou seja: o problema não é mapeamento de usuário, é filtro com campos faltando no select.

### Implementação proposta
1. **Corrigir select de despesas no webhook**
   - Arquivo: `supabase/functions/whatsapp-webhook/index.ts`
   - Em `loadUserContext`, trocar:
     - `select('valor, pagamento_agendado, pagamento_feito_em')`
   - Para incluir os campos usados no filtro e no detalhamento:
     - `select('valor, tipo, ultimo_pagamento, pagamento_agendado, pagamento_feito_em, responsavel, municipio, cargo')`

2. **Manter e garantir lógica espelhada do dashboard**
   - Recorrente: incluir quando `ultimo_pagamento <= fim do mês selecionado`.
   - Extra: incluir apenas quando `pagamento_agendado` estiver dentro do mês.

3. **Aprimorar observabilidade (log técnico curto)**
   - Adicionar log temporário em `loadUserContext` com:
     - `userId`
     - `despesas total carregadas`
     - `despesasMes após filtro`
     - `mês/ano usados`
   - Isso acelera diagnóstico se houver novo caso de “zero despesas”.

4. **Validar após ajuste**
   - Teste real: enviar “Quais as minhas despesas do mês?” (texto e áudio).
   - Conferir em logs da edge function:
     - `despesas total > 0`
     - `despesasMes > 0` para esse usuário
   - Conferir em `whatsapp_conversas` que a resposta não volta com total zerado.

### Detalhes técnicos (objetivo)
- Não envolve migração de banco nem RLS.
- O erro é exclusivamente de projeção de colunas na query da edge function.
- A correção mantém a arquitetura atual e alinha definitivamente o WhatsApp com a regra já usada no dashboard web.
