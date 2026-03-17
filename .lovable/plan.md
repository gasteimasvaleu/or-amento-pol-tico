
Objetivo: remover o bloqueio do `npm install` (ERESOLVE) causado por incompatibilidade entre `react-day-picker@8.10.1` e `date-fns@4.x`.

Diagnóstico confirmado no código atual:
- `package.json` ainda está com `"date-fns": "^4.1.0"`.
- `react-day-picker@8.10.1` exige peer `date-fns` em `^2.28.0 || ^3.0.0`.
- Portanto, o conflito é real e reproduzível.

Plano de implementação:
1) Ajustar dependência principal
- Arquivo: `package.json`
- Troca:
  - de: `"date-fns": "^4.1.0"`
  - para: `"date-fns": "^3.6.0"`

2) Alinhar lockfiles para evitar inconsistência entre máquinas/CI
- Atualizar `package-lock.json` para refletir `date-fns@3.6.0` (npm).
- Se o projeto continuar versionando Bun lock, atualizar `bun.lock` também para manter coerência.

3) Validação técnica após ajuste
- Verificar árvore de dependências:
  - `npm ls date-fns react-day-picker`
- Verificar build:
  - `npm run build`
- Confirmar que não há erro de peer dependency no install limpo.

4) Orientação de uso local (após commit/pull)
- Rodar:
  - `git pull`
  - `npm install`
- Depois seguir fluxo iOS:
  - `npm run build`
  - `npx cap sync ios`
  - `npx cap open ios`

Escopo e impacto:
- Mudança pequena e segura (dependência + lockfiles).
- Sem alteração funcional de telas/fluxos.
- Não mexe em `capacitor.config.ts` para este problema específico.

Critério de pronto:
- `npm install` executa sem `ERESOLVE`.
- `npm run build` conclui com sucesso.
- Projeto apto para `cap sync ios`.
