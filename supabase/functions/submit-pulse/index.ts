import { getActor, assertRole } from '../_shared/auth.ts'
import { ok, err, cors, handleError } from '../_shared/response.ts'
import { getServiceClient } from '../_shared/supabase.ts'

/** Monday of the current week, in IST, as YYYY-MM-DD. */
function currentWeekStartIST(): string {
  const now = new Date()
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)
  const daysSinceMonday = (ist.getUTCDay() + 6) % 7
  const monday = new Date(
    Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() - daysSinceMonday)
  )
  return monday.toISOString().slice(0, 10)
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return cors()

  try {
    const actor = await getActor(req)
    assertRole(actor, ['owner', 'hr', 'employee', 'system_admin'])

    const body = await req.json().catch(() => ({}))
    const score = Number(body.score)
    const rawNote = typeof body.note === 'string' ? body.note.trim() : ''

    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return err('VALIDATION_ERROR', 'score must be an integer between 1 and 5', 400)
    }
    if (rawNote.length > 500) {
      return err('VALIDATION_ERROR', 'note must be 500 characters or fewer', 400)
    }

    const supabase = getServiceClient()
    const weekStart = currentWeekStartIST()

    const { data, error } = await supabase
      .from('pulse_responses')
      .upsert(
        {
          employee_id: actor.actorId,
          week_start: weekStart,
          score,
          note: rawNote || null,
        },
        { onConflict: 'employee_id, week_start' }
      )
      .select('id, week_start, score, note, updated_at')
      .single()

    if (error) throw error

    return ok(data)
  } catch (e) {
    return handleError(e)
  }
})
