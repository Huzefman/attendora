# Environment Variables

Never commit real values. See `.env.example` for the full template.

- Frontend variables go in `.env.local` and are bundled by Vite.
- Edge Function secrets go in `supabase/functions/.env` locally, or in the Supabase dashboard
  under **Edge Functions → Secrets**.
- The Node scripts (`bootstrap:owner`, `seed:demo`) read `.env.local` via `node --env-file`.

## Frontend (Vite — exposed to the browser)

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public anon key — safe to expose; RLS enforces access |

Only `VITE_`-prefixed values are available in client code. Never prefix a secret with `VITE_`.

## Bootstrap and demo scripts

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key; bypasses RLS. Scripts only |
| `BOOTSTRAP_OWNER_EMAIL` | First owner email |
| `BOOTSTRAP_OWNER_PASSWORD` | First owner password, 12+ characters |
| `BOOTSTRAP_OWNER_FIRST_NAME` | Optional |
| `BOOTSTRAP_OWNER_LAST_NAME` | Optional |
| `BOOTSTRAP_OWNER_CODE` | Optional employee code override |
| `DEMO_EMAIL_DOMAIN` | Demo domain, default `example.com` |
| `DEMO_PASSWORD` | Password for all synthetic demo accounts, 12+ characters |

## Edge Functions (Deno — server-side only)

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Project URL (provided by Supabase runtime) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (provided by Supabase runtime) |
| `APP_NAME` | Display name in emails, default `Attendora` |
| `SITE_URL` | Public app URL used in email links |
| `SUPPORT_EMAIL` | Reply-to / VAPID subject |
| `EMAIL_FROM` | From address, e.g. `Attendora <noreply@example.com>` |
| `RESEND_API_KEY` | Optional; email is skipped when absent |
| `VAPID_PUBLIC_KEY` | Optional; push is skipped when absent |
| `VAPID_PRIVATE_KEY` | Optional |
| `APP_ENV` | `development` or `production` |

## Adding a new variable

1. Add it to `.env.example` with a placeholder.
2. Add it to this file with a one-line description.
3. If it is a secret, confirm it is only read inside `supabase/functions/` or `scripts/`.
4. Never add it to a `VITE_` name unless it is safe for every visitor to read.
