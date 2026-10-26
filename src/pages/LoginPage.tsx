import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Github, LockKeyhole, Sparkles } from 'lucide-react'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { APP_NAME, APP_TAGLINE, REPO_URL } from '@/lib/brand'

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-indigo-600/25 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-[420px] w-[420px] rounded-full bg-teal-500/20 blur-3xl" />
          <div className="absolute inset-0 surface-grid opacity-[0.07]" />
        </div>

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="h-9 w-9 rounded-xl" />
            <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
          </Link>
        </div>

        <div className="relative max-w-md">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-indigo-200">
            <Sparkles className="h-3.5 w-3.5" />
            {APP_TAGLINE}
          </div>
          <h1 className="text-balance text-4xl font-semibold leading-[1.12] tracking-tight">
            Make room for the work that matters.
          </h1>
          <p className="mt-5 text-pretty leading-relaxed text-slate-400">
            One calm place for your team&apos;s people records, attendance, time off, and
            weekly pulse. Less admin, fewer surprises, no enterprise bloat.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            {[
              'Role-based access backed by Postgres RLS',
              'Attendance and time off in one flow',
              'Privacy-first location policy',
              'Open source and self-hosted',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-3 text-xs text-slate-500">
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-300">
            <Github className="h-3.5 w-3.5" />
            Open source
          </a>
          <span className="h-1 w-1 rounded-full bg-slate-700" />
          <span className="inline-flex items-center gap-1.5">
            <LockKeyhole className="h-3.5 w-3.5" />
            MIT licensed
          </span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between p-5 lg:justify-end">
          <Link to="/" className="inline-flex items-center gap-2.5 lg:hidden">
            <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" />
            <span className="text-sm font-semibold">{APP_NAME}</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-16">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Sign in with the email your workspace admin set up for you.
              </p>
            </div>

            {import.meta.env.VITE_UI_PREVIEW === 'true' && (
              <div className="mb-5 rounded-xl border border-dashed border-indigo-500/40 bg-indigo-500/5 p-3.5 text-xs leading-relaxed">
                <p className="font-medium text-foreground">Local preview mode</p>
                <p className="mt-1 text-muted-foreground">
                  Sign in with{' '}
                  <code className="font-mono text-foreground">demo.owner@example.com</code>,{' '}
                  <code className="font-mono text-foreground">priya@example.com</code>, or{' '}
                  <code className="font-mono text-foreground">sam@example.com</code>. Any
                  password works. No backend is connected.
                </p>
              </div>
            )}

            <LoginForm />

            <div className="mt-6 flex items-center justify-between text-sm">
              <Link
                to="/forgot-password"
                className="text-muted-foreground transition-colors hover:text-foreground"
                id="login-forgot-password-link"
              >
                Forgot your password?
              </Link>
              <span className="text-xs text-muted-foreground/70">Invite-only</span>
            </div>

            <div className="mt-10 rounded-xl border bg-muted/30 p-3.5 text-xs leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">First time here?</p>
              <p className="mt-1">
                Use the temporary password from your welcome email. You&apos;ll be asked to
                choose a new one before entering the workspace.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 text-center text-[11px] text-muted-foreground/60">
          {APP_NAME} · {APP_TAGLINE}
        </div>
      </div>
    </div>
  )
}
