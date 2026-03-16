

## Plano: Criar página /gestao-de-eleitores

### Banco de Dados (4 tabelas + 1 bucket)

**`eleitores`**: id, user_id, nome, telefone, endereco, bairro, created_at, updated_at
**`demandas`**: id, user_id, eleitor_id (FK), titulo, descricao, responsavel, status ('novo'/'em_andamento'/'resolvido'), created_at, updated_at
**`demanda_historico`**: id, demanda_id (FK), descricao, created_at
**`demanda_anexos`**: id, demanda_id (FK), arquivo_url, arquivo_nome, arquivo_tipo, created_at

Bucket Storage: `demandas` (público). RLS: `auth.uid() = user_id` em eleitores e demandas; demanda_historico e demanda_anexos via join com demandas.

### Arquivos Novos

1. **`src/types/eleitor.ts`** — tipos para Eleitor, Demanda, DemandaHistorico, DemandaAnexo
2. **`src/hooks/useEleitores.ts`** — CRUD eleitores com react-query (padrão useApoiadores)
3. **`src/hooks/useDemandas.ts`** — CRUD demandas, histórico e upload de anexos
4. **`src/pages/GestaoEleitores.tsx`** — lista de eleitores com busca, badge de demandas abertas
5. **`src/components/eleitores/EleitorModal.tsx`** — modal cadastro (nome, telefone, endereço, bairro)
6. **`src/components/eleitores/EleitorDetalhe.tsx`** — sheet com dados do eleitor + lista de demandas
7. **`src/components/eleitores/DemandaModal.tsx`** — modal para abrir chamado (título, descrição, responsável)
8. **`src/components/eleitores/DemandaDetalhe.tsx`** — detalhe com status editável, timeline de histórico, upload de anexos

### Arquivos Alterados

- **`src/App.tsx`** — rota `/gestao-de-eleitores`
- **`src/components/layout/AppSidebar.tsx`** — item no menu lateral
- **`src/components/layout/BottomNav.tsx`** — item no menu "Mais"

Sem card na página principal.

