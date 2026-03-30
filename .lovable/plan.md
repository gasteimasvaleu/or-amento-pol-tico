

## Corrigir input de valor na nova despesa

**Problema:** O campo "Valor" inicia com `0` e ao digitar, os números ficam à direita do zero (ex: `05`, `050`), em vez de substituí-lo.

**Solução:** Alterar o valor padrão de `0` para string vazia e ajustar o onChange para tratar string vazia corretamente.

### Alteração em `src/components/despesas/DespesaForm.tsx`

1. **Linha ~56** — Mudar o defaultValue de `valor`:
   - De: `valor: 0`
   - Para: `valor: undefined` (ou remover a linha)

2. **Linha ~147-148** — Ajustar o Input do valor:
   - Mudar o `value` para exibir string vazia quando não há valor
   - Ajustar o `onChange` para tratar entrada vazia sem forçar `0`

```tsx
<Input 
  type="number" 
  step="0.01" 
  placeholder="0.00" 
  value={field.value || ''}
  onChange={(e) => {
    const val = e.target.value;
    field.onChange(val === '' ? 0 : parseFloat(val));
  }}
  onBlur={field.onBlur}
  name={field.name}
  ref={field.ref}
/>
```

1 arquivo, ~5 linhas alteradas.

