

## Fix: CORS Headers in `consultar-dados-eleitorais`

The edge function's `Access-Control-Allow-Headers` is missing headers the Supabase JS client sends (`x-supabase-client-platform`, etc.), causing the browser's preflight (OPTIONS) request to fail.

### Change

**`supabase/functions/consultar-dados-eleitorais/index.ts`** — Update the CORS headers (line 3-7):

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
```

Single file change, no other modifications needed.

