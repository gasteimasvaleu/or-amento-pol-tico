

## Diagnóstico

O problema é o `mt-auto` na linha 65 do `Home.tsx`. Essa classe empurra os cards para o fundo do container flex, criando um espaço vazio entre o texto "Acesso rápido" e os cards. No navegador web o viewport é menor e o gap é discreto, mas no app nativo iOS (com viewport mais alto e safe areas), o espaço fica bem visível — como mostra o screenshot.

## Solução

Trocar `mt-auto` por `mt-4` no container dos cards (linha 65). Isso mantém um espaçamento fixo e consistente entre o texto e os cards, independente da altura do viewport.

### Alteração

**`src/pages/Home.tsx` linha 65:**
- De: `className="mt-auto relative mb-[-5rem]"`
- Para: `className="mt-4 relative mb-[-5rem]"`

Apenas essa mudança. Os cards ficam logo abaixo do texto "Acesso rápido" sem gap flutuante.

