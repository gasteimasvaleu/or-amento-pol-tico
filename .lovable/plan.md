

## Plano: Corrigir Erro ao Cadastrar Despesa Extra

### Problema Identificado

Na função `useCreateDespesa` em `src/hooks/useDespesas.ts`, linha 123:

```typescript
pagamento_agendado: data.pagamento_agendado.toISOString().split('T')[0],
```

Quando o tipo é "Extra", o campo `pagamento_agendado` é `undefined` (pois foi escondido do formulário), causando o erro "Cannot read properties of undefined (reading 'toISOString')".

### Solução

Para despesas do tipo "Extra", usar a mesma data de `ultimo_pagamento` como `pagamento_agendado`, já que representa a data do pagamento único.

### Arquivo a Modificar

**`src/hooks/useDespesas.ts`**

Alterar a linha 123 de:
```typescript
pagamento_agendado: data.pagamento_agendado.toISOString().split('T')[0],
```

Para:
```typescript
pagamento_agendado: data.pagamento_agendado 
  ? data.pagamento_agendado.toISOString().split('T')[0]
  : data.ultimo_pagamento.toISOString().split('T')[0],
```

### Lógica

| Tipo | `pagamento_agendado` no form | Valor salvo no banco |
|------|------------------------------|---------------------|
| Recorrente | Preenchido pelo usuário | Valor informado |
| Extra | Não aparece (undefined) | Usa mesma data de `ultimo_pagamento` |

### Resultado Esperado

- Despesas "Extra" serão cadastradas sem erro
- O campo `pagamento_agendado` terá a mesma data da "Data do Pagamento Extra"
- Isso faz sentido semanticamente: para pagamentos únicos, a data do pagamento e a data agendada são a mesma

