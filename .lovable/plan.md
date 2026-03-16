

## Plano: Substituir ícone + texto pela logo no header

### Alterações

#### 1. `src/components/layout/Layout.tsx` (header mobile)
- Remover o ícone `Landmark` dentro do `div` e o `span` "Unale"
- Substituir por uma tag `<img>` com a URL da logo: `https://wrriittiqsmzbapbrcwm.supabase.co/storage/v1/object/public/criativos/logonavbar.png`
- Ajustar altura da imagem (~28-32px) para caber no header

#### 2. `src/components/layout/AppSidebar.tsx` (sidebar desktop)
- Substituir o ícone `Landmark` + textos "Unale" / "Gestão Parlamentar" pela mesma imagem da logo
- Quando sidebar estiver colapsada, mostrar versão menor da logo

#### 3. `src/components/layout/BottomNav.tsx` (se aplicável)
- O BottomNav não tem logo, então sem alteração necessária

