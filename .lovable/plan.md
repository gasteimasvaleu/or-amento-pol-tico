

## Plano: Corrigir filtros de nome e município

### Problema 1: Filtro por nome com espaço não funciona
O banco tem `nome_candidato = "CAIO FIGUEIREDO ROBERTO"` e `nome_urna = "CAIO ROBERTO"`. A query usa `ilike("nome_candidato", "%Caio Roberto%")` que não encontra porque tem "FIGUEIREDO" no meio. Precisa buscar **também** em `nome_urna` usando `or`.

### Problema 2: Filtro de município retorna vazio
Todos os dados importados via CSV têm `nome_municipio = "Todos"`. Quando o usuário filtra por "Mogeiro", o `ilike` não encontra nada e retorna `[]` do cache. Como o cache existe para essa combinação ano/UF/cargo, nunca tenta baixar do TSE.

### Solução

**Edge Function (`supabase/functions/consultar-dados-eleitorais/index.ts`)**:

1. **Busca por nome**: Trocar o `ilike` simples por um `or` que busca em ambos os campos:
   ```
   .or(`nome_candidato.ilike.%search%,nome_urna.ilike.%search%`)
   ```

2. **Busca por município**: Quando o filtro de município é passado e o cache só tem registros com `nome_municipio = "Todos"`, deletar o cache dessa combinação e baixar novamente do TSE com dados detalhados por município (a edge function já faz isso na parte de download do TSE, que agrega por município no key).

3. **Verificação de cache com município**: Antes de retornar do cache, verificar se os registros têm município real ou "Todos". Se for "Todos" e o usuário pediu município, invalidar e re-baixar.

### Arquivos alterados
- `supabase/functions/consultar-dados-eleitorais/index.ts` (ambas as correções)

