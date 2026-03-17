

## Plano: Corrigir conflito de dependências date-fns / react-day-picker

### Problema
`react-day-picker@8.10.1` exige `date-fns@^2.28.0 || ^3.0.0`, mas o projeto usa `date-fns@^4.1.0`.

### Solução
Fazer downgrade do `date-fns` para `^3.6.0` no `package.json`. A API do date-fns v3 é compatível com o uso atual no projeto (format, parseISO, isSameDay, etc.), então não há breaking changes.

### Alteração

| Arquivo | Mudança |
|---|---|
| `package.json` | `"date-fns": "^4.1.0"` → `"date-fns": "^3.6.0"` |

1 arquivo, 1 linha.

