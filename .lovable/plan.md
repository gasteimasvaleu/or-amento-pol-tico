

## Plano: Agente IA no WhatsApp

### Pré-requisito
- Conectar ElevenLabs como connector (para STT de áudios recebidos)

### 1. Migration: tabela `whatsapp_conversas`

```sql
CREATE TABLE public.whatsapp_conversas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL, -- 'user' ou 'assistant'
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.whatsapp_conversas ENABLE ROW LEVEL SECURITY;
-- Apenas service_role acessa (webhook não tem JWT)
CREATE POLICY "Service role full access" ON public.whatsapp_conversas
  FOR ALL TO service_role USING (true) WITH CHECK (true);
```

### 2. Reescrever `supabase/functions/whatsapp-webhook/index.ts`

Transformar de "log e ignora" para agente completo:

- **Parse da mensagem**: extrair `Body`, `From`, `NumMedia`, `MediaUrl0`, `MediaContentType0`
- **Identificar usuário**: buscar `notificacao_config` onde `whatsapp_phone` = número remetente (sem `whatsapp:` prefix) → obter `user_id`
- **Processar áudio** (se `NumMedia > 0` e tipo áudio): baixar via `MediaUrl0`, enviar para ElevenLabs STT (`scribe_v2`) → transcrever para texto
- **Carregar contexto do usuário** (via `service_role`):
  - Contagem de eleitores (total, por cidade, por classificação)
  - Despesas do mês atual (total, pendentes, atrasadas)
  - Compromissos dos próximos 7 dias
  - Lembretes pendentes
  - Total de apoiadores e assessores
- **Buscar histórico**: últimas 10 mensagens de `whatsapp_conversas` para o user
- **Chamar Lovable AI Gateway** (`google/gemini-3-flash-preview`) com:
  - System prompt em português instruindo sobre capacidades (consulta + cadastro)
  - Contexto resumido do banco
  - Histórico de conversa
  - Mensagem atual
  - Tool calling para ações estruturadas (criar eleitor, lembrete, compromisso, apoiador, despesa)
- **Executar ações**: se a IA retornar tool call, fazer INSERT no Supabase
- **Salvar mensagens**: gravar user + assistant em `whatsapp_conversas`
- **Responder via Twilio**: usar Content API (mesmo padrão atual de `whatsapp-notificacoes`) para enviar resposta de texto
- **Rate limiting**: máximo 30 msgs/hora por user (contagem via `whatsapp_conversas`)
- **Fallback**: se user não cadastrado → resposta padrão "Número não cadastrado"

### 3. System prompt do agente

Instruções em português com:
- Conhecimento das tabelas: eleitores, despesas_politicas, compromissos, lembretes, apoiadores, assessores, cidades, demandas
- Consultas: totais, filtros por cidade/bairro/classificação, resumo do dia/semana/mês
- Cadastros: eleitor, lembrete, compromisso, apoiador, despesa (campos obrigatórios e opcionais)
- Tom: profissional, conciso, usa emojis moderados
- Limitações claras: não edita/exclui registros (v1)

### 4. Tool definitions para structured output

5 tools definidos via tool calling:
- `criar_eleitor(nome, cidade, bairro?, telefone?, classificacao?)`
- `criar_lembrete(titulo, data_lembrete, prioridade?, descricao?)`
- `criar_compromisso(titulo, data_inicio, tipo?, local?, descricao?)`
- `criar_apoiador(nome, cidade?, telefone?, partido?)`
- `criar_despesa(responsavel, municipio, cargo, valor, tipo?, conta_pix?)`

### 5. Atualizar `supabase/config.toml`

Já tem `[functions.whatsapp-webhook] verify_jwt = false` — manter.

### Resultado

Usuário manda "quantos eleitores tenho em João Pessoa?" → recebe "Você tem 47 eleitores em João Pessoa (32 positivos, 10 neutros, 5 negativos)."

Usuário manda áudio "cadastra um lembrete pra amanhã: ligar pro prefeito" → transcreve → cria lembrete → responde "Lembrete criado: 'Ligar pro prefeito' para 23/03/2026."

