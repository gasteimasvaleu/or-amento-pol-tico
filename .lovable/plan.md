

## Plano: Permitir Desfazer Status de Pagamento

### Problema
Atualmente, ao marcar uma despesa como "Pago", o botão desaparece e nao ha como reverter o erro.

### Solucao

**1. Criar hook `useUnmarkAsPaid` em `src/hooks/useDespesas.ts`**

Nova mutation que limpa o campo `pagamento_feito_em` (seta como `null`):

```typescript
export function useUnmarkAsPaid() {
  // update pagamento_feito_em = null
}
```

**2. Alterar botao na tabela (`DespesasTable.tsx`)**

Em vez de esconder o botao quando o status e "Pago", sempre mostrar um botao de toggle:

| Status | Botao | Acao |
|--------|-------|------|
| Aguardando / Pendente | CheckCircle2 (verde) | Marcar como pago |
| Pago | XCircle (vermelho) | Desfazer pagamento |

O botao "Desfazer" tera um `AlertDialog` de confirmacao para evitar cliques acidentais.

### Arquivos a Modificar

1. **`src/hooks/useDespesas.ts`** - Adicionar `useUnmarkAsPaid` mutation
2. **`src/components/despesas/DespesasTable.tsx`** - Trocar logica do botao para toggle com confirmacao

