

## Problem
The `/despesas` page has no button to add a new expense. The header section only shows a title and subtitle, with no action button linking to `/despesas/nova`.

## Plan

**Edit `src/pages/Despesas.tsx`**:
- Import `Link` from `react-router-dom`, `Plus` from `lucide-react`, and `Button` from the UI components
- Add a "Nova Despesa" button next to the page title, using a flex layout to place the title on the left and the button on the right
- The button links to `/despesas/nova`

This matches the pattern already used in the `Header.tsx` component and the route already exists in `App.tsx`.

