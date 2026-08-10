# Agenda: calendário em largura total no desktop

O código atual de `src/pages/Agenda.tsx` já empilha calendário e lista (um `flex flex-col`), mas o print mostra o calendário estreito à esquerda e os compromissos à direita — ou seja, o que está renderizado no preview não corresponde ao código atual. Antes de mudar layout, o primeiro passo é confirmar o que a página realmente renderiza.

## Passos

1. Verificação: abrir `/agenda` no navegador em largura de desktop e medir a largura real do card do calendário e a posição da lista de compromissos. Se a página renderizada já estiver empilhada e em largura total, o problema é cache/HMR no preview e basta recarregar (hard reload) — sem mudança de código.
2. Se o calendário realmente estiver estreito/comprimido, endurecer as classes do calendário em `Agenda.tsx` para que ele ocupe 100% da largura, independentemente dos padrões do componente base:
   - forçar `w-full` na raiz do DayPicker, em `months`, `month`, `table`, `head_row` e `row` (os padrões do `components/ui/calendar.tsx` usam `flex flex-col sm:flex-row`, que podem impedir o preenchimento horizontal);
   - manter as células com altura crescente por breakpoint (`h-10 sm:h-12 lg:h-14`) para os dias não ficarem achatados quando esticados.
3. Garantir que a seção "compromissos do dia" continue logo abaixo do calendário, em largura total (nenhum grid de duas colunas).
4. Revalidar no navegador em ~1090px e ~1440px de largura, comparando com o print.

## Detalhes técnicos

- Arquivo único afetado: `src/pages/Agenda.tsx` (apenas classes de layout/apresentação).
- `src/components/ui/calendar.tsx` não será alterado, para não afetar os outros calendários do app; os ajustes ficam nos `classNames` passados pela Agenda.
- Nenhuma mudança de dados, hooks ou backend.
