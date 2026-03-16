
Diagnóstico objetivo:
- O erro no front (`FunctionsFetchError: Failed to fetch`) está acontecendo porque a função está instável em runtime.
- Nos logs de gateway há chamadas `POST /consultar-dados-eleitorais` com `504` (150s) e `502`, além de `OPTIONS` com `502`.
- A tabela `dados_eleitorais_cache` está vazia, então toda consulta cai no caminho pesado (download + parse completo).
- O código atual baixa `votacao_candidato_munzona_YYYY.zip` (Brasil inteiro) e usa `unzipSync` + `split("\n")`, o que é muito caro para Edge Function.

Plano de correção:
1) Trocar fonte para arquivo por UF (bem menor)
- Arquivo: `supabase/functions/consultar-dados-eleitorais/index.ts`
- Em vez de ZIP nacional, montar URL por UF:
  - `https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_${ano}_${UF}.zip`
- Isso reduz drasticamente tempo e memória por consulta.

2) Otimizar parsing para não explodir memória
- Remover `csvContent.split("\n")`.
- Processar linha a linha (buffer incremental), agregando votos no `Map` durante a leitura.
- Manter apenas agregados finais em memória.

3) Validar combinação Ano x Cargo antes de baixar arquivo
- 2022: Presidente, Governador, Senador, Deputado Federal, Deputado Estadual.
- 2024: Prefeito, Vereador.
- Se combinação inválida, retornar 400 com mensagem clara (evita trabalho desnecessário e falhas).

4) Melhorar robustez de rede na função
- Adicionar timeout explícito no fetch ao TSE (AbortController).
- Retentativa curta (1 retry) para falha transitória.
- Respostas de erro sempre com CORS + mensagem específica (status TSE / timeout).

5) Ajustar UX no frontend
- Arquivo: `src/pages/DadosEleitorais.tsx`
- Filtrar lista de cargos conforme ano selecionado.
- Exibir mensagem do backend quando existir (não só “tente novamente”), para facilitar diagnóstico real.

Detalhes técnicos (implementação):
- `consultar-dados-eleitorais`:
  - `buildTseUrl(ano, uf)` + validações de entrada.
  - Fetch com headers browser-like + timeout.
  - Unzip do arquivo de UF e parser incremental.
  - Agregação por candidato (nome/partido/número/turno) como já existe.
  - Persistência em `dados_eleitorais_cache` em lote.
- `DadosEleitorais.tsx`:
  - `CARGOS_POR_ANO` e reset de cargo ao trocar ano se ficar inválido.
  - Tratamento de erro para mostrar `data.error`/mensagem real quando possível.

Validação após implementar:
- Testar via edge function:
  - 2022 + PB + Deputado Estadual
  - 2024 + PB + Prefeito
- Confirmar no analytics/logs que não há novos `504/502`.
- Confirmar segunda consulta com mesmo filtro vindo de `source: "cache"` (rápida).
