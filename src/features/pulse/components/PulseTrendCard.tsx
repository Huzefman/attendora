import { BarChart3, HeartPulse, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { usePulseSummary } from '../hooks'
import { currentWeekStart } from '../api'

function weekStarts(count: number): string[] {
  const base = new Date(`${currentWeekStart()}T00:00:00`)
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(base)
    date.setDate(base.getDate() - (count - 1 - index) * 7)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })
}

function shortLabel(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

type Props = {
  totalEmployees?: number
  weeks?: number
}

export function PulseTrendCard({ totalEmployees, weeks = 8 }: Props) {
  const { data: summary, isLoading } = usePulseSummary(weeks)
  const { data: activeCount } = useQuery({
    queryKey: ['employees', 'active-count'],
    enabled: totalEmployees == null,
    staleTime: 60_000,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('employees')
        .select('*', { head: true, count: 'exact' })
        .eq('is_active', true)
      if (error) throw error
      return count ?? 0
    },
  })
  const teamSize = totalEmployees ?? activeCount ?? 0
  const slots = weekStarts(weeks)
  const byWeek = new Map((summary ?? []).map((point) => [point.week_start, point]))
  const latest = summary?.[summary.length - 1]
  const weighted =
    summary && summary.length > 0
      ? summary.reduce((sum, point) => sum + Number(point.average_score) * point.response_count, 0) /
        summary.reduce((sum, point) => sum + point.response_count, 0)
      : null
  const participation =
    latest && teamSize > 0
      ? Math.min(100, Math.round((latest.response_count / teamSize) * 100))
      : null

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-300">
            <HeartPulse className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="text-base">Team pulse</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">Weekly, aggregate-only trend across the team.</p>
          </div>
        </div>
        {latest && (
          <span className="rounded-full bg-teal-500/10 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
            {Number(latest.average_score).toFixed(1)} / 5
          </span>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : !summary || summary.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
            <BarChart3 className="h-7 w-7 text-muted-foreground/60" />
            <p className="mt-2 text-sm font-medium">No pulse responses yet</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Once your team starts checking in, the weekly trend will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="flex h-32 items-end gap-2">
              {slots.map((week) => {
                const point = byWeek.get(week)
                const value = point ? Number(point.average_score) : 0
                return (
                  <div key={week} className="group flex flex-1 flex-col items-center gap-1.5">
                    <div className="flex h-24 w-full items-end">
                      <div
                        className={
                          point
                            ? 'w-full rounded-t-md bg-gradient-to-t from-indigo-500/50 to-teal-400/80 transition-opacity group-hover:opacity-80'
                            : 'w-full rounded-t-md bg-muted'
                        }
                        style={{ height: point ? `${Math.max(6, (value / 5) * 100)}%` : '4px' }}
                        title={point ? `${shortLabel(week)}: ${value.toFixed(1)} (${point.response_count} responses)` : `${shortLabel(week)}: no responses`}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground">{shortLabel(week)}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-center">
              <div>
                <p className="text-sm font-semibold">{weighted != null ? weighted.toFixed(1) : '—'}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Average</p>
              </div>
              <div>
                <p className="text-sm font-semibold">{latest?.response_count ?? 0}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">This week</p>
              </div>
              <div>
                <p className="text-sm font-semibold">{participation != null ? `${participation}%` : '—'}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Participation</p>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground">
              Aggregate only. Individual responses and notes are never shown to admins.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
