

## Gerador de Discurso com IA na Página Suporte

### Visão Geral

Transformar a página Suporte em um hub de ferramentas, começando com um "Gerador de Discurso" que usa Lovable AI (via edge function) para gerar discursos parlamentares personalizados. O parlamentar configura tema, tom, tamanho, estilo, público-alvo e contexto, e recebe um discurso completo com streaming em tempo real.

### 1. Edge Function `gerar-discurso`

- **Arquivo**: `supabase/functions/gerar-discurso/index.ts`
- Recebe: `{ tema, tom, tamanho, estilo, publico, contexto }` via POST
- Usa `LOVABLE_API_KEY` + Lovable AI Gateway com streaming SSE
- System prompt especializado para discursos parlamentares brasileiros
- Modelo: `google/gemini-3-flash-preview`
- Retorna stream SSE para renderização token-by-token

### 2. Página Suporte Refatorada

Transformar em hub com cards de ferramentas. Card "Gerador de Discurso" abre a interface de geração.

### 3. Componente `GeradorDiscurso`

- **Arquivo**: `src/components/suporte/GeradorDiscurso.tsx`
- Formulário com os campos:
  - **Tema** (textarea): assunto principal do discurso
  - **Tom** (select): Formal, Inspirador, Crítico, Conciliador, Emotivo, Técnico
  - **Tamanho** (select): Curto (2min), Médio (5min), Longo (10min), Extenso (15min+)
  - **Estilo** (select): Tribuna, Plenário, Comissão, Evento, Redes Sociais
  - **Público-alvo** (select): Parlamentares, Cidadãos, Imprensa, Comunidade Específica
  - **Contexto adicional** (textarea opcional): dados, referências, posicionamento
- Área de resultado com streaming do discurso (markdown renderizado)
- Botão copiar discurso gerado
- Estado de loading com indicador visual

### 4. Atualizar `supabase/config.toml`

Adicionar configuração da nova edge function com `verify_jwt = false`.

### 5. Arquivos

| Arquivo | Ação |
|---------|------|
| `supabase/functions/gerar-discurso/index.ts` | Criar - edge function com streaming |
| `src/components/suporte/GeradorDiscurso.tsx` | Criar - componente completo |
| `src/pages/Suporte.tsx` | Refatorar - hub com card do gerador |
| `supabase/config.toml` | Adicionar config da função |

### Detalhes Técnicos

- Streaming SSE via fetch direto (não supabase.functions.invoke, pois não suporta streaming)
- URL construída com `import.meta.env.VITE_SUPABASE_URL`
- ReactMarkdown para renderizar o discurso gerado
- `LOVABLE_API_KEY` já disponível como secret (verificado)

