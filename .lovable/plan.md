

## Plano: Reorganizar autenticação

### Alterações

1. **`src/pages/Login.tsx`**
   - Remover botão "Criar nova conta" e toda lógica de `isSignUp`
   - Remover botão "Esqueceu a senha?" e toda lógica de `isForgot` / `handleForgotPassword`
   - Manter apenas o formulário de login simples

2. **`src/pages/Cadastro.tsx`** (novo)
   - Criar página com formulário de cadastro (nome, email, senha)
   - Reutilizar o mesmo estilo visual do Login
   - Incluir link "Já tem conta? Entrar" apontando para `/login`

3. **`src/App.tsx`**
   - Adicionar rota `/cadastro` com o componente Cadastro (rota pública)
   - Remover rota `/reset-password` e import do ResetPassword

4. **`src/pages/ResetPassword.tsx`** — pode ser ignorado/removido (remover import em App.tsx é suficiente)

