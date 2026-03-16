

## Cards Empilhados Estilo Baralho

Alterar o layout dos cards na Home para que fiquem sobrepostos como cartas de baralho, igual ao screenshot do Runna — cada card começa um pouco abaixo do anterior, com o restante escondido por trás.

### Alteração em `src/pages/Home.tsx`

- Trocar o container de `flex flex-col gap-3` para `relative` com altura fixa
- Cada card recebe `absolute` positioning com `top` incremental (~80px entre cada)
- Cards empilhados com `z-index` decrescente (primeiro card no topo, último atrás) — ou crescente para que o primeiro fique na frente
- Cada card tem altura fixa (~120px) e `rounded-2xl`
- O efeito visual: só o topo de cada card aparece, mostrando título e badges, com o próximo card "por trás"
- Manter click navegável em cada card

```text
┌─────────────────────────┐  ← Card 1 (z-40, top: 0)
│  Dashboard Geral    [→] │
│  badges                 │
├─────────────────────────┤  ← Card 2 (z-30, top: 80px)
│  Minhas Despesas    [→] │
│  badges                 │
├─────────────────────────┤  ← Card 3 (z-20, top: 160px)
│  Nova Despesa       [→] │
│  badges                 │
├─────────────────────────┤  ← Card 4 (z-10, top: 240px)
│  Histórico          [→] │
│  badges                 │
└─────────────────────────┘
```

