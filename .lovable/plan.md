

## Trocar Leonardo AI para Nano Banana Pro (Gemini 3 Pro Image)

Reescrever a Edge Function `gerar-midia` para usar o gateway Lovable AI (`google/gemini-3-pro-image-preview`) em vez do Leonardo AI. Isso simplifica bastante o código — elimina polling, upload de init image, e dependência da API do Leonardo.

### Alterações

**Arquivo: `supabase/functions/gerar-midia/index.ts`**

- Remover toda lógica Leonardo (pollGeneration, uploadInitImage, presigned URLs)
- Usar `LOVABLE_API_KEY` (já existe nos secrets) para chamar `https://ai.gateway.lovable.dev/v1/chat/completions`
- Modelo: `google/gemini-3-pro-image-preview` com `modalities: ["image", "text"]`
- Montar prompt com instruções de dimensão e estilo
- Para imagem de referência: enviar como `image_url` no content array (multimodal)
- Retornar a imagem base64 gerada diretamente (o frontend já aceita URLs de imagem)

**Arquivo: `src/components/suporte/GeradorMidia.tsx`**

- Ajustar para aceitar resposta com `imageBase64` (data URL) além de `imageUrl`, já que o gateway retorna base64
- O download e save precisam funcionar com data URLs também

### Fluxo simplificado

```text
Frontend → Edge Function → Lovable AI Gateway (Gemini 3 Pro) → base64 image → Frontend
```

Sem polling, sem upload separado de referência — tudo em uma única chamada.

