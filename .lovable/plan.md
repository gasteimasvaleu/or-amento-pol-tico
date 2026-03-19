

## Plano: Corrigir isolamento de dados nas despesas

### Problema
A tabela `despesas_politicas` tem RLS com `USING (true)` — qualquer usuário autenticado vê todas as despesas de todos os usuários. Além disso, todos os registros existentes têm `user_id = NULL`.

### Correções

**1. Migration SQL**
- Atualizar todos os registros existentes com `user_id = NULL` para o ID do Caio (`5b37e6e6-01d5-4ead-bd96-5b81d13e2324`), já que ele é o dono original dos dados
- Tornar `user_id` NOT NULL com default
- Substituir as 4 políticas RLS abertas por políticas vinculadas ao `user_id`:
  - SELECT: `auth.uid() = user_id`
  - INSERT: `auth.uid() = user_id`
  - UPDATE: `auth.uid() = user_id`
  - DELETE: `auth.uid() = user_id`

**2. Código (useDespesas.ts e hooks relacionados)**
- Garantir que ao criar uma despesa, o `user_id` seja enviado com `(await supabase.auth.getUser()).data.user.id`
- Verificar `useCreateDespesa` para incluir `user_id` no insert

**3. Código (DespesaForm / NovaDespesa)**
- Nenhuma mudança visual necessária, apenas garantir que o `user_id` seja passado no mutation

### Resultado
Cada usuário verá apenas suas próprias despesas, e os dados existentes serão atribuídos ao Caio.

