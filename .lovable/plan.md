

## Plano: Criar página /lembretes com CRUD completo

### 1. Banco de dados — nova tabela `lembretes`

Criar via migration:

```sql
CREATE TABLE public.lembretes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  descricao text,
  data_lembrete timestamp with time zone NOT NULL,
  hora_lembrete time,
  prioridade text NOT NULL DEFAULT 'media',
  categoria text NOT NULL DEFAULT 'geral',
  concluido boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.lembretes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lembretes" ON public.lembretes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lembretes" ON public.lembretes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lembretes" ON public.lembretes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lembretes" ON public.lembretes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_lembretes_updated_at BEFORE UPDATE ON public.lembretes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Novos arquivos

**`src/types/lembrete.ts`** — Tipo, constantes de prioridade/categoria com cores:
- Prioridades: `baixa`, `media`, `alta`, `urgente`
- Categorias: `geral`, `reuniao`, `ligacao`, `documento`, `prazo`, `pessoal`

**`src/hooks/useLembretes.ts`** — Hook CRUD seguindo o padrão de `useCompromissos` (query, create, update, delete mutations)

**`src/pages/Lembretes.tsx`** — Página completa com:
- Header com titulo + botao "Novo"
- Lista de lembretes agrupados: "Pendentes" e "Concluídos"
- Cada card mostra: titulo, data/hora, badge prioridade (colorido), badge categoria, checkbox para marcar concluído
- Botões editar/excluir em cada card
- Modal Dialog completo com campos: Título*, Descrição, Data*, Hora, Prioridade (select), Categoria (select)
- AlertDialog para confirmação de exclusão
- Estado vazio com ilustração

### 3. Arquivos editados

**`src/App.tsx`** — Adicionar rota `/lembretes` protegida

**`src/components/layout/AppSidebar.tsx`** — Adicionar link "Lembretes" com ícone `Bell`

**`src/components/layout/BottomNav.tsx`** — Adicionar "Lembretes" no menu "Mais"

### Resultado
Página completa de lembretes com modal rico, CRUD funcional, visual consistente com o resto do app (cards com border-border, badges coloridos, rounded-xl).

