

## Plano de Implementação: Gerador de Mídia com Leonardo AI

O plano já foi aprovado anteriormente. Agora preciso da sua API key do Leonardo AI para configurar o secret e prosseguir com a implementação.

### Ordem de execução

1. **Adicionar secret `LEONARDO_API_KEY`** — vou solicitar a chave via ferramenta de secrets
2. **Criar edge function `supabase/functions/gerar-midia/index.ts`** — chamada à API do Leonardo AI com polling para aguardar geração
3. **Criar componente `src/components/suporte/GeradorMidia.tsx`** — formulário com prompt, formato e estilo + preview da imagem gerada
4. **Atualizar `src/pages/Suporte.tsx`** — adicionar card "Gerador de Mídia" ao hub
5. **Atualizar `supabase/config.toml`** — registrar a nova function

### Próximo passo
Preciso que você forneça a API key do Leonardo AI para eu configurar o secret e iniciar a implementação.

