

## Remover URL dos cards de sites

Remover a linha que exibe a URL do site abaixo do nome no card (linha ~146 de `Noticias.tsx`), eliminando o scroll horizontal indesejado.

### Alteração

**`src/pages/Noticias.tsx`** — Remover o `<p>` que mostra `site.url` dentro do card de sites (aproximadamente linha 146):

```tsx
// Remover esta linha:
<p className="text-xs text-muted-foreground truncate">{site.url}</p>
```

Apenas o nome do site ficará visível no card.

