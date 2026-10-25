import { KeyRound } from 'lucide-react'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { APP_NAME } from '@/lib/brand'

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm px-4">
        <Card className="border-0 bg-card/90 shadow-xl backdrop-blur-md">
          <CardHeader className="space-y-3 pb-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
              <KeyRound className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" id="forgot-password-title">
                Reset password
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your work email and we&apos;ll send you a reset link.
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ForgotPasswordForm />
          </CardContent>
        </Card>
        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground/60">
          <img src="/favicon.svg" alt="" className="h-3.5 w-3.5 rounded" />
          {APP_NAME} &mdash; Password recovery
        </p>
      </div>
    </div>
  )
}
