

## Plano: Corrigir importação de CSV grande

### Problema
O arquivo `votacao_candidato_munzona_2022_BRASIL.csv` é muito grande (provavelmente 500MB+). O `file.arrayBuffer()` tenta carregar tudo na memória de uma vez, causando `NotReadableError` no navegador.

### Solução
Trocar a leitura completa (`file.arrayBuffer()`) por **streaming com `FileReader` + leitura em chunks** ou usar a **Streams API** (`file.stream()`), processando o CSV linha a linha sem carregar tudo na memória.

### Alterações em `src/lib/tseClient.ts`

Na função `importarCSVEleitoral`:

1. **Substituir** `file.arrayBuffer()` por `file.stream().getReader()` (ReadableStream API)
2. **Processar em chunks**: ler pedaços do arquivo, decodificar com `TextDecoder` incremental (encoding `iso-8859-1`), e acumular linhas parciais
3. **Parsear linha a linha** conforme chunks chegam, mantendo a lógica de agregação existente
4. **Atualizar progresso** baseado em bytes lidos vs `file.size`

### Estrutura do streaming

```text
file.stream().getReader()
  → read() chunks (Uint8Array)
  → TextDecoder.decode(chunk, {stream: true})
  → acumular buffer de texto
  → extrair linhas completas (split \n)
  → parsear cada linha com parseCSVLine()
  → agregar no voteMap
  → repetir até done
```

### Resultado
- Arquivos de qualquer tamanho funcionam sem estouro de memória
- Progresso mais granular (baseado em bytes lidos)
- Lógica de agregação e inserção no Supabase permanece inalterada

