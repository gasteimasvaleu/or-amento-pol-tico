

## Página /dados-eleitorais — Consulta de Resultados do TSE

### Contexto

O TSE não possui API de consulta em tempo real. Os dados estão disponíveis como arquivos CSV/ZIP no portal CKAN (dadosabertos.tse.jus.br). A API CEPESP/FGV foi descontinuada.

A abordagem será: uma edge function que consulta a API CKAN do TSE (tentando `datastore_search` para consultas diretas, com fallback para download e parsing de CSV), com cache dos resultados em Supabase para consultas futuras.

### Banco de Dados

**Tabela `dados_eleitorais_cache`** — cache de resultados consultados:
- `id`, `ano_eleicao`, `sigla_uf`, `cargo`, `nome_candidato`, `nome_urna`, `sigla_partido`, `numero_candidato`, `situacao_eleito`, `qtd_votos`, `nome_municipio`, `turno`, `created_at`
- Sem `user_id` — dados públicos compartilhados entre todos os usuários
- RLS: SELECT para authenticated, INSERT/DELETE para service_role

### Edge Function `consultar-dados-eleitorais`

1. Recebe filtros: `ano`, `uf`, `cargo` (obrigatórios), `nome_candidato` (opcional)
2. Primeiro verifica se já existe cache no Supabase para esses filtros
3. Se não houver cache, busca os recursos do dataset `resultados-{ano}` via CKAN API
4. Faz download do CSV de "Votação nominal por município e zona", filtra por UF
5. Parseia o CSV e salva no cache
6. Retorna os resultados filtrados

### Frontend — Página `/dados-eleitorais`

**Filtros:**
- Ano da eleição (select: 2024, 2022, 2020, 2018, 2016, 2014)
- Estado/UF (select com 27 UFs)
- Cargo (select: Prefeito, Vereador, Governador, Senador, Dep. Federal, Dep. Estadual, Presidente)
- Nome do candidato (input opcional)

**Resultados:** Tabela com colunas: Candidato, Partido, Cargo, Município, Votos, Situação (Eleito/Não Eleito)

**Botão "Consultar"** que chama a edge function

### Arquivos

| Arquivo | Ação |
|---------|------|
| Migration SQL | Criar tabela `dados_eleitorais_cache` |
| `supabase/functions/consultar-dados-eleitorais/index.ts` | Edge function de consulta ao TSE |
| `supabase/config.toml` | Adicionar função |
| `src/pages/DadosEleitorais.tsx` | Página principal |
| `src/App.tsx` | Adicionar rota |
| `src/components/layout/AppSidebar.tsx` | Adicionar link |
| `src/components/layout/BottomNav.tsx` | Adicionar no menu "Mais" |

### Limitações conhecidas

- A primeira consulta para um ano/UF pode demorar (download + parsing do CSV)
- Consultas subsequentes serão instantâneas (cache)
- Arquivos CSV do TSE são grandes; a edge function pode ter timeout para UFs com muitos municípios — nesse caso, processará em lotes

