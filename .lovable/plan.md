

## Plano: Gerador de Postagens para Redes Sociais

Novo tool no hub de Suporte, seguindo o mesmo padrão do GeradorDiscurso (streaming SSE + Lovable AI Gateway).

### 1. Edge Function: `supabase/functions/gerar-postagem/index.ts`

- Recebe: `tema`, `tom`, `tamanho`, `tipo`, `usarEmojis`, `imagemBase64` (opcional)
- System prompt: especialista em social media, sempre inclui hashtags, adapta conforme parâmetros
- Se imagem enviada, usa modelo multimodal (gemini-2.5-flash) com content type image para análise da imagem e gera postagem baseada nela
- Streaming SSE igual ao gerar-discurso
- Atualizar `supabase/config.toml` com `[functions.gerar-postagem] verify_jwt = false`

### 2. Componente: `src/components/suporte/GeradorPostagem.tsx`

Campos do formulário:
- **Tema** (Textarea) — obrigatório
- **Tom** (Select): Formal, Descontraído, Inspirador, Informativo, Humorístico
- **Tamanho** (Select): Curto (~280 chars/Twitter), Médio (Instagram), Longo (LinkedIn/Facebook)
- **Tipo** (Select): Engajador, Crítico, Viralizado
- **Usar Emojis** (Switch): sim/não
- **Imagem de referência** (opcional): upload com preview, base64, igual ao padrão do GeradorMidia

Resultado: streaming em Markdown com botão Copiar. Log na `geracoes_log` com tipo "postagem".

### 3. Página Suporte: `src/pages/Suporte.tsx`

- Adicionar "gerador-postagem" ao type Tool
- Novo card no hub com ícone `MessageSquare` (ou `Hash`)
- Renderizar `GeradorPostagem` quando ativo

### Prompt do agente (backend)

```
Você é um especialista em criação de conteúdo para redes sociais, com anos de experiência em engajamento digital e marketing político.

Diretrizes:
- SEMPRE inclua hashtags relevantes ao final da postagem
- Adapte o texto ao tamanho e plataforma indicados
- {Se emojis habilitados}: Use emojis estrategicamente para aumentar engajamento
- {Se emojis desabilitados}: NÃO use emojis
- {Se imagem fornecida}: Analise a imagem e crie a postagem baseada no conteúdo visual
- Tipo engajador: perguntas, call-to-action, interatividade
- Tipo crítico: argumentação sólida, dados, posicionamento firme
- Tipo viralizado: linguagem impactante, ganchos emocionais, shareability
```

