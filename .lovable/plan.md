

## Correções para Aprovação na App Store (3 problemas)

### 1. Guideline 3.1.2(c) — Adicionar descrição dos benefícios da assinatura

**Arquivo:** `src/pages/Login.tsx`

No bloco de assinatura (linhas 185-195), adicionar uma lista clara de funcionalidades incluídas:

- Gestao completa de eleitores e apoiadores
- Agenda e compromissos parlamentares
- Controle de despesas de mandato
- Geracao de discursos e projetos de lei com IA
- Analise de noticias e geracao de midias
- Suporte prioritario

Texto curto, em bullet points ou lista compacta, logo abaixo do preco.

### 2. Guideline 2.1(a) — Erro 1000 no Apple Sign In no iPad

O screenshot mostra erro `com.apple.AuthenticationServices.AuthorizationError error 1000`. Esse codigo significa **ASAuthorizationError.unknown**, que no iPad com iPadOS 26 ocorre quando o `presentationAnchor` retorna uma window invalida.

**Causa raiz:** O `AppDelegate.swift` atual usa o padrao antigo sem `UISceneDelegate`. No iPadOS 26 (baseado em iOS 26), o sistema usa scenes por padrao. Sem um `SceneDelegate`, a `window` do AppDelegate pode ser `nil`, fazendo o `presentationAnchor` falhar.

**Alteracoes:**

**`ios/App/App/AppDelegate.swift`** — Adicionar suporte a UIScene:
- Adicionar `application(_:configurationForConnecting:)` retornando config com SceneDelegate
- Criar `SceneDelegate` inline que instancia `MyViewController` e configura a window via `UIWindowScene`

**`ios/App/App/NativeAppleSignInPlugin.swift`** — Reforcar presentationAnchor:
- Adicionar log antes de retornar a window para diagnostico
- Garantir que nunca force-unwrap (remover o `!` do fallback final)

**`src/pages/Login.tsx`** — Melhorar error handling:
- No catch do `handleAppleSignIn`, logar `JSON.stringify(error)` completo
- Suprimir erro 1000 da mesma forma que suprime 1001 (cancelled), ou mostrar mensagem mais util

### 3. Scroll no Card de Login

**Arquivo:** `src/pages/Login.tsx`

Com a descricao de beneficios adicionada, o card ficara maior. Adicionar scroll:
- Envolver o Card com `overflow-y-auto max-h-[90dvh]` para garantir que em telas menores (iPad landscape, iPhones SE) o conteudo seja rolavel

### 4. Build number

- `capacitor.config.ts`: buildNumber `'6'` → `'7'`
- `ios/App/App.xcodeproj/project.pbxproj`: CURRENT_PROJECT_VERSION → `7`

### Tambem atualizar `ios-native-backup/`

- Copiar as mudancas do `AppDelegate.swift` para `ios-native-backup/AppDelegate.swift` para manter o backup sincronizado

---

### Resumo de arquivos alterados

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Login.tsx` | Beneficios da assinatura + scroll no card + melhor error handling |
| `ios/App/App/AppDelegate.swift` | UISceneDelegate para iPadOS 26 |
| `ios-native-backup/AppDelegate.swift` | Mesmo (backup sync) |
| `ios/App/App/NativeAppleSignInPlugin.swift` | presentationAnchor mais seguro + logs |
| `ios-native-backup/NativeAppleSignInPlugin.swift` | Mesmo (backup sync) |
| `capacitor.config.ts` | buildNumber → 7 |
| `project.pbxproj` | CURRENT_PROJECT_VERSION → 7 |

