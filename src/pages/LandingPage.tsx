import { useEffect } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  Command,
  Github,
  HeartPulse,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { useAuthStore } from '@/hooks/useAuth'
import { APP_NAME, APP_TAGLINE, REPO_URL } from '@/lib/brand'

const FEATURES = [
  {
    icon: Users,
    title: 'A people directory that stays current',
    body: 'Roles, departments, documents, lifecycle events, and profile change requests in one auditable record.',
  },
  {
    icon: Clock,
    title: 'Attendance without the admin drag',
    body: 'Check-in, check-out, shifts, corrections, and anomaly flags. Clear for employees, quick for HR.',
  },
  {
    icon: CalendarDays,
    title: 'Time off that adds up',
    body: 'Balances, accruals, half-days, holidays, and cancellation flows with real guardrails.',
  },
  {
    icon: HeartPulse,
    title: 'Team pulse, not surveillance',
    body: 'A lightweight weekly check-in that gives leads a trendline — never an individual microscope.',
  },
  {
    icon: BarChart3,
    title: 'Reports you can act on',
    body: 'Attendance, headcount, heatmaps, and absence trends. Export a CSV when a conversation needs numbers.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy-first by default',
    body: 'Row-level security in Postgres. Optional location context, soft by default. Your data stays in your project.',
  },
]

const STACK = ['React 18', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Postgres RLS', 'Edge Functions']

export default function LandingPage() {
  const employee = useAuthStore((s) => s.employee)
  const isLoading = useAuthStore((s) => s.isLoading)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && employee) navigate('/dashboard', { replace: true })
  }, [employee, isLoading, navigate])

  if (!isLoading && employee) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" />
            <span className="text-[15px] font-semibold tracking-tight">{APP_NAME}</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#pulse" className="transition-colors hover:text-foreground">Team pulse</a>
            <a href="#privacy" className="transition-colors hover:text-foreground">Privacy</a>
            <a href="#open-source" className="transition-colors hover:text-foreground">Open source</a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 surface-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
          <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl gap-14 px-5 pb-20 pt-16 md:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                Open-source HR for small teams
              </div>
              <h1 className="max-w-xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
                The calm HR workspace your team deserves.
              </h1>
              <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
                {APP_NAME} brings people, attendance, time off, and team insights into one
                focused product — with the guardrails of a real HR system and none of the
                enterprise weight.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-indigo-500/20 transition-transform hover:-translate-y-0.5"
                >
                  Open {APP_NAME}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <Github className="h-4 w-4" />
                  View source
                </a>
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <LockKeyhole className="h-3.5 w-3.5" />
                Self-hosted on your own Supabase project. No vendor lock-in.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-indigo-500/20 via-transparent to-teal-400/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border bg-background/90 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-3 text-[11px] text-muted-foreground">app.attendora.local</span>
                  <span className="ml-auto flex items-center gap-1 rounded-md border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    <Command className="h-2.5 w-2.5" />K
                  </span>
                </div>
                <div className="grid grid-cols-[64px_1fr]">
                  <div className="space-y-2 border-r bg-slate-950 p-2.5">
                    <img src="/favicon.svg" alt="" className="mb-3 h-8 w-8 rounded-lg" />
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-7 rounded-md ${i === 0 ? 'bg-white/15' : 'bg-white/[0.04]'}`} />
                    ))}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Monday, 24 October</p>
                        <p className="text-sm font-semibold">Good morning, Ada</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        Checked in
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        ['Present', '14'],
                        ['Time off', '2'],
                        ['Pulse', '4.6'],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg border bg-card p-2">
                          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
                          <p className="text-lg font-semibold">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border bg-card p-2.5">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[10px] font-medium">Today&apos;s team</p>
                        <span className="text-[9px] text-muted-foreground">Attendance</span>
                      </div>
                      {[
                        ['Priya S.', 'Product', 'Present', 'bg-emerald-500'],
                        ['Marco L.', 'Engineering', 'Remote', 'bg-indigo-500'],
                        ['Noor A.', 'Design', 'Time off', 'bg-amber-500'],
                      ].map(([name, team, status, dot]) => (
                        <div key={name} className="flex items-center gap-2 border-t py-1.5 first:border-t-0">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[8px] font-medium">
                            {name.split(' ')[0][0]}
                          </span>
                          <span className="text-[10px] font-medium">{name}</span>
                          <span className="text-[9px] text-muted-foreground">{team}</span>
                          <span className={`ml-auto h-1.5 w-1.5 rounded-full ${dot}`} />
                          <span className="w-12 text-right text-[9px] text-muted-foreground">{status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-4 hidden rounded-xl border bg-background/95 px-3 py-2 shadow-xl backdrop-blur sm:block">
                <p className="text-[10px] text-muted-foreground">This week&apos;s pulse</p>
                <div className="mt-1 flex items-end gap-1">
                  {[40, 55, 48, 70, 64, 82].map((h, i) => (
                    <span key={i} className="w-2 rounded-sm bg-indigo-500/70" style={{ height: `${h / 3}px` }} />
                  ))}
                  <span className="ml-2 text-xs font-semibold">4.6</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Strip */}
        <section className="border-y bg-muted/30">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border text-center md:grid-cols-4">
            {[
              ['Built for', '10–20 people'],
              ['Access control', 'Role-based + RLS'],
              ['Location policy', 'Off by default'],
              ['License', 'MIT'],
            ].map(([label, value]) => (
              <div key={label} className="px-4 py-6">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Everything in one place</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">HR software that respects your time.</h2>
            <p className="mt-4 text-muted-foreground">
              Replace the spreadsheet, the chat thread, and the “who approved this?” email chain.{' '}
              {APP_NAME} keeps the essentials together and the edge cases handled.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="group rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 transition-colors group-hover:bg-indigo-500 group-hover:text-white dark:text-indigo-300">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pulse */}
        <section id="pulse" className="border-y bg-slate-950 text-white">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-indigo-200">
                <HeartPulse className="h-3.5 w-3.5" />
                A different kind of people analytics
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">Team pulse, without the performance review energy.</h2>
              <p className="mt-4 max-w-lg leading-relaxed text-slate-400">
                One optional check-in a week: how did the week feel? Leads see an aggregate trend
                and participation rate. Individuals see their own history. Nobody gets ranked.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                {[
                  'Anonymous to the team — aggregates only',
                  'Owned by the employee, visible to owner/HR as a trend',
                  'A signal for workload and burnout, not a scorecard',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Weekly pulse</p>
                  <p className="text-xs text-slate-500">Last 8 weeks · all teams</p>
                </div>
                <span className="rounded-full bg-teal-400/10 px-2.5 py-1 text-xs font-medium text-teal-300">4.6 / 5</span>
              </div>
              <div className="mt-8 flex h-40 items-end gap-3">
                {[3.8, 4.1, 3.9, 4.3, 4.2, 4.5, 4.4, 4.6].map((value, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500/40 to-teal-400/80"
                      style={{ height: `${(value / 5) * 100}%` }}
                    />
                    <span className="text-[10px] text-slate-500">W{index + 1}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-center">
                {[
                  ['Participation', '82%'],
                  ['Responses', '16'],
                  ['Trend', '+0.3'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-lg font-semibold">{value}</p>
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section id="privacy" className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Privacy is a feature</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Location context, on your terms.</h2>
              <p className="mt-4 text-muted-foreground">
                Classic attendance systems turn geofencing into a hard gate. {APP_NAME} treats
                it as context: record it when it is useful, flag it when it is not, and turn it
                off entirely when your team does not need it.
              </p>
              <div className="mt-6 rounded-xl border bg-muted/30 p-4 text-sm">
                <p className="font-medium">The default is <span className="text-indigo-600 dark:text-indigo-300">soft flag</span>.</p>
                <p className="mt-1 text-muted-foreground">
                  Employees can check in even when location is unavailable. HR sees a quiet
                  “needs review” marker instead of a blocked door.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: MapPin, title: 'Soft geofence', body: 'Allow check-in, flag the edge cases, and review later.' },
                { icon: LockKeyhole, title: 'RLS everywhere', body: 'Every table is protected in Postgres, not just in React.' },
                { icon: ShieldCheck, title: 'No shadow profiles', body: 'No browsing analytics, no ad pixels, no third-party CRM.' },
                { icon: Zap, title: 'Bring your own cloud', body: 'Run it on your Supabase project. Export or delete on your schedule.' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border bg-card p-5">
                  <item.icon className="h-5 w-5 text-indigo-500" />
                  <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open source */}
        <section id="open-source" className="border-t bg-muted/30">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Open source</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Read the code. Run the code.</h2>
                <p className="mt-4 max-w-lg text-muted-foreground">
                  {APP_NAME} is MIT licensed and built in the open. The frontend is React and
                  TypeScript; the backend is Postgres, RLS, and Supabase Edge Functions. There
                  is no separate server to babysit.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {STACK.map((item) => (
                    <span key={item} className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">{item}</span>
                  ))}
                </div>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
                  >
                    <Github className="h-4 w-4" />
                    Star on GitHub
                  </a>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border bg-background px-5 py-3 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    Explore the app
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border bg-slate-950 shadow-2xl">
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 text-[11px] text-slate-500">terminal</span>
                </div>
                <pre className="overflow-x-auto p-5 text-[12px] leading-relaxed text-slate-300">
                  <code>{`# 1. Clone and install
git clone ${REPO_URL}.git
cd attendora && npm install

# 2. Configure your Supabase project
cp .env.example .env.local

# 3. Apply migrations, then create the first owner
npm run bootstrap:owner

# 4. Optional: load synthetic demo data
npm run seed:demo

# 5. Run it
npm run dev`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden border-t">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-teal-400/10" />
          <div className="relative mx-auto max-w-4xl px-5 py-20 text-center">
            <img src="/favicon.svg" alt="" className="mx-auto h-12 w-12 rounded-xl shadow-lg" />
            <h2 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">A smaller, calmer HR stack.</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              {APP_TAGLINE}. Open source, self-hosted, and built for teams that would rather
              spend their time on the work.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-indigo-500/20 transition-transform hover:-translate-y-0.5"
              >
                Sign in to {APP_NAME}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Github className="h-4 w-4" />
                Read the docs
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="" className="h-5 w-5 rounded" />
            <span>{APP_NAME} · MIT License · © 2026 Huzefa Mandviwala</span>
          </div>
          <div className="flex items-center gap-5">
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground">GitHub</a>
            <Link to="/login" className="transition-colors hover:text-foreground">Sign in</Link>
            <a href={`${REPO_URL}#readme`} target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
