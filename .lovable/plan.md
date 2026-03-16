

## Plano: Corrigir duplicatas e remover download do TSE

### Problema
A edge function, quando não encontra dados no cache (ou encontra só "Todos"), baixa o ZIP do TSE e insere no banco **sem limpar os dados existentes**. Como você importa tudo via CSV, isso gera duplicatas: os mesmos candidatos ficam com registros do CSV + registros do TSE.

### Solução (3 passos)

#### 1. Limpar duplicatas existentes no banco
Executar SQL para desduplicar, mantendo apenas o registro mais recente de cada combinação única (candidato + partido + número + turno + cargo + município):

```sql
DELETE FROM dados_eleitorais_cache
WHERE id NOT IN (
  SELECT DISTINCT ON (ano_eleicao, sigla_uf, cargo, nome_candidato, sigla_partido, numero_candidato, turno, nome_municipio)
    id
  FROM dados_eleitorais_cache
  ORDER BY ano_eleicao, sigla_uf, cargo, nome_candidato, sigla_partido, numero_candidato, turno, nome_municipio, created_at DESC
);
```

#### 2. Edge Function: remover lógica de download do TSE
Como os dados vêm sempre do CSV importado, a edge function deve **apenas consultar o cache**. Remover toda a seção de download do TSE (linhas 186-348) e a lógica de invalidação de cache com "Todos". A função fica simples: consulta o cache, retorna resultados ou array vazio.

#### 3. Edge Function: só consultar cache
A função final faz apenas:
- Query no cache com filtros de ano/uf/cargo
- Busca por nome com `or` em `nome_candidato` e `nome_urna`
- Busca por município com `ilike`
- Retorna resultados ordenados por votos

### Arquivos alterados
- `supabase/functions/consultar-dados-eleitorais/index.ts` — simplificar para apenas consulta ao cache
- SQL de limpeza de duplicatas existentes

