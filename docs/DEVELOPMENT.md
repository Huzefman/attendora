# Development Handbook

The notes a contributor needs before changing Attendora. For product docs, start with the
[README](../README.md).

## Stack

- React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Radix UI
- TanStack Query, React Hook Form, Zod, Lucide, Leaflet
- Supabase Postgres, RLS, Auth, Storage, Edge Functions (Deno)
- Resend and Web Push are optional; the app runs without them

There is no separate backend server. Supabase is the backend.

## Commands

```bash
npm run dev            # Vite dev server
npm run typecheck      # tsc --noEmit
npm run lint           # ESLint
npm run build          # typecheck + production build
npm run ci             # typecheck + lint + build
npm run bootstrap:owner
npm run seed:demo
npm run types:gen
```

Node 20+ is required; Node 22 is recommended. Environment values live in `.env.local` and are
documented in [ENV.md](../ENV.md).

## Layout

```text
src/
  components/layout/     App shell, sidebar, header, command palette, guards
  components/ui/         shadcn/ui primitives only
  features/<domain>/     api.ts, hooks.ts, mutations.ts, schemas/, components/, types
  pages/                 Thin route-level pages
  hooks/                 useAuth, useRole, useMediaQuery, use-toast
  lib/                   supabase.ts, queryClient.ts, edge.ts, brand.ts, utils.ts
  types/                 database.types.ts (generated) + app types
supabase/
  migrations/            Numbered SQL migrations
  functions/             Edge Functions
    _shared/             auth, response, email, push, notify, audit, shift,
                         working-days, geo, ip, holiday, attendance, config, app
  seed.sql               Default app_config rows
scripts/                 bootstrap-owner.mjs, seed-demo.mjs
docs/                    Architecture, schema, rules, roles, screens, edge contracts
```

## Non-negotiable rules

1. **RLS is always on.** Fix the policy; never disable RLS to make a feature work.
2. **Server time comes from Edge Functions.** Never trust client timestamps for
   `check_in_time`, `check_out_time`, `applied_at`, etc.
3. **No hard deletes.** Set `is_active = false` and filter on it.
4. **Business rules live in Edge Functions or database constraints**, never only in React.
5. **Documents use presigned URLs.** Never expose raw storage paths.
6. **No `axios`.** Use `@supabase/supabase-js` or native `fetch`.
7. **No Express/FastAPI/Node server.** Supabase is the entire backend.
8. **Supabase Auth owns sessions.** Do not add a parallel auth store or persist tokens yourself.
   The mount-time `setSession` recovery in `src/App.tsx` is a single, isolated workaround for a
   known browser-state issue.
9. **Regenerate DB types after every migration:** `npm run types:gen`.
10. **No real people or production data in this repository.** Demo data is synthetic.

## Team Pulse invariants

- `pulse_responses` is readable and writable only by the employee who owns the row.
- Owner, HR, and system_admin must use `get_pulse_summary(weeks)`; they have no row-level
  select policy on the table.
- The function returns `week_start`, `average_score`, and `response_count` only.
- Do not add an admin UI for individual pulse responses. That would break the privacy promise.

## Location policy

`app_config.attendance_location_policy` is `off`, `flag`, or `strict`:

- `off` — ignore coordinates and do not store them.
- `flag` (default) — allow check-in; set `attendance_records.is_geo_flagged` when
  location is unavailable or outside the geofence.
- `strict` — block with `403` (legacy behavior).

`check-in` reads this through `_shared/config.ts`. Keep the client tolerant: location is
optional context, and the server decides whether it is a flag or a block.

## Where to read more

- [Architecture](./ARCHITECTURE.md) — state, query keys, folder patterns, date handling
- [Database schema](./DATABASE_SCHEMA.md) — tables, columns, relationships
- [Business rules](./BUSINESS_RULES.md) — formulas and BR-XXX rules
- [Role rules](./ROLE_RULES.md) — role matrix and RLS strategy
- [Screen inventory](./SCREEN_INVENTORY.md) — routes and screens per role
- [Edge Function contracts](./EDGE_FUNCTIONS.md) — request/response contracts and schedules
- [Conventions](../CONVENTIONS.md) — naming, commits, branches
- [Environment variables](../ENV.md)

## Working style

- Keep changes scoped. Do not mix unrelated modules in one branch.
- Preserve existing behavior unless the task explicitly changes it.
- Run `npm run ci` before proposing a commit.
- Never commit secrets, `.env.local`, `dist/`, screenshots with real data, or database dumps.
