

## Plano: Página de Política de Privacidade + Rota no menu

### Arquivos

1. **Criar** `src/pages/PoliticaPrivacidade.tsx` — Página com conteúdo de política de privacidade, usando `Layout`, com seções padrão (coleta de dados, uso, compartilhamento, cookies, direitos do usuário, contato). Texto em português, estilizado com `prose` ou cards simples.

2. **Editar** `src/App.tsx` — Adicionar rota `/politica-de-privacidade` dentro de `ProtectedRoute` (ou sem proteção, se preferir acesso público). Import do novo componente.

3. **Editar** `src/components/layout/BottomNav.tsx` — Adicionar link "Política de Privacidade" com ícone `Shield` no menu "Mais", antes do botão "Sair".

4. **Editar** `src/components/layout/AppSidebar.tsx` — Adicionar item "Privacidade" com ícone `Shield` no menu da sidebar, antes do footer/logout.

4 arquivos, 1 novo + 3 editados.

