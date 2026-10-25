import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { callEdgeFunction } from '@/lib/edge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

type ConfigEntry = {
  key: string
  value: string
  description: string
}

const CONFIG_KEYS: ConfigEntry[] = [
  { key: 'attendance_location_policy', value: '', description: 'How attendance location is handled: off, soft flag, or strict geofence' },
  { key: 'regularization_window_days', value: '', description: 'Max calendar days in the past for attendance corrections' },
  { key: 'leave_sla_business_days', value: '', description: 'Business days before a pending time-off request is escalated' },
  { key: 'optional_holiday_limit_per_year', value: '', description: 'Max optional holidays an employee can opt into per year' },
  { key: 'auto_checkout_time', value: '', description: 'IST time at which auto-checkout runs (HH:MM:SS)' },
  { key: 'rehire_carry_leave_balance', value: '', description: 'Carry time-off balance when an employee is rehired' },
]

export default function SettingsNotificationsPage() {
  const [config, setConfig] = useState<ConfigEntry[]>(CONFIG_KEYS)
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetch = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('app_config')
          .select('key, value')
        if (cancelled) return
        if (!error && data) {
          setConfig((prev) =>
            prev.map((c) => ({
              ...c,
              value: data.find((d) => d.key === c.key)?.value ?? '',
            }))
          )
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [])

  function handleChange(key: string, value: string) {
    setConfig((prev) => prev.map((c) => (c.key === key ? { ...c, value } : c)))
  }

  async function handleSave(key: string) {
    const entry = config.find((c) => c.key === key)
    if (!entry || !entry.value.trim()) {
      toast.error('Value cannot be empty')
      return
    }
    setSavingKey(key)
    try {
      await callEdgeFunction<{ key: string; value: string }, unknown>('update-app-config', {
        key: entry.key,
        value: entry.value.trim(),
      })
      toast.success(`${entry.key.replace(/_/g, ' ')} updated`)
    } catch (e) {
      const err = e as { message?: string }
      toast.error(err?.message ?? 'Failed to update')
    } finally {
      setSavingKey(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workspace policies</h1>
          <p className="mt-1 text-sm text-muted-foreground">Attendance, time-off, and notification behaviour for everyone.</p>
        </div>
        <Card>
          <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
          <CardContent>
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workspace policies</h1>
        <p className="mt-1 text-sm text-muted-foreground">Attendance, time-off, and notification behaviour for everyone.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.map((entry) => (
            <div key={entry.key} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm font-medium">{entry.key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                <p className="text-xs text-muted-foreground">{entry.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {entry.key === 'attendance_location_policy' ? (
                  <select
                    value={entry.value}
                    onChange={(e) => handleChange(entry.key, e.target.value)}
                    className="h-8 w-44 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="off">Off — no checks</option>
                    <option value="flag">Soft flag (recommended)</option>
                    <option value="strict">Strict geofence</option>
                  </select>
                ) : entry.key === 'rehire_carry_leave_balance' ? (
                  <select
                    value={entry.value}
                    onChange={(e) => handleChange(entry.key, e.target.value)}
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                ) : (
                  <input
                    value={entry.value}
                    onChange={(e) => handleChange(entry.key, e.target.value)}
                    className="h-8 w-28 rounded-md border border-input bg-background px-2 text-sm font-mono"
                    placeholder={entry.key.includes('time') ? 'HH:MM:SS' : 'Value'}
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave(entry.key)}
                  disabled={savingKey === entry.key}
                >
                  {savingKey === entry.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground">
            Soft flag lets people check in when location is unavailable and marks the record for review.
            Strict is the only mode that blocks a check-in.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
