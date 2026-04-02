
Objetivo: corrigir a rejeição do “Sign in with Apple” e preparar um novo build para review.

Diagnóstico mais provável
- O ponto mais suspeito está em `src/pages/Login.tsx`: o fluxo nativo chama `supabase.auth.signInWithIdToken()` com `nonce: "nonce"`.
- No plugin iOS (`ios/App/App/NativeAppleSignInPlugin.swift`), o request da Apple não recebe esse nonce.
- Isso deixa o login inconsistente e é a causa de código mais forte para o erro que a Apple viu após tocar em “Continuar com Apple”.
- O restante da base principal já parece correto: `MyViewController` está registrado, `Main.storyboard` aponta para ele e os entitlements de Apple Sign In existem.

Plano de implementação
1. Corrigir o login nativo com Apple
   - Em `src/pages/Login.tsx`, remover o `nonce: "nonce"` hardcoded do `signInWithIdToken`.
   - Manter o envio de `provider: "apple"` e `token: result.identityToken`, alinhando com o fluxo nativo documentado pelo Supabase.

2. Melhorar o tratamento de erro
   - Continuar ignorando cancelamento do usuário.
   - Separar melhor:
     - erro do plugin nativo
     - erro do Supabase Auth
     - cancelamento
   - Trocar mensagens técnicas cruas por um toast mais claro para falhas reais.

3. Endurecer levemente o plugin nativo
   - Em `ios/App/App/NativeAppleSignInPlugin.swift`, padronizar melhor os rejects/logs e limpar estado interno após success/error.
   - Não mexer primeiro em storyboard/anchor, porque essa parte já está mais robusta do que a implementação padrão.

4. Validar antes do reenvio
   - Teste em instalação limpa no iPhone e no iPad.
   - Teste primeira autorização com Apple.
   - Teste login subsequente com o mesmo Apple ID.
   - Teste cancelamento sem exibir erro.
   - Teste também cenário de update sobre build anterior.

5. Checagem externa obrigatória
   - Confirmar no dashboard do Supabase que o provider Apple continua ativo e configurado corretamente para o app nativo.
   - Se o erro persistir mesmo após remover o nonce fake, a próxima suspeita passa a ser configuração externa do provider, não a bridge iOS.

6. Preparar reenvio
   - Depois do fix validado, subir o build de `13` para `14`.
   - Atualizar as notas do App Review informando que o fluxo nativo do Apple Sign In foi corrigido e retestado em iPhone/iPad.

Arquivos que eu mudaria
- `src/pages/Login.tsx`
- `ios/App/App/NativeAppleSignInPlugin.swift`
- `capacitor.config.ts`
- `ios/App/App.xcodeproj/project.pbxproj`

Detalhes técnicos
```text
Hoje:
Apple native token -> signInWithIdToken(token, nonce="nonce")  [inconsistente]

Depois:
Apple native token -> signInWithIdToken(token)  [compatível com o fluxo nativo atual]
```

Resultado esperado
- O erro visível após “Continuar com Apple” deixa de aparecer
- O login com Apple passa a funcionar em iPhone e iPad
- O app fica pronto para novo build e nova submissão
