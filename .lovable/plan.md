

## Plano: Corrigir erro de build @swc/core + Publicar pasta ios/

### Problema 1: Build do Lovable falhando
O plugin `@vitejs/plugin-react-swc` usa o pacote `@swc/core` que depende de binários nativos incompatíveis com o ambiente de build do Lovable. A solução é trocar para `@vitejs/plugin-react` (que usa Babel).

**Mudanças:**
1. **package.json** — Substituir `@vitejs/plugin-react-swc` por `@vitejs/plugin-react` nas devDependencies
2. **vite.config.ts** — Alterar o import de `@vitejs/plugin-react-swc` para `@vitejs/plugin-react`

### Problema 2: Pasta ios/ no Appflow
A pasta `ios/` já existe no seu Mac. O `.gitignore` **não** está ignorando ela, então basta fazer o commit:

```bash
git add ios/
git commit -m "Add iOS platform for Appflow builds"
git push
```

Depois disso, o Appflow vai encontrar o `App.xcodeproj` e o build deve funcionar.

