# Contributing

Thanks for taking a look at Attendora. This is a small, opinionated project; the best
contributions are focused bug fixes, accessibility improvements, and documentation.

## Before you start

- Read [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md) for the architecture and non-negotiable rules.
- Check open issues to avoid duplicate work.
- For a large change, open an issue first so the direction can be discussed.

## Development

```bash
npm install
cp .env.example .env.local   # fill in your own Supabase project
npm run dev
```

You need a Supabase project to exercise authenticated flows. The public landing page works
without one.

## Quality bar

Run before opening a pull request:

```bash
npm run ci
```

This runs TypeScript, ESLint, and a production build. Warnings are acceptable; errors are not.

## Data and privacy

- Use synthetic data only. `npm run seed:demo` creates `example.com` accounts.
- Never include real employee names, emails, phone numbers, addresses, bank details, attendance
  records, or production data in issues, screenshots, commits, or test fixtures.
- Do not weaken RLS to make a test pass.
- Do not add analytics, tracking pixels, or a third-party CRM.

## Pull requests

- Keep the change scoped.
- Explain the user-visible behavior and any migration.
- Include a screenshot only if it uses the synthetic demo workspace.
- Note if you could not run a migration or regenerate types.
- Update the relevant doc in `docs/` when behavior changes.

## Commit style

See [`CONVENTIONS.md`](./CONVENTIONS.md). Use `feat:`, `fix:`, `docs:`, `chore:`, etc.

## License

By contributing, you agree that your contribution is licensed under the MIT License.
