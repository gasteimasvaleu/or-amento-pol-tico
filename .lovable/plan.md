
Objetivo: corrigir o problema de “botão Continuar com Apple sem resposta” especificamente no iPad, sem alterar sua regra de negócio de assinatura.

Diagnóstico atual (com base no código e no relatório da Apple):
- O problema reportado é de interação no iPad (tap sem efeito aparente).
- Do I know what the issue is? Ainda não com 100% de certeza; hoje há 2 hipóteses técnicas fortes:
  1) problema de camada/área de toque (UI responsiva no iPad);
  2) problema nativo na apresentação do Apple Sign In (anchor/window em iPadOS).
- Vou tratar as duas frentes no mesmo pacote para eliminar falsos negativos no Review.

Plano de implementação

1) Instrumentar o fluxo de toque no botão Apple (sem mudar UX final)
- Arquivo: `src/pages/Login.tsx`
- Adicionar logs explícitos antes/depois do `nativeAppleSignIn()` (tap recebido, plugin disponível, início/fim da chamada).
- Diferenciar erros de:
  - plugin indisponível;
  - cancelamento;
  - falha de apresentação nativa.
- Resultado esperado: saber se o tap chega no JS e em qual etapa para.

2) Blindar interação responsiva no iPad (hit area/touch)
- Arquivo: `src/pages/Login.tsx`
- Ajustar classes do botão/container para robustez de toque em tablet:
  - `touch-manipulation`;
  - garantir `pointer-events-auto` no card/conteúdo interativo;
  - revisar `min-h-screen` para `min-h-[100dvh]` na tela de login para evitar comportamento estranho em iPad com barras dinâmicas.
- Resultado esperado: remover qualquer chance de camada invisível bloquear o toque.

3) Harden no plugin nativo para iPadOS (ponto mais crítico)
- Arquivo: `ios/App/App/NativeAppleSignInPlugin.swift`
- Melhorar `presentationAnchor(for:)` para buscar a janela ativa da cena atual (fallback seguro), em vez de depender apenas de `bridge?.viewController?.view.window`.
- Manter referência forte do `ASAuthorizationController` durante o fluxo (evita edge cases de lifecycle).
- Garantir limpeza da referência após sucesso/erro.
- Resultado esperado: tela nativa de Apple Sign In sempre abre em iPad (portrait/landscape/multitarefa).

4) Fail-safe quando nativo não abrir
- Arquivos: `src/lib/nativeAppleSignIn.ts` e `src/pages/Login.tsx`
- Se plugin nativo falhar por disponibilidade/contexto, exibir feedback claro e fallback controlado (ao menos mensagem explícita, sem parecer “botão morto”).
- Resultado esperado: reviewer nunca vê botão “sem resposta”; sempre há reação visível.

5) QA direcionado para App Review (iPad)
- Cenários obrigatórios:
  - iPad Air 11" em portrait e landscape;
  - app recém-instalado (sem cache/sessão);
  - app atualizado sobre versão anterior;
  - com e sem assinatura ativa.
- Verificar:
  - tap no botão sempre produz ação imediata;
  - sheet nativa Apple aparece;
  - erro/cancelamento mostra feedback.
- Critério de aceite:
  - zero estado de “tap sem resposta”;
  - logs confirmando sequência de execução completa.

Detalhes técnicos (resumo)
- Frontend: `src/pages/Login.tsx`, `src/lib/nativeAppleSignIn.ts`
- iOS nativo: `ios/App/App/NativeAppleSignInPlugin.swift`
- Não envolve migração de banco.
- Mantém sua regra atual de assinatura (não vou obrigar mudança de modelo neste plano).
- Após implementar no código nativo: você faz `git pull` e roda `npx cap sync ios` antes de gerar novo build para envio.

Entrega esperada
- Correção focada em iPad (responsividade + apresentação nativa robusta).
- Evidência via logs para anexar no Resolution Center se necessário.
- Fluxo de Sign in with Apple sem “unresponsive” no review.
