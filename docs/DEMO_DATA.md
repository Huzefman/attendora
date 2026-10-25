# Demo Data

`npm run seed:demo` loads a synthetic workspace. It is intended for local development and
product demos.

## What it creates

- **6 fictional people** at `example.com`: one owner, one HR, four employees
- **Departments:** People Ops, Engineering, Design, Go-to-market
- **Designations:** People Partner, Engineering Lead, Software Engineer, Product Designer,
  Account Manager
- **Shift:** Standard day, 09:30–18:30, Monday–Friday, no grace period
- **Time-off types:** Paid time off, Sick leave, Unpaid leave
- **Holidays:** four synthetic dates in the current year
- **Balances:** opening balances for each person × type
- **Time-off requests:** one pending, one approved, one pending
- **Attendance:** the previous 10 weekdays for each person, including present, late, WFH,
  absent, on-leave, and one soft-flagged record
- **Location snapshot:** one outside-geofence snapshot, marked successful but flagged
- **Team Pulse:** six weeks of responses, with partial participation this week
- **Announcements:** welcome + pulse explainer
- **Onboarding checklist:** four generic items
- **Geofence:** a "Demo office" at a generic city coordinate, 300 m radius

Today is intentionally left unpunched so you can try check-in.

## Sign in

| Role | Email |
|---|---|
| Owner | `demo.owner@example.com` |
| HR | `priya@example.com` |
| Employee | `sam@example.com` |

Password: the `DEMO_PASSWORD` value from `.env.local`.

## Safety

- The script uses the service-role key and bypasses RLS. It is a local setup tool, not an app
  feature.
- It refuses to run when the project already has more than one employee, unless you pass
  `--force`.
- It sends no email, push, or external request. `ensureAuthUser` uses the Supabase Admin API
  only.
- It is not idempotent for attendance rows across different dates, but it upserts on
  `(employee_id, date)` so re-running on the same day is safe.
- Re-running refreshes the demo password for every demo account.

## Reset

The cleanest reset is a fresh Supabase project or a local `npx supabase db reset`. If you want
to remove only demo rows from an existing project, delete rows whose employee emails end in
`@example.com` in dependency order (`pulse_responses`, `location_snapshots`,
`attendance_records`, `leave_applications`, `leave_balances`, `announcements`, then
`employees`). Auth users are not deleted automatically.
