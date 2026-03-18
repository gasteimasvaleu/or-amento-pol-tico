

## Problems Identified

1. **Profile not auto-created for Apple Sign In users** — The `handle_new_user` trigger exists but the Apple Sign In user (`e7ca6eee`) has no row in `profiles`. The trigger likely failed silently or wasn't properly installed. Additionally, Apple only sends the user's name on the **first** authorization, and the current trigger relies on `raw_user_meta_data->>'full_name'` which Apple doesn't populate (it uses a different structure).

2. **Home page reads name from wrong source** — `Home.tsx` line 44 reads `user?.user_metadata?.full_name` (from Supabase auth metadata), not from the `profiles` table. So even after updating the name in Dashboard, the Home page still shows "Usuario" because auth metadata was never updated.

3. **Apple private relay email** — The `g457tk7fm5@privaterelay.appleid.com` email is expected behavior when the user chooses "Hide My Email" during Apple Sign In. This is not a bug — it's Apple's privacy feature.

## Plan

### 1. Fix the trigger to be more resilient
- Update `handle_new_user()` to use `ON CONFLICT (id) DO NOTHING` so it never fails silently on duplicate/conflict scenarios.
- Ensure the fallback name comes from email prefix or "Usuario" when Apple doesn't provide a name.

### 2. Add profile creation fallback in the app code
- In `Login.tsx` `handleAppleSignIn`, after successful sign-in, ensure a profile row exists by doing an upsert (insert if not exists).
- Also save the `givenName`/`familyName` from Apple's first-auth response into both the `profiles` table AND `auth.updateUser({ data: { full_name } })` so the metadata stays in sync.

### 3. Fix Home page to read from profiles table
- Change `Home.tsx` to fetch the user's `full_name` from the `profiles` table instead of `user_metadata`.
- This ensures that when the user updates their name in Dashboard, it reflects everywhere.
- Create a small hook or inline query with `react-query` to fetch the profile name.

### 4. Sync auth metadata on Dashboard save
- In `DashboardGeral.tsx` `handleSave`, also call `supabase.auth.updateUser({ data: { full_name: profile.full_name } })` so that `user_metadata` stays in sync as a secondary source.

### Files to modify
- **Migration (new)**: Update `handle_new_user()` with `ON CONFLICT DO NOTHING`
- **`src/pages/Login.tsx`**: Add profile upsert after Apple Sign In + save name to auth metadata
- **`src/pages/Home.tsx`**: Fetch `full_name` from `profiles` table instead of `user_metadata`
- **`src/pages/DashboardGeral.tsx`**: Also update auth user metadata when saving profile

### Regarding the Apple relay email
This is normal Apple behavior. Users who choose "Hide My Email" will always show a relay address. No code change needed — it's working as designed.

