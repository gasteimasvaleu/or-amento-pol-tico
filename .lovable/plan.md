

## Plano: VideoOverlay apenas nos estados de geração IA

O overlay com vídeo + barra de progresso deve aparecer **somente enquanto a IA está processando/gerando conteúdo**, não em transições de página ou loading de dados.

### Locais identificados (5 geradores de IA)

| Componente | Estado de loading | O que está gerando |
|---|---|---|
| `GeradorDiscurso.tsx` | `isLoading` | Gerando discurso (streaming) |
| `GeradorProjetoLei.tsx` | `isLoading` | Gerando projeto de lei (streaming) |
| `GeradorPostagem.tsx` | `isLoading` | Gerando postagem (streaming) |
| `GeradorMidia.tsx` | `loading` | Gerando imagem (API Leonardo AI) |
| `AnaliseNoticia.tsx` | `isAnalyzing` / `isCommenting` | Analisando notícia / gerando comentário |

### O que fazer

**1. Reverter overlays das páginas de dados e transição do Suporte**

Remover `VideoOverlay` de:
- `DashboardGeral.tsx` — voltar ao spinner original
- `Despesas.tsx` — voltar ao spinner original
- `GestaoEleitores.tsx` — voltar ao spinner original
- `GestaoCidades.tsx` — voltar ao spinner original
- `Suporte.tsx` — remover lógica de `showOverlay`/`pendingTool`, voltar à troca direta de `activeTool`

**2. Adicionar VideoOverlay nos 5 geradores**

Em cada componente, renderizar `<VideoOverlay />` condicionalmente quando o estado de loading for `true` **e ainda não tiver conteúdo gerado** (ou seja, no início da geração, antes do streaming começar a preencher). Assim o overlay aparece no "preparando..." e some quando o primeiro chunk de texto chega.

Lógica: `{isLoading && !conteudo && <VideoOverlay />}`

Para o **GeradorMidia** (que não faz streaming), o overlay fica visível durante todo o `loading` até a imagem ser retornada.

Para a **AnaliseNoticia**, o overlay aparece em `isAnalyzing && !analise` e `isCommenting && !comentario`.

### Arquivos editados

1. `src/pages/DashboardGeral.tsx` — remover VideoOverlay, restaurar spinner
2. `src/pages/Despesas.tsx` — remover VideoOverlay, restaurar spinner
3. `src/pages/GestaoEleitores.tsx` — remover VideoOverlay, restaurar spinner
4. `src/pages/GestaoCidades.tsx` — remover VideoOverlay, restaurar spinner
5. `src/pages/Suporte.tsx` — remover overlay de transição, voltar à troca direta
6. `src/components/suporte/GeradorDiscurso.tsx` — adicionar `<VideoOverlay />`
7. `src/components/suporte/GeradorProjetoLei.tsx` — adicionar `<VideoOverlay />`
8. `src/components/suporte/GeradorPostagem.tsx` — adicionar `<VideoOverlay />`
9. `src/components/suporte/GeradorMidia.tsx` — adicionar `<VideoOverlay />`
10. `src/components/suporte/AnaliseNoticia.tsx` — adicionar `<VideoOverlay />`

