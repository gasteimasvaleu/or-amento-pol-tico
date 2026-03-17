

## Correção: Título colado no botão

O header usa `flex items-center justify-between` mas o título e o botão estão se comprimindo na mesma linha sem espaçamento adequado.

### Alteração em `src/pages/Lembretes.tsx` (linha 118-125)

Adicionar `gap-4` no container flex do header para garantir espaço entre título e botão, e ajustar o título para `text-xl font-bold` (padrão do app conforme branding memory):

```tsx
<div className="flex items-center justify-between gap-4">
  <div className="flex items-center gap-2">
    <Bell className="h-5 w-5 text-primary" />
    <h1 className="text-xl font-bold text-foreground">Lembretes</h1>
  </div>
  <Button size="sm" onClick={...}>
    <Plus className="h-4 w-4 mr-1" /> Novo
  </Button>
</div>
```

O `gap-4` impede que o título e o botão fiquem colados quando o espaço é limitado.

