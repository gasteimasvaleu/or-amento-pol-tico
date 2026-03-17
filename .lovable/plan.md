

## Plano: Corrigir Textarea no mobile iOS

O problema central é que o iOS Safari aplica auto-zoom quando o font-size de um input/textarea é menor que 16px. O componente atual usa `text-sm` (14px), causando zoom e deslocamento do layout ao focar.

### Alterações

**1. `src/components/ui/textarea.tsx`** — Correção centralizada no componente base:
- Trocar `text-sm` por `text-base` (16px) para evitar auto-zoom no iOS
- Adicionar `resize-none` para impedir redimensionamento manual
- Adicionar `box-border` (já é default do Tailwind, mas explícito para clareza)

```tsx
"flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base resize-none box-border ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
```

**2. `src/components/despesas/DespesaForm.tsx`** — Remover o `resize-none` inline (já que agora vem do componente base), para evitar duplicação.

**3. `src/index.css`** — Já está correto (`html,body: overflow:hidden`, `#root: overflow-y:auto, overflow-x:hidden, overscroll-behavior:none`). Nenhuma alteração necessária.

**Não é necessário** envolver cada Textarea em `<div className="overflow-hidden">` porque o `#root` já tem `overflow-x: hidden` e o Textarea terá `resize-none` + `box-border` + `w-full`, impedindo qualquer expansão lateral. Isso mantém o código limpo sem wrappers desnecessários.

### Resultado
Apenas 1 arquivo editado (`textarea.tsx`) resolve o problema para todos os 13 arquivos que usam o componente. O iOS não fará auto-zoom ao focar, e o textarea não pode ser redimensionado manualmente.

