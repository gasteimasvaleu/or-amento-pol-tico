

## Correção: Container da página Lembretes

O Layout mobile já aplica `px-4 py-4 pb-24` no `<main>`. A página Lembretes adiciona `p-4 pb-24` duplicando o padding. A Agenda usa `flex flex-col gap-4 pb-20` sem padding extra — esse é o padrão correto.

### Alteração em `src/pages/Lembretes.tsx`

Trocar o container externo de:
```tsx
<div className="p-4 pb-24 space-y-6 max-w-2xl mx-auto">
```

Por:
```tsx
<div className="flex flex-col gap-4 pb-20">
```

Seguindo exatamente o padrão da página Agenda. Isso remove o padding duplicado e alinha o layout corretamente.

