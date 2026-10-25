import { createClient } from '@supabase/supabase-js'

export function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing ${name}. Add it to .env.local (see .env.example).`)
    process.exit(1)
  }
  return value
}

export function serviceClient() {
  const url = requireEnv('SUPABASE_URL')
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function ensureAuthUser(supabase, { email, password, firstName, lastName }) {
  const { data: list, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })
  if (listError) throw listError

  const existing = list.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())
  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    })
    if (error) throw error
    return data.user
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  })
  if (error) throw error
  return data.user
}

export function toISODate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/** Monday of the week containing `date`, as YYYY-MM-DD. */
export function weekStart(date) {
  const daysSinceMonday = (date.getDay() + 6) % 7
  return toISODate(addDays(date, -daysSinceMonday))
}

/** Previous `count` weekdays (Mon–Fri), oldest first, excluding today. */
export function previousWeekdays(count) {
  const dates = []
  let cursor = addDays(new Date(), -1)
  while (dates.length < count) {
    const day = cursor.getDay()
    if (day !== 0 && day !== 6) dates.push(toISODate(cursor))
    cursor = addDays(cursor, -1)
  }
  return dates.reverse()
}

export function istISO(date, time) {
  return `${date}T${time}:00+05:30`
}

export async function ensureDepartment(supabase, name) {
  const { data: existing } = await supabase
    .from('departments')
    .select('id')
    .eq('name', name)
    .maybeSingle()
  if (existing) return existing.id

  const { data, error } = await supabase
    .from('departments')
    .insert({ name })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function ensureDesignation(supabase, name, departmentId) {
  const { data: existing } = await supabase
    .from('designations')
    .select('id')
    .eq('name', name)
    .eq('department_id', departmentId)
    .maybeSingle()
  if (existing) return existing.id

  const { data, error } = await supabase
    .from('designations')
    .insert({ name, department_id: departmentId })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function ensureChecklistItem(supabase, item) {
  const { data: existing } = await supabase
    .from('onboarding_checklist_templates')
    .select('id')
    .eq('item_name', item.item_name)
    .maybeSingle()
  if (existing) return existing.id

  const { data, error } = await supabase
    .from('onboarding_checklist_templates')
    .insert(item)
    .select('id')
    .single()
  if (error) throw error
  return data.id
}
