

## Criar Página /midia - Galeria de Mídia do Parlamentar

### Visão Geral

Página completa para o parlamentar gerenciar mídias visuais: fotos de eventos, artes de design, logomarcas, materiais de campanha, etc. Com upload de arquivos para Supabase Storage, categorização, visualização em grid/galeria e modal de preview.

### 1. Migration - Tabela `midias`

```sql
CREATE TABLE public.midias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  descricao text,
  categoria text NOT NULL DEFAULT 'foto',
  tags text[],
  arquivo_url text NOT NULL,
  arquivo_nome text NOT NULL,
  arquivo_tipo text,
  arquivo_tamanho bigint,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.midias ENABLE ROW LEVEL SECURITY;
-- RLS: CRUD apenas para o próprio usuário
-- Trigger update_updated_at
```

Storage bucket `midias` (público) para armazenar os arquivos.

### 2. Categorias de Mídia

- **Fotos de Eventos** - registros de audiências, reuniões, visitas
- **Artes e Design** - peças gráficas, banners, posts para redes sociais
- **Logomarcas** - logos pessoais, de partido, de campanha
- **Documentos Visuais** - infográficos, apresentações
- **Vídeos/Mídia** - thumbnails e links de vídeo

### 3. Nova Página `src/pages/Midia.tsx`

- Header com título, botão "Adicionar Mídia" e filtros por categoria
- Grid responsivo de cards com thumbnail, título, categoria (badge colorido) e data
- Modal/Dialog de upload com: campo de arquivo (drag & drop), título, descrição, seleção de categoria, tags
- Modal de preview ao clicar na mídia (imagem ampliada, detalhes, botões editar/excluir)
- Busca por título/tags
- Hook `useMidias` para CRUD via Supabase + upload para Storage

### 4. Navegação

- Rota `/midia` no `App.tsx` com `ProtectedRoute`
- Item "Mídia" no `BottomNav` (substituir ou adicionar ao menu "Mais")
- Item "Mídia" no `AppSidebar`
- Card "Mídia" na Home (cor amber/orange)

### 5. Arquivos a Criar/Editar

| Arquivo | Ação |
|---------|------|
| `supabase/migrations/...` | Migration: tabela `midias` + bucket `midias` + RLS |
| `src/types/midia.ts` | Tipos e categorias |
| `src/hooks/useMidias.ts` | Hook CRUD + upload |
| `src/pages/Midia.tsx` | Página completa |
| `src/App.tsx` | Adicionar rota |
| `src/pages/Home.tsx` | Adicionar card |
| `src/components/layout/AppSidebar.tsx` | Adicionar item menu |
| `src/components/layout/BottomNav.tsx` | Adicionar "Mídia" ao menu "Mais" |

