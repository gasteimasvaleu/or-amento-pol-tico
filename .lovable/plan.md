

## Gerador de Projetos de Lei — Página Suporte

Seguir o mesmo padrão do Gerador de Discurso: componente frontend com streaming SSE + edge function usando Lovable AI Gateway.

### Campos de configuração

| Campo | Tipo | Opções |
|-------|------|--------|
| Título do projeto | Textarea | Livre |
| Esfera | Select | Municipal, Estadual, Federal |
| Tipo | Select | Lei Ordinária, Lei Complementar, Emenda, Resolução, Decreto Legislativo |
| Área temática | Select | Saúde, Educação, Segurança, Meio Ambiente, Infraestrutura, Social, Economia, Cultura |
| Justificativa/contexto | Textarea | Livre (opcional) |

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/suporte/GeradorProjetoLei.tsx` | Novo componente (padrão do GeradorDiscurso com streaming + Markdown) |
| `src/pages/Suporte.tsx` | Adicionar card + tipo "gerador-projeto-lei" |
| `supabase/functions/gerar-projeto-lei/index.ts` | Edge function com prompt especializado em redação legislativa |
| `supabase/config.toml` | Adicionar `[functions.gerar-projeto-lei]` |

### Edge Function

System prompt especializado em técnica legislativa brasileira, incluindo:
- Estrutura formal (ementa, preâmbulo, artigos, parágrafos, incisos, justificativa)
- Linguagem jurídica adequada
- Formatação em Markdown
- Adaptação à esfera legislativa selecionada

Streaming SSE idêntico ao `gerar-discurso`, usando `google/gemini-3-flash-preview`.

