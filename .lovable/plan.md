

## Plano: Limpar toda a tabela dados_eleitorais_cache

### Ação

Executar um `TRUNCATE` na tabela `dados_eleitorais_cache` para remover todos os 12M+ registros de uma vez (muito mais rápido que DELETE).

### SQL para rodar no SQL Editor do Supabase

```sql
TRUNCATE dados_eleitorais_cache;
```

Depois disso, basta re-importar os CSVs pela interface normalmente.

### Prevenção de duplicatas futuras

Após a re-importação, posso adicionar um índice UNIQUE na tabela para que importações futuras não gerem duplicatas. Mas isso fica para depois — primeiro limpamos e re-importamos.

