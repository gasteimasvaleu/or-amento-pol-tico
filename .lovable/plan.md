

## Inverter Ordem e Posicionar na Base

### Alterações em `src/pages/Home.tsx`

- Inverter `zIndex`: último card na frente (`zIndex: index + 1` em vez de `quickCards.length - index`)
- Posicionar o container de cards na parte inferior da tela, de forma que o último card fique próximo/atrás da bottom nav
- Usar `bottom` positioning ou flexbox com `mt-auto` para empurrar os cards para baixo
- O container pai do conteúdo da Home precisa ocupar altura total (`flex-1 flex flex-col`) para que os cards fiquem no rodapé

### Resultado visual

```text
  Olá, Fulano 👋
  Acesso rápido


         (espaço livre)


├─────────────────────────┤  ← Card 1 (z-10, mais atrás)
│  Dashboard Geral        │
├─────────────────────────┤  ← Card 2 (z-20)
│  Minhas Despesas        │
├─────────────────────────┤  ← Card 3 (z-30)
│  Nova Despesa           │
├─────────────────────────┤  ← Card 4 (z-40, na frente)
│  Histórico          [→] │
┗━━━━━━━━━━━━━━━━━━━━━━━━━┛  ← Bottom Nav (z-50)
```

