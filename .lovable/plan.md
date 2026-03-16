

## Plano: Gerador de Posts para Redes Sociais com Leonardo AI

### Visão Geral
Adicionar uma nova ferramenta "Gerador de Mídia" no hub do Suporte que permite criar imagens para posts de redes sociais usando a API do Leonardo AI. O fluxo segue o mesmo padrão visual dos outros geradores (Discurso, Análise, Projeto de Lei).

### Alterações

1. **Configurar secret da API**
   - Solicitar a chave `LEONARDO_API_KEY` via ferramenta de secrets do Supabase

2. **Edge Function `gerar-midia/index.ts`**
   - Recebe: prompt (descrição do post), formato (story, feed quadrado, feed paisagem), estilo (moderno, minimalista, político, institucional)
   - Chama a API do Leonardo AI (`https://cloud.leonardo.ai/api/rest/v1/generations`) para gerar a imagem
   - Aguarda a geração (polling no endpoint de status) e retorna a URL da imagem
   - Adicionar ao `supabase/config.toml` com `verify_jwt = false`

3. **Componente `src/components/suporte/GeradorMidia.tsx`**
   - Formulário com: prompt de texto, seleção de formato (Story 1080x1920, Feed Quadrado 1080x1080, Feed Paisagem 1200x628), seleção de estilo
   - Botão "Gerar Imagem" que chama a edge function
   - Exibe a imagem gerada com opções de: baixar e salvar na galeria de mídias (bucket `midias`)
   - Padrão visual igual ao GeradorDiscurso (Card, botão voltar, loading state)

4. **`src/pages/Suporte.tsx`**
   - Adicionar card "Gerador de Mídia" com ícone `ImagePlus` no hub
   - Adicionar estado `"gerador-midia"` ao tipo `Tool` e renderizar o componente

### Formatos de imagem
- **Story**: 1080x1920 (9:16)
- **Feed Quadrado**: 1080x1080 (1:1)
- **Feed Paisagem**: 1200x628 (~1.91:1)

