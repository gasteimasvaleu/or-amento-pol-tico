

## Plano: Adicionar Imagem de Referência ao Gerador de Mídia

### Visão Geral
Permitir que o usuário envie uma imagem de referência que será usada pelo Leonardo AI como guia visual (Image-to-Image) na geração. O fluxo da API do Leonardo requer 3 passos: (1) obter presigned URL via `/init-image`, (2) fazer upload da imagem, (3) passar o `initImageId` na chamada de geração.

### Alterações

#### 1. Edge Function `supabase/functions/gerar-midia/index.ts`
- Aceitar campo opcional `referenceImageBase64` (string base64 da imagem) no body
- Se presente:
  - Chamar `POST /init-image` para obter presigned URL e `initImageId`
  - Fazer upload da imagem via presigned URL (multipart form)
  - Incluir `imagePrompts` no body da geração com o `initImageId` e `initImageType: "UPLOADED"`
- Adicionar campo `strength` (0.1-0.9) para controlar quanto a imagem de referência influencia o resultado

#### 2. Componente `src/components/suporte/GeradorMidia.tsx`
- Adicionar seção "Imagem de referência (opcional)" com:
  - Input de upload de arquivo (aceitar image/png, image/jpeg, image/webp)
  - Preview da imagem selecionada com botão para remover
  - Slider de "Influência" (strength) de 10% a 90%, padrão 50%
- Converter o arquivo para base64 antes de enviar à edge function
- Manter o fluxo atual funcionando sem imagem (campo opcional)

### Fluxo técnico resumido
```text
[Usuário seleciona imagem] 
  → converte para base64 no frontend
  → envia junto com prompt para edge function
  → edge function faz upload para Leonardo (presigned URL)
  → passa initImageId na geração
  → polling e retorno da imagem gerada
```

