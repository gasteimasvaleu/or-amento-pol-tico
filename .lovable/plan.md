

## Plano: Incrementar build para 13 e gerar notas de revisão

### Alterações em código

1. **`capacitor.config.ts`** — `buildNumber: '12'` → `'13'`
2. **`ios/App/App.xcodeproj/project.pbxproj`** — `CURRENT_PROJECT_VERSION = 12` → `13` (Debug e Release)

### Notas de revisão (para colar no App Store Connect)

Após aplicar, vou fornecer no chat as notas prontas cobrindo:
- Correção do Apple Sign In no iPad (Main.storyboard agora usa MyViewController)
- Purpose strings atualizadas com descrições específicas e exemplos
- Preço fallback R$ 79,90 visível quando RevenueCat não carrega (Guideline 2.3.2)
- Botão "Sair da conta" no paywall para facilitar testes com diferentes contas

