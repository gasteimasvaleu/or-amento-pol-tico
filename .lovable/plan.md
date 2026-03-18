

## Plan

Move the "Nova Despesa" button out of the header flex row and place it as a full-width block between the title/subtitle and the `MonthlyStats` cards.

**Edit `src/pages/Despesas.tsx`** (lines 34-47):
- Remove the button from the `flex justify-between` header
- Place the button as a standalone full-width element below the title block
- Use `w-full` on the Button so it spans the entire horizontal space

