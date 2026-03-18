

## Plan

Add a back button to both `/equipe/assessores` and `/equipe/apoiadores` pages, navigating back to `/equipe`.

**Edit `src/pages/Assessores.tsx`**:
- Import `ArrowLeft` from lucide-react and `useNavigate` from react-router-dom
- Add a back button (arrow icon) before the page title in the header row

**Edit `src/pages/Apoiadores.tsx`**:
- Same changes: import `ArrowLeft` and `useNavigate`
- Add a back button before the title

Both will use `navigate("/equipe")` on click, matching the app's existing navigation patterns.

