import { supabase } from '@/lib/supabase'

export type PulseResponse = {
  id: string
  week_start: string
  score: number
  note: string | null
  updated_at: string
}

export type PulseSummaryPoint = {
  week_start: string
  average_score: number
  response_count: number
}

export function currentWeekStart(): string {
  const now = new Date()
  const daysSinceMonday = (now.getDay() + 6) % 7
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday)
  const year = monday.getFullYear()
  const month = String(monday.getMonth() + 1).padStart(2, '0')
  const day = String(monday.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export async function fetchMyPulse(employeeId: string): Promise<PulseResponse | null> {
  const { data, error } = await supabase
    .from('pulse_responses')
    .select('id, week_start, score, note, updated_at')
    .eq('employee_id', employeeId)
    .eq('week_start', currentWeekStart())
    .maybeSingle()

  if (error) throw error
  return data
}

export async function fetchPulseHistory(
  employeeId: string,
  weeks = 8
): Promise<PulseResponse[]> {
  const { data, error } = await supabase
    .from('pulse_responses')
    .select('id, week_start, score, note, updated_at')
    .eq('employee_id', employeeId)
    .order('week_start', { ascending: false })
    .limit(weeks)

  if (error) throw error
  return (data ?? []).reverse()
}

export async function fetchPulseSummary(weeks = 8): Promise<PulseSummaryPoint[]> {
  const { data, error } = await supabase.rpc('get_pulse_summary', { weeks })
  if (error) throw error
  return (data ?? []) as PulseSummaryPoint[]
}
