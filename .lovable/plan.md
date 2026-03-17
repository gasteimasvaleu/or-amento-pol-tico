
## Plano: Adicionar botão "Compartilhar no WhatsApp" nos 3 geradores

Todos já possuem o botão "Copiar". Vou adicionar um botão "WhatsApp" ao lado do "Copiar" nos 3 componentes.

### Arquivos alterados

**1. `src/components/suporte/GeradorDiscurso.tsx`**
- Importar ícone `Share2` do lucide-react
- Adicionar função `handleWhatsApp` que abre `https://wa.me/?text=` com o texto encodado
- Adicionar botão "WhatsApp" ao lado do "Copiar" no header do card de resultado

**2. `src/components/suporte/GeradorProjetoLei.tsx`**
- Mesma alteração: importar `Share2`, adicionar `handleWhatsApp`, botão WhatsApp

**3. `src/components/suporte/GeradorPostagem.tsx`**
- Mesma alteração: importar `Share2`, adicionar `handleWhatsApp`, botão WhatsApp

### Lógica do compartilhamento
```ts
const handleWhatsApp = () => {
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank");
};
```

Botão com ícone `Share2` e texto "WhatsApp", variant `outline`, ao lado do botão Copiar. Os dois botões ficam em um `div flex gap-2`.

3 arquivos, mesma alteração em cada.
