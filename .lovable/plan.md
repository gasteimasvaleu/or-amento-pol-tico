

## Plano: Desativar autofill no formulário de Cadastro Institucional

### Problema
Os campos do formulário em `CadastroInstitucional.tsx` usam `id="email"` e `id="password"`, que são os mesmos IDs da página de login. O navegador reconhece e preenche automaticamente com as credenciais salvas.

### Correção em `src/pages/CadastroInstitucional.tsx`

1. Adicionar `autoComplete="off"` no `<form>`
2. Mudar os IDs dos campos para evitar match com credenciais salvas:
   - `id="email"` → `id="inst-email"` + `autoComplete="new-username"`
   - `id="password"` → `id="inst-password"` + `autoComplete="new-password"`
   - `id="name"` → `id="inst-name"` + `autoComplete="off"`
3. Nos `<Label htmlFor="...">` ajustar os `htmlFor` correspondentes

Isso impede o navegador de preencher os campos com credenciais salvas.

