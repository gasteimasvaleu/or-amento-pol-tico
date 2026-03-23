

## Plano: Cadastro Institucional com Token Único

### Fluxo
1. Você (admin) gera tokens na tabela `convites_institucionais` com validade de 1 ano
2. Envia link tipo `seuapp.com/cadastro-institucional?token=ABC123`
3. O usuário abre, preenche nome/email/senha, o sistema valida o token
4. Ao cadastrar: cria usuário no Auth, profile via trigger, e insere na `subscribers` com `status = 'active'` e `expires_at` = data definida no convite
5. Marca o token como `usado`

### 1. Migração: tabela `convites_institucionais`

```sql
CREATE TABLE public.convites_institucionais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  orgao text NOT NULL,
  duracao_dias integer NOT NULL DEFAULT 365,
  usado boolean NOT NULL DEFAULT false,
  usado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  usado_em timestamptz
);

ALTER TABLE public.convites_institucionais ENABLE ROW LEVEL SECURITY;

-- Leitura pública (necessário para validar token sem estar logado)
CREATE POLICY "Anyone can read convites by token"
  ON public.convites_institucionais FOR SELECT
  TO anon, authenticated
  USING (true);
```

Inserção/update dos convites será feita via SQL Editor ou futuramente via painel admin (somente service_role ou admin).

### 2. Edge Function: `cadastro-institucional`

Recebe `{ token, fullName, email, password }` e:
- Valida token (existe, não usado)
- Cria usuário via `supabase.auth.admin.createUser` (confirma email automaticamente)
- Insere na `subscribers` com `status = 'active'`, `expires_at = now() + duracao_dias`
- Marca convite como `usado = true`, `usado_por`, `usado_em`
- Retorna sucesso ou erro

Usa `SUPABASE_SERVICE_ROLE_KEY` (já configurado nos secrets).

### 3. Nova página: `/cadastro-institucional`

- Rota pública em `App.tsx`
- Lê `?token=` da URL
- Se token inválido/usado: mostra mensagem de erro
- Se válido: formulário com nome do órgão (readonly), nome completo, email, senha
- Ao submeter: chama edge function
- Sucesso: redireciona para `/login` com toast de confirmação

### 4. Estrutura dos arquivos

- `supabase/functions/cadastro-institucional/index.ts` — edge function
- `src/pages/CadastroInstitucional.tsx` — página do formulário
- `src/App.tsx` — nova rota `/cadastro-institucional`

### Como gerar convites (para você, admin)

No SQL Editor do Supabase:
```sql
-- Gerar 50 convites para um órgão
INSERT INTO convites_institucionais (orgao, duracao_dias)
SELECT 'Câmara Municipal de XYZ', 365
FROM generate_series(1, 50);

-- Ver tokens gerados
SELECT token, orgao, usado FROM convites_institucionais WHERE orgao = 'Câmara Municipal de XYZ';
```

Cada token gera um link: `https://seuapp.com/cadastro-institucional?token=<token>`

