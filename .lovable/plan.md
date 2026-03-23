

## Plano: Atualizar card e adicionar modal com instruções + número do assistente

### Alterações em `src/components/notificacoes/NotificacoesConfig.tsx`

**1. Título e botão**
- Título: "Notificações e Comandos WhatsApp"
- Botão salvar: "Salvar Configurações"

**2. Número do assistente**
- Acima do campo "Número do WhatsApp", adicionar um bloco informativo com o número do assistente: **+1 (555) 934-6984**
- Texto: "Salve este número nos seus contatos e envie uma mensagem para começar a usar o assistente por voz ou texto."

**3. Novo botão "Instruções de Comando por Voz"** abaixo do salvar, com ícone `Mic`, variante `outline`

**4. Modal com instruções detalhadas (Dialog + ScrollArea)**

Conteúdo organizado em seções com exemplos literais:

**📊 Consultas**
- "Quais são minhas despesas do mês?"
- "Quanto tenho de despesas pendentes?"
- "Quantos eleitores eu tenho cadastrados?"
- "Quais meus compromissos da semana?"
- "Quais são meus lembretes pendentes?"
- "Me dê um resumo geral do meu dashboard"

**📝 Cadastros**
- "Cadastre o eleitor João Silva da cidade de Campina Grande, bairro Centro, telefone 83999999999, classificação positivo"
- "Crie um lembrete para ligar para o vereador amanhã, prioridade alta"
- "Agende um compromisso de reunião para amanhã às 14h no gabinete"
- "Cadastre o apoiador Maria Santos de João Pessoa, partido PSD, telefone 83988888888"
- "Cadastre uma despesa de R$ 1.500 para João Silva, município Campina Grande, cargo assessor"

**💡 Dicas**
- Pode enviar áudio ou texto
- Se faltar algum dado obrigatório, o assistente vai pedir
- Pergunte de forma natural, como se estivesse conversando

### Imports adicionais
- `Dialog, DialogContent, DialogHeader, DialogTitle` de `@/components/ui/dialog`
- `ScrollArea` de `@/components/ui/scroll-area`
- `Mic, Info` de `lucide-react`
- Estado `showInstructions` para controlar abertura do modal

