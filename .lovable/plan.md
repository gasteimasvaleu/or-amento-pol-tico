

## Plano: Bottom Navigation Mobile-First

### Abordagem

Criar uma barra de navegação inferior estilo app nativo para mobile, mantendo a sidebar apenas para desktop. O Layout será adaptado para detectar mobile/desktop e renderizar o componente adequado.

### Alterações

**1. Criar `src/components/layout/BottomNav.tsx`**
- Barra fixa no rodapé com ícones + labels para: Início (`/`), Dashboard (`/dashboard`), Despesas (`/despesas`), Mais (menu expandido)
- Estilo nativo: ícone ativo com cor primária, fundo `bg-card`, borda superior, safe-area padding (iOS)
- Usa `useLocation` para highlight do item ativo

**2. Atualizar `src/components/layout/Layout.tsx`**
- Mobile: esconder sidebar, mostrar BottomNav, remover header com SidebarTrigger
- Desktop: manter sidebar como está
- Usar `useIsMobile()` hook existente
- Adicionar `pb-16` no main para não sobrepor conteúdo no mobile

**3. Atualizar `src/index.css`**
- Adicionar safe-area inset support para dispositivos com notch

