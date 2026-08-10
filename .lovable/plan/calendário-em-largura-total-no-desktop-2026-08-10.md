# Calendário em largura total no desktop

## Ajuste

- Remover o layout em duas colunas: o calendário volta a ocupar toda a largura da tela, e a lista de compromissos do dia volta a aparecer abaixo dele (como antes).
- Manter as células dos dias mais altas para o calendário não parecer achatado quando esticado no desktop: altura maior em telas grandes, mantendo o ponto indicador de eventos.

## Detalhes técnicos

- `src/pages/Agenda.tsx`: remover o wrapper `grid lg:grid-cols-[380px_1fr]` e as classes `max-w-sm mx-auto lg:max-w-none` do card do calendário; voltar à ordem empilhada (calendário, depois "Day events").
- Manter os `classNames` de `cell`/`day` no `Calendar` com altura responsiva (`h-10 sm:h-12 lg:h-14`) para proporção adequada em telas largas.
