

## Plano: Upload da imagem gerada para Storage ao invés de retornar Base64

### Problema
A imagem gerada pelo Gemini é retornada como base64 (vários MBs). No WKWebView do iOS, isso pode falhar intermitentemente ao renderizar em `<img>`, explicando por que às vezes funciona e às vezes não.

### Mudanças

**1. Edge Function `supabase/functions/gerar-midia/index.ts`**
- Após receber o base64 do Gemini, decodificar para `Uint8Array`
- Extrair o `user_id` do JWT no header Authorization
- Fazer upload para o bucket `midias` (path: `generated/{user_id}/{timestamp}.png`) usando `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- Retornar `{ imageUrl: "<public_url>" }` ao invés de `{ imageBase64: "data:..." }`
- Fallback: se o upload falhar, retornar o base64 como antes

**2. Frontend `src/components/suporte/GeradorMidia.tsx`**
- `handleGenerate`: já tem `data.imageBase64 || data.imageUrl` — inverter para priorizar `data.imageUrl || data.imageBase64`
- `handleSaveToGallery`: detectar se `imageUrl` já é do bucket `midias` e evitar re-upload redundante — apenas inserir o registro na tabela `midias`
- `handleDownload`: funciona sem mudanças (já trata URLs normais)

### Detalhes Técnicos
- Secrets necessários: `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` — já configurados
- Bucket `midias` já existe e é público
- Nenhuma migração de banco necessária
- Backward compatible com respostas base64 existentes

