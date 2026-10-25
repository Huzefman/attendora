# Conventions

Naming, commits, and branching. For architectural conventions (query keys, Zod co-location,
Edge Function shapes, date handling), see `docs/ARCHITECTURE.md`.

## File naming

- Components: PascalCase — `EmployeeForm.tsx`
- Hooks: camelCase, `use` prefix — `useEmployees.ts`
- Utils/formatters: camelCase — `formatDate.ts`
- Pages: PascalCase, `Page` suffix — `EmployeeDetailPage.tsx`
- Feature folders: lowercase domain name — `src/features/employees/`

## Supabase

- Frontend: one client only — `import { supabase } from '@/lib/supabase'`.
- Edge Functions: the service-role client from `supabase/functions/_shared/supabase.ts`.
  Never expose the service-role key to the browser.
- Regenerate types after every migration: `npm run types:gen`.

## TypeScript

- Never use `any`.
- DB types come from `src/types/database.types.ts`, re-exported via `src/types/index.ts`.
- All component props and Zod-inferred payloads must be explicit.
- Prefer narrow types and `unknown` + narrowing over assertions.

## Commits

- `feat:` — new feature
- `fix:` — bug fix
- `perf:` — performance
- `refactor:` — no behavior change
- `docs:` — documentation only
- `test:` — tests
- `chore:` — tooling, deps, config

Keep commits focused. One logical change per commit.

## Branches

- `main` is the release branch and should always pass `npm run ci`.
- Branch from `main` for a change: `feat/<short-name>` or `fix/<short-description>`.
- Open a pull request; squash-merge when the change is complete.
- Delete the branch after merge.

## Pull requests

- Describe the user-visible change and the data/security impact.
- Include screenshots only if they contain synthetic demo data.
- Note any migration that must be applied.
- Confirm `npm run ci` passes.

## Data hygiene

- Demo data must be synthetic. Use `example.com` emails and fictional names.
- Never commit `.env.local`, service-role keys, database dumps, attendance backups, or
  screenshots containing real people.
- No hard deletes in app code; use `is_active`.
