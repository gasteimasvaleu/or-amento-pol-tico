
Objetivo: corrigir os 3 motivos da reprovação da Apple com o menor risco possível para a próxima submissão.

1. Corrigir o bug real do “Continuar com Apple”
- Ajustar a inicialização do bridge nativo iOS para garantir que `MyViewController` seja realmente usado no app.
- Hoje há um forte indício de inconsistência: o `Main.storyboard` ainda aponta para `CAPBridgeViewController`, enquanto o plugin local depende de `MyViewController.capacitorDidLoad()` para registrar `NativeAppleSignIn`.
- Em iPad/iPadOS isso pode fazer o plugin não ser registrado corretamente, causando o erro ao tocar em “Continuar com Apple”.
- Implementação prevista:
  - trocar o controller do storyboard para `MyViewController` ou alinhar a inicialização nativa para remover a ambiguidade;
  - revisar o registro do plugin local para manter compatibilidade com o Capacitor atual;
  - reforçar o tratamento de erro no login para diferenciar:
    - plugin indisponível,
    - erro nativo Apple Sign In,
    - erro do `supabase.auth.signInWithIdToken(...)`.
- Revisar também o fluxo nativo do `signInWithIdToken`, porque a documentação do Supabase para Apple nativo destaca uso de `nonce`; se necessário, adaptar o plugin e o login para enviar o nonce corretamente.

2. Garantir o fluxo correto de primeira abertura
- Manter o login sempre acessível primeiro.
- Exibir o paywall somente após autenticação bem-sucedida e ausência de assinatura.
- Adicionar uma saída segura no paywall (“Sair da conta”) para evitar ficar preso em sessão cacheada ao trocar de conta durante review/testes.

3. Corrigir as purpose strings de privacidade
- Atualizar as descrições em:
  - `ios/App/App/Info.plist`
  - `capacitor.config.ts`
- Substituir textos genéricos por textos específicos e exemplificados.
- Exemplo de direção:
  - câmera: explicar que será usada para fotografar comprovantes, registros de agenda, documentos ou imagens de atividades parlamentares;
  - biblioteca: explicar seleção e envio de fotos/mídias para cadastro e galeria;
  - salvar na galeria: explicar que imagens geradas/baixadas pelo app podem ser salvas no dispositivo.

4. Corrigir o problema de metadata 2.3.2
- Revisar textos expostos no app e preparar orientação para App Store Connect.
- No app, garantir que recursos pagos estejam claramente associados ao plano “Mandato Intelligence Pro”.
- Em App Store Connect, atualizar descrição, subtítulo, screenshots e textos promocionais para deixar explícito que certos recursos requerem assinatura/in-app purchase.
- Evitar frases ambíguas que façam parecer que tudo já está incluído gratuitamente.

5. Atualizar build para 12
- Sincronizar:
  - `capacitor.config.ts` → `buildNumber: '12'`
  - `ios/App/App.xcodeproj/project.pbxproj` → `CURRENT_PROJECT_VERSION = 12` em Debug e Release

Arquivos com maior chance de alteração
- `ios/App/App/Base.lproj/Main.storyboard`
- `ios/App/App/AppDelegate.swift`
- `ios/App/App/MyViewController.swift`
- `ios/App/App/NativeAppleSignInPlugin.swift`
- `src/lib/nativeAppleSignIn.ts`
- `src/pages/Login.tsx`
- `src/components/layout/ProtectedRoute.tsx`
- `src/components/paywall/PaywallScreen.tsx`
- `ios/App/App/Info.plist`
- `capacitor.config.ts`
- `ios/App/App.xcodeproj/project.pbxproj`

Resumo técnico
```text
Problema mais provável do Apple Sign In:
Storyboard/boot nativo não está alinhado com o controller customizado.
Sem MyViewController ativo -> plugin local pode não registrar.
Sem plugin registrado -> erro ao tocar “Continuar com Apple”.

Fluxo desejado:
Primeira abertura -> Login
Login OK -> checa assinatura
Sem assinatura -> Paywall
Com assinatura -> App
```

Validação antes de reenviar
- Testar end-to-end em iPhone e iPad:
  - instalação limpa;
  - atualização sobre build anterior;
  - Apple Sign In com conta nova;
  - Apple Sign In com conta já existente;
  - login email/senha;
  - restauração de compras;
  - paywall pós-login;
  - permissões de câmera/galeria.
- Depois preparar novas notas de revisão explicando:
  - correção do Apple Sign In no iPad,
  - identificação clara dos recursos pagos,
  - atualização das purpose strings.
