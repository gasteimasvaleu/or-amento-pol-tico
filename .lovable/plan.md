# Ajustar o calendário da Agenda no desktop

## Problema

No desktop o calendário ocupa toda a largura do card: as células dos dias ficam muito largas e com apenas 36px de altura, deixando a grade achatada ("imprensada").

## Ajustes

1. **Layout em duas colunas no desktop**
   Na página Agenda, a partir de `lg`, exibir o calendário à esquerda (coluna fixa, ~380px) e a lista de compromissos do dia à direita. No mobile continua empilhado como hoje.

2. **Calendário com proporção correta**
   Limitar a largura do calendário (`max-w-sm`, centralizado) e aumentar a altura das células em telas maiores, para que os dias fiquem quadrados em vez de esticados. O ponto indicador de evento permanece.

## Detalhes técnicos

- `src/pages/Agenda.tsx`: envolver calendário + lista em `grid lg:grid-cols-[380px_1fr] gap-4 items-start`; adicionar `max-w-sm mx-auto lg:max-w-none` ao wrapper do calendário.
- Passar `classNames={{ cell: "h-10 flex-1 ...", day: "h-10 w-full ..." }}` via prop no `Calendar` da Agenda (sem alterar o componente compartilhado `src/components/ui/calendar.tsx`).
- Nenhuma mudança de dados ou backend.
