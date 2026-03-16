

## Plano: Restaurar Status de Pagamento

### Situacao Atual

Nenhuma despesa foi excluida! Elas apenas tiveram o campo `pagamento_feito_em` limpo para `null`, fazendo com que aparecam como "Pendente" em vez de "Pago".

### Acao: Restaurar `pagamento_feito_em` para as despesas afetadas

Vou executar um UPDATE no banco para restaurar o campo `pagamento_feito_em = '2026-02-09'` nas despesas que foram desmarcadas:

| Municipio | Responsavel | ID |
|-----------|-------------|-----|
| Aroeira | Itamar | 5594343a... |
| Juazeirinho | Bevilacqua | 2bbaa610... |
| Bonito de Santa Fe | Sabino | 201560a9... |
| Sume | Ze Mario | 2cec5382... |
| Joao Pessoa | Jailson | 990001de... |
| Sousa | Vitor | 51e0080c... |

### Comando SQL

```sql
UPDATE despesas_politicas 
SET pagamento_feito_em = '2026-02-09'
WHERE id IN (
  '5594343a-a10e-4ea2-bb33-8bc5398ddc40',
  '2bbaa610-e38e-44e0-9817-356253ef77ed',
  '201560a9-aa52-4772-93a0-80f842e2a4d0',
  '2cec5382-26af-4b57-aecc-658593567fe7',
  '990001de-61c5-452b-b237-039e479e74a0',
  '51e0080c-af8e-439e-9c06-e8f7284c71d7'
);
```

Apos executar o UPDATE, basta recarregar a pagina e todas voltarao a aparecer como "Pago".

### Resultado

Todas as 6 despesas voltarao ao status "Pago" com data 09/02/2026, exatamente como estavam antes.

