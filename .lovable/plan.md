## Objetivo

Adicionar um campo de foto da pessoa vinculada à despesa, posicionado acima do campo "Município" no formulário (`/despesas/nova` e também na edição, já que ambos usam o mesmo componente).

## O que será feito

1. **Banco de dados**: adicionar a coluna `foto_url` (texto, opcional) na tabela `despesas_politicas`.
2. **Storage**: criar o bucket público `despesas-fotos` com políticas RLS permitindo que cada usuário faça upload/exclusão apenas na sua própria pasta (`{user_id}/...`), com leitura pública.
3. **Formulário** (`DespesaForm.tsx`): novo bloco no topo, acima de "Município", com avatar circular (mostra preview ou ícone de usuário) e botão "Adicionar foto" / "Trocar foto" + opção de remover. Usa a função `pickImage` do `capacitorCamera.ts` (câmera nativa no iOS, seletor de arquivo na web), padrão já usado no app.
4. **Upload**: a imagem é enviada ao Storage no momento do salvamento (ou ao selecionar), e a URL pública é salva em `foto_url`.
5. **Exibição**: mostrar a foto (avatar pequeno) no detalhe mobile da despesa (Sheet) e como avatar na coluna "Responsável" da tabela.

## Detalhes técnicos

- `src/types/despesa.ts`: adicionar `foto_url?: string` em `Despesa` e `DespesaFormData`.
- `src/hooks/useDespesas.ts`: incluir `foto_url` no insert (`useCreateDespesa`) e no update.
- Conversão de DataURL → Blob via `dataUrlToBlob` antes do upload; caminho `${user.id}/${Date.now()}.jpg`.
- Campo totalmente opcional — despesas existentes continuam funcionando sem foto.
