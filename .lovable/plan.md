

## Analise de Noticia - Pagina Suporte

### Fluxo

1. Parlamentar cola o link da noticia
2. Edge function busca o conteudo da URL (fetch server-side + extrai texto)
3. IA analisa a noticia (streaming) - pontos-chave, impacto politico, oportunidades
4. Apos analise, parlamentar escolhe um tom e gera um comentario baseado na analise (streaming)

### Arquivos

| Arquivo | Acao |
|---------|------|
| `supabase/functions/analisar-noticia/index.ts` | Criar - edge function com 2 modos: `analisar` (fetch URL + analise IA) e `comentar` (gera comentario a partir da analise) |
| `src/components/suporte/AnaliseNoticia.tsx` | Criar - componente com input de URL, area de analise, selecao de tom, area de comentario |
| `src/pages/Suporte.tsx` | Adicionar card "Analise de Noticia" no hub e rota para o componente |
| `supabase/config.toml` | Registrar nova function |

### Edge Function `analisar-noticia`

- **Modo `analisar`**: Recebe `{ tipo: "analisar", url }`. Faz fetch da URL no servidor (extrai HTML, limpa tags para obter texto). Envia o texto para a IA com prompt de analise politica (streaming SSE). Analise inclui: resumo, pontos-chave, impacto politico, possiveis posicionamentos, oportunidades para o parlamentar.
- **Modo `comentar`**: Recebe `{ tipo: "comentar", analise, tom }`. Gera comentario politico baseado na analise com o tom escolhido (streaming SSE).
- Modelo: `google/gemini-3-flash-preview`

### Componente `AnaliseNoticia`

- **Etapa 1**: Input de URL + botao "Analisar". Mostra analise com streaming (ReactMarkdown).
- **Etapa 2** (apos analise concluida): Select de tom (Apoio, Critico, Neutro, Cauteloso, Indignado, Propositivo) + botao "Gerar Comentario". Mostra comentario com streaming. Botao copiar.
- Segue mesmo padrao visual do GeradorDiscurso (Card, botao voltar, etc.)

### Detalhes Tecnicos

- Scraping server-side via fetch + regex para remover tags HTML (sem dependencia externa)
- Mesmo padrao de streaming SSE do GeradorDiscurso
- Reutiliza `react-markdown` ja instalado

