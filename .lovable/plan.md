

## Criar Pagina /agenda - Agenda de Compromissos

### 1. Migration - Tabela `compromissos`

Criar tabela no Supabase:

```sql
CREATE TABLE public.compromissos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  descricao text,
  data_inicio timestamptz NOT NULL,
  data_fim timestamptz,
  local text,
  tipo text NOT NULL DEFAULT 'reuniao',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.compromissos ENABLE ROW LEVEL SECURITY;

-- RLS: usuarios veem/editam apenas seus compromissos
CREATE POLICY "Users can view own compromissos" ON public.compromissos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own compromissos" ON public.compromissos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own compromissos" ON public.compromissos FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own compromissos" ON public.compromissos FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_compromissos_updated_at BEFORE UPDATE ON public.compromissos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Nova pagina `src/pages/Agenda.tsx`

- Layout com calendario mensal (usando `Calendar` do shadcn) no topo/lateral
- Dias com compromissos marcados com indicador visual (dot)
- Ao clicar num dia, lista os compromissos daquele dia abaixo
- Dialog/Sheet para cadastrar novo compromisso com campos: titulo, descricao, data/hora inicio, data/hora fim, local, tipo (reuniao, audiencia, evento, visita, outro)
- Botao de adicionar compromisso
- Possibilidade de editar e excluir compromissos existentes
- Hook `useCompromissos` para CRUD via Supabase

### 3. Rota e Navegacao

- Adicionar rota `/agenda` no `App.tsx` com `ProtectedRoute`
- Adicionar item "Agenda" no `BottomNav` (entre Dashboard e Despesas)
- Adicionar item "Agenda" no `AppSidebar`
- Adicionar card "Agenda" na Home

### 4. Tipos

- Criar `src/types/compromisso.ts` com a interface

