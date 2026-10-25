# Security Policy

## Supported versions

Attendora is a single-track project. Security fixes land on `main`.

## Reporting a vulnerability

Please **do not open a public issue** for a vulnerability that could expose data or allow
privilege escalation.

Use GitHub's private vulnerability reporting:

1. Go to the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Include the affected route/function, reproduction steps, and impact.

If private reporting is unavailable, contact the maintainer through the GitHub profile
[@Huzefman](https://github.com/Huzefman) and ask for a private channel. Do not include secrets
or real employee data in the first message.

## What to expect

- Acknowledgement within 5 business days.
- A coordinated disclosure timeline after the report is validated.
- Credit in the release notes if you want it.

## Security model

- **RLS everywhere.** Every table has Row Level Security enabled. Policies are in
  `supabase/migrations/`.
- **Service role is server-only.** It is read by Edge Functions and Node scripts, never by the
  browser bundle.
- **Team Pulse is aggregate-only.** `pulse_responses` has no admin row policy; admins call
  `get_pulse_summary()`.
- **Location is optional.** The default policy is `flag`. `off` discards coordinates.
- **Documents are private.** Presigned URLs with a short expiry.
- **No third-party analytics** or ad pixels are included.

## Demo data

`npm run seed:demo` creates synthetic `example.com` accounts. It is not intended for a
production workspace. If you run it on a real project, pass `--force` only when you understand
that it will add fictional people and records.

## Secrets

If you accidentally commit a secret:

1. Rotate it immediately (Supabase service-role key, Resend key, VAPID private key).
2. Remove it from the working tree.
3. Rewrite history if the repository is public. A leaked service-role key can bypass RLS.
