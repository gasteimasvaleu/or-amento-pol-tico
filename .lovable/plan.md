

## Fix: Consulta de Dados Eleitorais via Download Direto do CDN do TSE

### Problema Atual

A edge function tenta usar a API CKAN `datastore_search` do TSE, que não funciona (retorna dados vazios ou timeout). A função então falha sem fallback funcional.

### Por que NÃO colocar CSVs no GitHub

Os arquivos ZIP do TSE contêm CSVs de **100-500MB** cada. O GitHub tem limite de 100MB por arquivo e repositórios pesados deixam o projeto lento. Não é viável.

### Solução: Download direto do CDN + parsing na Edge Function

Os URLs do CDN do TSE são previsíveis e estáveis:
- `https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2024.zip`
- `https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2022.zip`

A edge function vai:
1. Baixar o ZIP diretamente do CDN (URL hardcoded, sem depender do CKAN)
2. Descompactar usando a lib `fflate` (disponível no Deno)
3. Parsear o CSV linha a linha, filtrando apenas o UF e cargo solicitados
4. Agregar votos por candidato
5. Salvar no cache do Supabase

### Limitação e Mitigação

Edge functions têm timeout de ~60s. Os ZIPs são grandes. Para mitigar:
- Processar o CSV em streaming (não carregar tudo na memória)
- Se timeout ocorrer, retornar mensagem clara ao usuário
- Consultas subsequentes serão instantâneas (cache)

### Alterações

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/consultar-dados-eleitorais/index.ts` | Reescrever: usar URLs diretos do CDN, descompactar ZIP com fflate, parsear CSV filtrando por UF/cargo, remover dependência do CKAN API |

### Anos suportados

Apenas 2022 e 2024, conforme solicitado. Remover anos anteriores dos filtros no frontend (`src/pages/DadosEleitorais.tsx`).

