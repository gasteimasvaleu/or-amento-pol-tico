

Sim, exatamente. O botão de importação é temporário — serve apenas para popular o banco. Depois que todos os estados de 2022 e 2024 estiverem importados, basta remover o card/botão de importação do `DadosEleitorais.tsx` e a função `importarCSVEleitoral` do `tseClient.ts`. As consultas continuarão funcionando normalmente via cache.

Vou implementar a ferramenta de importação agora, e quando você confirmar que todos os dados foram importados, eu removo.

## Plano: Importação temporária de CSV do TSE

### Alterações

**`src/lib/tseClient.ts`**
- Adicionar função `importarCSVEleitoral(file: File, onProgress)`:
  - Lê com `TextDecoder("iso-8859-1")`, separador `;`
  - Identifica colunas pelo header automaticamente
  - Agrega votos por candidato (chave composta: nome+partido+numero+turno+uf+cargo+ano)
  - Deleta dados existentes para mesmo `ano_eleicao + sigla_uf` antes de inserir
  - Insere em lotes de 500 via `supabase.from("dados_eleitorais_cache").insert()`

**`src/pages/DadosEleitorais.tsx`**
- Adicionar card colapsável "Importar CSV do TSE" com:
  - Input file múltiplo (`.csv`)
  - Barra de progresso (arquivo X de Y, registros processados)
  - Link para download dos CSVs no site do TSE
- Card será removido após importação completa

### Após importação concluída
- Remover card de importação e função `importarCSVEleitoral`
- Consultas continuam funcionando via cache existente

