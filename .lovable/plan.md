

## Plano: Adicionar botão WhatsApp nos cards de Assessores e Apoiadores

Replicar o padrão já existente em `GestaoEleitores.tsx` (botão com ícone SVG do WhatsApp que abre `https://wa.me/55{telefone}`) nos cards de ambas as páginas.

### Mudanças

**1. `src/pages/Assessores.tsx`**
- Adicionar função `handleWhatsApp` (mesma lógica: limpa telefone e abre `wa.me`).
- No card de cada assessor, ao lado do botão de lixeira (antes dele), inserir o botão WhatsApp condicionado a `a.telefone` existir. Usar mesmo estilo: `variant="ghost" size="icon" className="h-7 w-7"` com SVG verde.
- Adicionar `e.stopPropagation()` no onClick.

**2. `src/pages/Apoiadores.tsx`**
- Adicionar função `handleWhatsApp` idêntica.
- No card de cada apoiador, ao lado do botão de lixeira, inserir o botão WhatsApp condicionado a `a.telefone` ou `a.whatsapp` existir (o tipo `Apoiador` tem campo `whatsapp` separado — usar `a.whatsapp || a.telefone`).
- Mesmo estilo e padrão.

