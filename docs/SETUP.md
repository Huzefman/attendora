# Setup Guide

A longer version of the quick start. You need a Supabase project; there is no hosted Attendora
service to sign up for.

## 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com). Note:

- Project URL
- Anon/public key
- Service-role key (server-side only)

## 2. Clone and install

```bash
git clone https://github.com/Huzefman/attendora.git
cd attendora
npm install
```

Node 20+ is required; Node 22 is recommended.

## 3. Environment

```bash
cp .env.example .env.local
```

Set the frontend and script values:

```dotenv
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
BOOTSTRAP_OWNER_EMAIL=you@example.com
BOOTSTRAP_OWNER_PASSWORD=<at-least-12-characters>
```

`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. Keep it out of the browser and out of git.

## 4. Apply migrations

Using the Supabase CLI through `npx`:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Or open the Supabase SQL editor and run the files in `supabase/migrations/` in numeric order.
Migrations are additive and idempotent where practical.

Then run `supabase/seed.sql` to insert the default `app_config` rows. `db push` does not run
seed files automatically on a remote project.

## 5. Create the owner

```bash
npm run bootstrap:owner
```

The script creates the auth user with the Admin API and upserts the `employees` row with
`role = 'owner'`. It is safe to run again to reset the owner password.

## 6. Optional demo workspace

```bash
# Add DEMO_PASSWORD to .env.local (12+ characters) first
npm run seed:demo
```

The seed refuses to run on a project with more than one employee unless you pass `--force`.
It creates only synthetic `example.com` accounts. See [DEMO_DATA.md](./DEMO_DATA.md).

## 7. Edge Functions

Deploy all functions:

```bash
npx supabase functions deploy
```

Set secrets:

```bash
npx supabase secrets set \
  APP_NAME=Attendora \
  SITE_URL=http://localhost:5173 \
  SUPPORT_EMAIL=support@example.com \
  EMAIL_FROM="Attendora <noreply@example.com>"
```

Optional secrets:

```bash
npx supabase secrets set RESEND_API_KEY=<key>
npx supabase secrets set VAPID_PUBLIC_KEY=<key> VAPID_PRIVATE_KEY=<key>
```

Without `RESEND_API_KEY`, email sends are skipped. Without VAPID keys, push sends are skipped.
The rest of the app works.

## 8. Auth settings

In Supabase Dashboard → Authentication:

- Enable email/password sign-in.
- For local/demo use, disable "Confirm email" if you want immediate sign-in.
- Add your site URL to the redirect allow list:
  - `http://localhost:5173`
  - your production URL when you have one
- For password reset emails, configure SMTP. Resend works:
  - Host `smtp.resend.com`
  - Port `587`
  - Username `resend`
  - Password: your Resend API key

## 9. Run

```bash
npm run dev
```

- Landing page: `http://localhost:5173/`
- Login: `http://localhost:5173/login`

## 10. Production notes

- Deploy the frontend to any static host (Vercel, Netlify, Cloudflare Pages, S3 + CDN).
- Set the frontend env vars in the host.
- Set `SITE_URL` in Edge Function secrets to the public URL so email links resolve.
- Do not use the demo seed on a production workspace.
- Review `SECURITY.md` before inviting real users.

## Troubleshooting

**`Missing SUPABASE_URL`** — `.env.local` is not being read. `npm run dev` and the scripts read
it from the project root.

**`new row violates row-level security policy`** — you are signed in as a role without access,
or the policy is wrong. Inspect the table's policies in `supabase/migrations/`.

**`function get_pulse_summary does not exist`** — apply migration `0043_team_pulse.sql` and
regenerate types.

**`attendance_location_policy` missing** — apply migration `0044_attendance_location_policy.sql`
or run `supabase/seed.sql`.

**Types are stale** — `npm run types:gen` after applying migrations. If you cannot run the CLI,
update `src/types/database.types.ts` manually and mention it in the PR.
