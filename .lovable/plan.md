

## Plano: Botão "Ver detalhes" no mobile

Abordagem moderna e limpa. No mobile, a tabela mostra apenas **Município, Responsável, Cargo** + um botão de olho/expand que abre um **Sheet** (modal deslizante de baixo) com os detalhes completos. No desktop, tudo continua igual.

### Alterações em `src/components/despesas/DespesasTable.tsx`

- Importar `useIsMobile`, `Sheet` components
- State para controlar qual despesa está selecionada no modal
- **Mobile (< 768px)**:
  - Esconder colunas: Tipo, Próximo Pagamento, Status, Valor, Ações (via `className="hidden md:table-cell"`)
  - Adicionar coluna fixa com botão `Eye` icon que abre Sheet
- **Sheet de detalhes** (bottom sheet no mobile):
  - Município + Responsável (header)
  - Cargo, Tipo (badge), Valor (destaque), Data pagamento, Status (badge)
  - Botões de ação: Marcar pago / Editar / Excluir
- **Desktop**: sem alterações, colunas extras visíveis, coluna do botão Eye escondida (`md:hidden`)

### Resultado
- Tabela compacta no mobile sem scroll horizontal (3 colunas + ícone)
- Detalhes completos acessíveis via sheet deslizante
- Desktop inalterado

