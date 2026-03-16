
Diagnóstico rápido
- O erro atual não está no Supabase nem no cache: o `SELECT` em `dados_eleitorais_cache` retorna `200` com `[]`.
- A falha acontece no passo seguinte: o navegador tenta baixar `https://cdn.tse.jus.br/...zip` direto do frontend (`src/lib/tseClient.ts`, linha do `fetch`) e cai em `TypeError: Failed to fetch`.
- Isso indica bloqueio de acesso direto no cliente (CORS/rede/política do CDN), então essa etapa precisa sair do browser.

Plano de correção
1) Tirar download do TSE do frontend
- Refatorar `src/lib/tseClient.ts` para não fazer mais `fetch` direto no CDN.
- Passar a chamar apenas `supabase.functions.invoke("consultar-dados-eleitorais", ...)`.
- Manter no cliente só:
  - envio dos filtros (ano/uf/cargo/nome),
  - leitura da resposta (`data`, `source`, `error`),
  - mensagens de progresso/erro.

2) Centralizar toda a coleta no Edge Function
- Ajustar `supabase/functions/consultar-dados-eleitorais/index.ts` como única origem para:
  - validar `ano x cargo`,
  - consultar cache,
  - baixar/processar TSE,
  - salvar cache,
  - retornar erro detalhado com CORS em todas as respostas.
- Melhorar robustez do fetch com timeout + retry (já existe base, manter/fortalecer).

3) Reduzir chance de timeout no backend
- Trocar fonte pesada por arquivo menor por UF (quando disponível), com fallback controlado.
- Evitar processamento desnecessário: filtrar cedo por UF/cargo durante parsing.
- Retornar erro explícito quando TSE estiver indisponível (em vez de erro genérico).

4) Melhorar feedback na UI
- Em `src/pages/DadosEleitorais.tsx`, exibir mensagem retornada pelo backend (`error`) em vez de só “Falha ao consultar...”.
- Manter filtro de cargos por ano e estado atual do loading/progresso.

Arquivos que serão alterados
- `src/lib/tseClient.ts` (refactor para usar Edge Function)
- `supabase/functions/consultar-dados-eleitorais/index.ts` (robustez + performance + mensagens)
- `src/pages/DadosEleitorais.tsx` (tratamento de erro mais claro)

Validação após implementar
- Teste 1: 2022 / PB / Governador → deve chamar Edge Function (sem request direto ao `cdn.tse.jus.br` no browser).
- Teste 2: repetir mesma consulta → resposta rápida com `source: "cache"`.
- Teste 3: combinação inválida de ano/cargo → erro 400 amigável.
- Teste 4: confirmar logs da função sem 502/504 para consultas comuns.
