

## Correção: Header da página Lembretes

O header atual usa ícone Bell inline com o título. O padrão do app (como na Agenda) é título em negrito + subtítulo abaixo, sem ícone no header.

### Alteração em `src/pages/Lembretes.tsx`

Trocar o header atual:
```tsx
<div className="flex items-center gap-2">
  <Bell className="h-5 w-5 text-primary" />
  <h1 className="text-xl font-bold text-foreground">Lembretes</h1>
</div>
```

Por:
```tsx
<div>
  <h1 className="text-xl font-bold text-foreground">Lembretes</h1>
  <p className="text-sm text-muted-foreground">Gerencie seus lembretes</p>
</div>
```

Seguindo exatamente o padrão da página Agenda.

