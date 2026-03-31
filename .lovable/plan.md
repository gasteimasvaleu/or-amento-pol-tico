

## Plano: Adicionar preço fallback no PaywallScreen

Arquivo: `src/components/paywall/PaywallScreen.tsx`

Onde hoje exibe `"Carregando preço..."` quando `priceLabel` é `null`, substituir por `"R$ 79,90"` como fallback fixo. Isso afeta dois pontos:

1. **Exibição do preço principal** — trocar `{priceLabel || "Carregando preço..."}` por `{priceLabel || "R$ 79,90"}`
2. **Texto do botão** — trocar `"Assinar via App Store"` (fallback) por `"Assinar — R$ 79,90/mês"`

