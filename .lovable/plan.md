# Corrigir edição de data/hora do compromisso

## O que acontece hoje

No modal de edição, a data e a hora são enviadas como texto sem fuso horário (ex: `2026-08-22T12:00:00`). O banco grava em `timestamptz` e interpreta esse texto no fuso da conexão, que não é necessariamente o do usuário. Nos registros atuais isso já aparece de forma inconsistente: alguns compromissos ficaram gravados com deslocamento de 3 horas em relação ao horário digitado, outros não.

Além disso, quando a data é alterada para outro dia, o compromisso sai da lista do dia que está selecionado no calendário — então parece que "nada mudou".

## Correções

1. **Enviar data/hora com fuso explícito**
   Montar um `Date` local a partir dos campos de data e hora e enviar em ISO com offset (`toISOString()`), tanto na criação quanto na edição. Assim o horário digitado é sempre o horário salvo e exibido.

2. **Mostrar o resultado após salvar**
   Ao salvar, mover a seleção do calendário para a data de início do compromisso editado e forçar o recarregamento da lista, para que a alteração fique visível imediatamente.

3. **Validação de fim antes do início**
   Se a data/hora de fim ficar antes da de início, avisar por toast e não salvar.

## Detalhes técnicos

- Arquivo: `src/pages/Agenda.tsx` (`handleSubmit`, `openEdit`, `openNew`).
- Criar helper local `toISO(dateStr, timeStr)` que faz `new Date(y, m-1, d, hh, mm).toISOString()`.
- Após `update`/`create`: `setSelectedDate(startDate)` e fechar o modal (o hook já invalida a query `compromissos`).
- Nenhuma mudança de banco de dados é necessária; registros antigos com deslocamento continuam como estão (podem ser reeditados manualmente).
