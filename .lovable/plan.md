

## Plano: Overlay com vídeo animado + barra de progresso

### 1. Criar componente `src/components/ui/VideoOverlay.tsx`

Componente reutilizável fullscreen:
- Vídeo `overlay.mp4` em formato 9:16, `object-cover`, ocupando toda a tela (`fixed inset-0 z-[9999]`)
- Barra de progresso (`Progress`) na parte inferior, animando de 0 a 100% baseado na duração
- Props: `duration` (ms, padrão 2000), `onComplete` callback
- Ao completar a animação, chama `onComplete` e o componente some
- Vídeo com `autoPlay`, `muted`, `playsInline`
- Fade-out ao final usando `animate-fade-out`

URL do vídeo: `https://wrriittiqsmzbapbrcwm.supabase.co/storage/v1/object/public/criativos/overlay.mp4`

### 2. Suporte.tsx — Overlay ao trocar de ferramenta

- Adicionar estado `showOverlay` + `pendingTool`
- Ao clicar em uma ferramenta: setar `showOverlay = true` e `pendingTool = ferramenta`
- Renderizar `<VideoOverlay onComplete={() => { setActiveTool(pendingTool); setShowOverlay(false); }} duration={2000} />`
- Só depois do overlay completar é que a ferramenta aparece

### 3. Páginas com loading de dados — Substituir spinner pelo overlay

Substituir o spinner `<Loader2 className="animate-spin" />` pelo `<VideoOverlay>` nas seguintes páginas:

| Página | Arquivo | Condição |
|--------|---------|----------|
| Dashboard | `DashboardGeral.tsx` | `loading === true` (linha 144-148) |
| Despesas | `Despesas.tsx` | `isLoading` (linha 55-59) |
| Eleitores | `GestaoEleitores.tsx` | `isLoading` (linha 84-87) |
| Cidades | `GestaoCidades.tsx` | `isLoading` |

Nestes casos o overlay fica visível enquanto `isLoading` for true, sem duração fixa — a prop `onComplete` não é usada, e o overlay simplesmente desaparece quando o loading terminar (renderização condicional).

### Arquivos

1. **Criar** `src/components/ui/VideoOverlay.tsx`
2. **Editar** `src/pages/Suporte.tsx` — overlay de transição entre ferramentas
3. **Editar** `src/pages/DashboardGeral.tsx` — substituir spinner
4. **Editar** `src/pages/Despesas.tsx` — substituir spinner
5. **Editar** `src/pages/GestaoEleitores.tsx` — substituir spinner
6. **Editar** `src/pages/GestaoCidades.tsx` — substituir spinner

