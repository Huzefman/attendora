import { useState } from 'react'
import { HeartPulse, Loader2, LockKeyhole, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuthStore } from '@/hooks/useAuth'
import { useMyPulse } from '../hooks'
import { useSubmitPulse } from '../mutations'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { score: 1, emoji: '😖', label: 'Rough', tone: 'hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30', selected: 'border-rose-400 bg-rose-50 dark:bg-rose-950/40' },
  { score: 2, emoji: '😕', label: 'Meh', tone: 'hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/30', selected: 'border-orange-400 bg-orange-50 dark:bg-orange-950/40' },
  { score: 3, emoji: '😐', label: 'Okay', tone: 'hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30', selected: 'border-amber-400 bg-amber-50 dark:bg-amber-950/40' },
  { score: 4, emoji: '🙂', label: 'Good', tone: 'hover:border-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/30', selected: 'border-teal-400 bg-teal-50 dark:bg-teal-950/40' },
  { score: 5, emoji: '🤩', label: 'Great', tone: 'hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30', selected: 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' },
]

export function PulseCheckInCard() {
  const employee = useAuthStore((s) => s.employee)
  const { data: existing, isLoading } = useMyPulse(employee?.id)
  const submit = useSubmitPulse()

  const [editing, setEditing] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [note, setNote] = useState('')

  if (!employee) return null

  const activeScore = score ?? existing?.score ?? null
  const showForm = editing || !existing

  async function handleSubmit() {
    if (!activeScore) {
      toast.error('Pick a score first')
      return
    }
    try {
      await submit.mutateAsync({ score: activeScore, note: note.trim() || undefined })
      setEditing(false)
      toast.success('Pulse saved — thanks for checking in')
    } catch (e) {
      const err = e as { message?: string }
      toast.error(err?.message ?? 'Could not save your pulse')
    }
  }

  return (
    <Card className="overflow-hidden border-indigo-500/20">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
            <HeartPulse className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="text-base">How was your week?</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">One check-in, about ten seconds. Optional, always.</p>
          </div>
        </div>
        {existing && !showForm && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {existing.updated_at ? 'Saved this week' : 'This week'}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : showForm ? (
          <>
            <div className="grid grid-cols-5 gap-2">
              {OPTIONS.map((option) => (
                <button
                  key={option.score}
                  type="button"
                  onClick={() => setScore(option.score)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl border bg-background px-1 py-3 transition-all',
                    option.tone,
                    activeScore === option.score && option.selected,
                    activeScore === option.score && 'ring-2 ring-primary/30'
                  )}
                  aria-pressed={activeScore === option.score}
                >
                  <span className="text-xl leading-none">{option.emoji}</span>
                  <span className="text-[10px] font-medium text-muted-foreground">{option.label}</span>
                </button>
              ))}
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything you want to add? (optional, max 500 characters)"
              rows={2}
              maxLength={500}
              className="resize-none text-sm"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <LockKeyhole className="h-3 w-3" />
                Aggregate trends only. Your note stays private.
              </p>
              <Button size="sm" onClick={handleSubmit} disabled={submit.isPending || !activeScore}>
                {submit.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                {existing ? 'Update pulse' : 'Save pulse'}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{OPTIONS.find((o) => o.score === existing.score)?.emoji}</span>
              <div>
                <p className="text-sm font-medium">
                  You rated this week {OPTIONS.find((o) => o.score === existing.score)?.label.toLowerCase()}.
                </p>
                {existing.note && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{existing.note}</p>}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setScore(existing.score)
                setNote(existing.note ?? '')
                setEditing(true)
              }}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Update
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
