

## Fix: TSE CDN Returning 403

The TSE CDN blocks requests without a proper `User-Agent` header. The edge function's `fetch()` call to `cdn.tse.jus.br` gets a 403 because it looks like a bot.

### Change

**`supabase/functions/consultar-dados-eleitorais/index.ts`** — Add browser-like headers to the ZIP download fetch:

```typescript
const zipResp = await fetch(cdnUrl, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    "Referer": "https://dadosabertos.tse.jus.br/",
  },
});
```

Single line change in the existing edge function. No other files affected.

