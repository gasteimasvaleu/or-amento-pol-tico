

## Plan

**Edit `src/pages/Assessores.tsx`**: Add a subtitle below the "Assessores" title showing the count, matching the pattern in Apoiadores.

Change the title area (around line 33-35) from just `<h1>` to include a subtitle:
```tsx
<div>
  <h1 className="text-xl font-bold text-foreground">Assessores</h1>
  <p className="text-xs text-muted-foreground">
    {assessores.length} assessor{assessores.length !== 1 ? "es" : ""} cadastrado{assessores.length !== 1 ? "s" : ""}
  </p>
</div>
```

Also adjust the title size from `text-2xl` to `text-xl` to match Apoiadores.

