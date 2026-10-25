#!/usr/bin/env node
/**
 * Load a synthetic demo workspace into an empty Attendora project.
 *
 * Usage:
 *   npm run seed:demo
 *   npm run seed:demo -- --force   # if the project already has employees
 *
 * All people, emails, and notes are fictional. Nothing is sent by this script:
 * no emails, no push notifications, no external API calls.
 */
import {
  requireEnv,
  serviceClient,
  ensureAuthUser,
  ensureDepartment,
  ensureDesignation,
  ensureChecklistItem,
  toISODate,
  addDays,
  weekStart,
  previousWeekdays,
  istISO,
} from './_demo-shared.mjs'

const force = process.argv.includes('--force')
const password = requireEnv('DEMO_PASSWORD')
if (password.length < 12) {
  console.error('DEMO_PASSWORD must be at least 12 characters.')
  process.exit(1)
}
const emailDomain = process.env.DEMO_EMAIL_DOMAIN?.trim() || 'example.com'
const supabase = serviceClient()

const { count: employeeCount } = await supabase
  .from('employees')
  .select('*', { head: true, count: 'exact' })

if ((employeeCount ?? 0) > 1 && !force) {
  console.error(
    `This project already has ${employeeCount} employees. Re-run with --force if you are sure this is a demo project.`
  )
  process.exit(1)
}

const year = new Date().getFullYear()
const today = toISODate(new Date())

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------
const departments = {
  people: await ensureDepartment(supabase, 'People Ops'),
  engineering: await ensureDepartment(supabase, 'Engineering'),
  design: await ensureDepartment(supabase, 'Design'),
  gtm: await ensureDepartment(supabase, 'Go-to-market'),
}

const designations = {
  peoplePartner: await ensureDesignation(supabase, 'People Partner', departments.people),
  engineeringLead: await ensureDesignation(supabase, 'Engineering Lead', departments.engineering),
  engineer: await ensureDesignation(supabase, 'Software Engineer', departments.engineering),
  designer: await ensureDesignation(supabase, 'Product Designer', departments.design),
  accountManager: await ensureDesignation(supabase, 'Account Manager', departments.gtm),
}

let { data: shift } = await supabase
  .from('shifts')
  .select('id')
  .eq('is_default', true)
  .maybeSingle()

if (shift) {
  const { error } = await supabase
    .from('shifts')
    .update({
      name: 'Standard day',
      start_time: '09:30',
      end_time: '18:30',
      break_minutes: 60,
      weekly_off_days: [0, 6],
      grace_period_minutes: 0,
      late_mark_threshold: 3,
      is_night_shift: false,
      is_active: true,
    })
    .eq('id', shift.id)
  if (error) throw error
} else {
  const { data, error } = await supabase
    .from('shifts')
    .insert({
      name: 'Standard day',
      start_time: '09:30',
      end_time: '18:30',
      break_minutes: 60,
      weekly_off_days: [0, 6],
      grace_period_minutes: 0,
      late_mark_threshold: 3,
      is_night_shift: false,
      is_active: true,
      is_default: true,
    })
    .select('id')
    .single()
  if (error) throw error
  shift = data
}

const leaveTypes = [
  {
    name: 'Paid time off',
    code: 'PTO',
    accrual_type: 'yearly',
    accrual_days: 20,
    max_carry_forward_days: 5,
    carry_forward_expiry_days: 90,
    min_notice_days: 3,
    is_active: true,
  },
  {
    name: 'Sick leave',
    code: 'SICK',
    accrual_type: 'yearly',
    accrual_days: 10,
    max_carry_forward_days: 0,
    requires_attachment: true,
    attachment_required_after_days: 2,
    min_notice_days: 0,
    is_active: true,
  },
  {
    name: 'Unpaid leave',
    code: 'UNPAID',
    accrual_type: 'manual',
    max_carry_forward_days: 0,
    is_lwp: true,
    min_notice_days: 0,
    is_active: true,
  },
]

for (const leaveType of leaveTypes) {
  const { error } = await supabase.from('leave_types').upsert(leaveType, { onConflict: 'code' })
  if (error) throw error
}

const leaveTypeRows = await supabase.from('leave_types').select('id, code')
if (leaveTypeRows.error) throw leaveTypeRows.error
const leaveTypeByCode = Object.fromEntries(leaveTypeRows.data.map((row) => [row.code, row.id]))

const holidayRows = [
  { date: `${year}-01-01`, name: "New Year's Day", type: 'national', is_optional: false, year },
  { date: `${year}-03-20`, name: 'Spring Day', type: 'company', is_optional: false, year },
  { date: `${year}-07-04`, name: 'Midyear Reset', type: 'company', is_optional: false, year },
  { date: `${year}-11-27`, name: 'Harvest Day', type: 'optional', is_optional: true, year },
]
for (const holiday of holidayRows) {
  const { error } = await supabase
    .from('holidays')
    .upsert(holiday, { onConflict: 'date,type' })
  if (error) throw error
}

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------
const team = [
  {
    key: 'owner',
    email: `demo.owner@${emailDomain}`,
    first: 'Avery',
    last: 'Chen',
    role: 'owner',
    department: departments.people,
    designation: designations.peoplePartner,
    code: 'DEMO-0001',
    join: `${year - 2}-01-15`,
  },
  {
    key: 'hr',
    email: `priya@${emailDomain}`,
    first: 'Priya',
    last: 'Sharma',
    role: 'hr',
    department: departments.people,
    designation: designations.peoplePartner,
    code: 'DEMO-0002',
    join: `${year - 1}-03-04`,
  },
  {
    key: 'marco',
    email: `marco@${emailDomain}`,
    first: 'Marco',
    last: 'Liu',
    role: 'employee',
    department: departments.engineering,
    designation: designations.engineeringLead,
    code: 'DEMO-0003',
    join: `${year - 2}-09-11`,
  },
  {
    key: 'noor',
    email: `noor@${emailDomain}`,
    first: 'Noor',
    last: 'Ahmed',
    role: 'employee',
    department: departments.design,
    designation: designations.designer,
    code: 'DEMO-0004',
    join: `${year - 1}-06-17`,
  },
  {
    key: 'sam',
    email: `sam@${emailDomain}`,
    first: 'Sam',
    last: 'Rivera',
    role: 'employee',
    department: departments.engineering,
    designation: designations.engineer,
    code: 'DEMO-0005',
    join: `${year - 1}-10-02`,
  },
  {
    key: 'elena',
    email: `elena@${emailDomain}`,
    first: 'Elena',
    last: 'Popova',
    role: 'employee',
    department: departments.gtm,
    designation: designations.accountManager,
    code: 'DEMO-0006',
    join: `${year}-02-19`,
  },
]

const people = {}
for (const person of team) {
  const user = await ensureAuthUser(supabase, {
    email: person.email,
    password,
    firstName: person.first,
    lastName: person.last,
  })

  const { data, error } = await supabase
    .from('employees')
    .upsert(
      {
        auth_id: user.id,
        employee_code: person.code,
        first_name: person.first,
        last_name: person.last,
        email: person.email,
        phone: `+1 555 0100${person.code.slice(-1)}`,
        department_id: person.department,
        designation_id: person.designation,
        role: person.role,
        employment_type: 'full_time',
        employment_status: 'active',
        join_date: person.join,
        probation_end_date: addDays(new Date(person.join), 90).toISOString().slice(0, 10),
        is_first_login: false,
        is_active: true,
      },
      { onConflict: 'email' }
    )
    .select('id, role')
    .single()
  if (error) throw error
  people[person.key] = data
}

// reporting lines
await supabase.from('employees').update({ reporting_manager_id: people.owner.id }).eq('id', people.hr.id)
await supabase.from('employees').update({ reporting_manager_id: people.owner.id }).eq('id', people.marco.id)
await supabase.from('employees').update({ reporting_manager_id: people.marco.id }).eq('id', people.sam.id)
await supabase.from('employees').update({ reporting_manager_id: people.marco.id }).eq('id', people.noor.id)
await supabase.from('employees').update({ reporting_manager_id: people.owner.id }).eq('id', people.elena.id)

// ---------------------------------------------------------------------------
// Balances, time off, onboarding, announcements, geofence
// ---------------------------------------------------------------------------
for (const person of Object.values(people)) {
  for (const [code, leaveTypeId] of Object.entries(leaveTypeByCode)) {
    const opening = code === 'PTO' ? 15 : code === 'SICK' ? 8 : 0
    const { error } = await supabase.from('leave_balances').upsert(
      {
        employee_id: person.id,
        leave_type_id: leaveTypeId,
        year,
        opening_balance: opening,
        carry_forward_amount: 0,
        accrued: 0,
        taken: 0,
        pending: 0,
        adjusted: 0,
      },
      { onConflict: 'employee_id,leave_type_id,year', ignoreDuplicates: true }
    )
    if (error) throw error
  }
}

async function ensureLeaveApplication(application) {
  const { data: existing } = await supabase
    .from('leave_applications')
    .select('id')
    .eq('employee_id', application.employee_id)
    .eq('from_date', application.from_date)
    .maybeSingle()
  if (existing) return

  const { error } = await supabase.from('leave_applications').insert(application)
  if (error) throw error
}

const nextMonday = addDays(new Date(), ((8 - new Date().getDay()) % 7) || 7)
const nextTuesday = addDays(nextMonday, 1)
const nextWednesday = addDays(nextMonday, 2)
const lastWeek = previousWeekdays(8)

await ensureLeaveApplication({
  employee_id: people.sam.id,
  leave_type_id: leaveTypeByCode.PTO,
  from_date: toISODate(nextMonday),
  to_date: toISODate(nextTuesday),
  working_days_count: 2,
  reason: 'Family trip',
  status: 'pending',
  applied_at: new Date(Date.now() - 86400000).toISOString(),
})
await ensureLeaveApplication({
  employee_id: people.noor.id,
  leave_type_id: leaveTypeByCode.SICK,
  from_date: lastWeek[lastWeek.length - 1],
  to_date: lastWeek[lastWeek.length - 1],
  working_days_count: 1,
  reason: 'Flu recovery',
  status: 'approved',
  applied_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  reviewed_by: people.hr.id,
  reviewed_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  reviewer_comment: 'Get well soon.',
})
await ensureLeaveApplication({
  employee_id: people.elena.id,
  leave_type_id: leaveTypeByCode.PTO,
  from_date: toISODate(nextWednesday),
  to_date: toISODate(nextWednesday),
  working_days_count: 1,
  reason: 'Personal appointment',
  status: 'pending',
  applied_at: new Date(Date.now() - 3600000).toISOString(),
})

const checklistItems = [
  { item_name: 'Meet your manager', description: 'Book a 30-minute intro chat.', is_required: true, sort_order: 1, is_active: true },
  { item_name: 'Read the workspace handbook', description: 'Find the handbook in your welcome email.', is_required: true, sort_order: 2, is_active: true },
  { item_name: 'Set up your tools', description: 'Get access to the tools your team uses.', is_required: true, sort_order: 3, is_active: true },
  { item_name: 'Complete payroll details', description: 'Add your bank and tax details securely.', is_required: false, sort_order: 4, is_active: true },
]
for (const item of checklistItems) {
  await ensureChecklistItem(supabase, item)
}

const { data: existingAnnouncements } = await supabase
  .from('announcements')
  .select('title')
  .in('title', ['Welcome to Attendora', 'Team pulse is live'])
const existingTitles = new Set((existingAnnouncements ?? []).map((row) => row.title))
const announcements = [
  {
    title: 'Welcome to Attendora',
    body: 'This is a synthetic demo workspace for exploring Attendora. Every person, email, and note here is fictional. Nothing is sent to a real inbox unless you configure email delivery.',
  },
  {
    title: 'Team pulse is live',
    body: 'Open your dashboard and try the weekly pulse check-in. Leads see an aggregate trend only — individual responses and notes stay private.',
  },
]
for (const announcement of announcements) {
  if (existingTitles.has(announcement.title)) continue
  const { error } = await supabase.from('announcements').insert({
    ...announcement,
    created_by: people.owner.id,
    is_active: true,
  })
  if (error) throw error
}

const { data: existingGeofence } = await supabase
  .from('geofence_config')
  .select('id')
  .eq('label', 'Demo office')
  .maybeSingle()
if (!existingGeofence) {
  const { error } = await supabase.from('geofence_config').insert({
    label: 'Demo office',
    latitude: 19.076,
    longitude: 72.8777,
    radius_meters: 300,
    is_active: true,
    created_by: people.owner.id,
  })
  if (error) throw error
}

const { data: locationPolicy } = await supabase
  .from('app_config')
  .select('key')
  .eq('key', 'attendance_location_policy')
  .maybeSingle()
if (!locationPolicy) {
  await supabase.from('app_config').insert({
    key: 'attendance_location_policy',
    value: 'flag',
    description: 'Attendance location policy: off, flag, or strict',
  })
}

// ---------------------------------------------------------------------------
// Attendance: previous 10 weekdays, never today, so the demo can check in
// ---------------------------------------------------------------------------
const dates = previousWeekdays(10)
const employeeList = Object.values(people)
let attendanceCount = 0

for (let e = 0; e < employeeList.length; e += 1) {
  const person = employeeList[e]
  for (let d = 0; d < dates.length; d += 1) {
    const date = dates[d]
    let status = 'present'
    let checkIn = '09:25'
    let checkOut = '18:30'
    let totalHours = 8.5
    let isLate = false
    let isWfh = false
    let isFlagged = false

    if (e === 3 && d === 7) {
      status = 'on_leave'
    } else if (e === 5 && d === 6) {
      status = 'absent'
    } else if (e === 4 && d === 8) {
      status = 'work_from_home'
      isWfh = true
      checkIn = '09:30'
      checkOut = '18:30'
      totalHours = 8
    } else if (e === 2 && d === 9) {
      status = 'late'
      checkIn = '10:35'
      checkOut = '18:40'
      totalHours = 7.5
      isLate = true
    } else if (e === 3 && d === 4) {
      isFlagged = true
      checkIn = '09:35'
    }

    const hasPunch = status !== 'absent' && status !== 'on_leave'
    const payload = {
      employee_id: person.id,
      date,
      shift_id: shift.id,
      check_in_time: hasPunch ? istISO(date, checkIn) : null,
      check_out_time: hasPunch ? istISO(date, checkOut) : null,
      check_in_ip: hasPunch ? '203.0.113.10' : null,
      is_geo_flagged: isFlagged,
      is_wfh: isWfh,
      status,
      total_hours: hasPunch ? totalHours : null,
      is_late: isLate,
      is_manually_entered: false,
    }

    const { data: record, error } = await supabase
      .from('attendance_records')
      .upsert(payload, { onConflict: 'employee_id,date' })
      .select('id')
      .single()
    if (error) throw error
    attendanceCount += 1

    if (isFlagged) {
      const { data: snapshot } = await supabase
        .from('location_snapshots')
        .select('id')
        .eq('attendance_record_id', record.id)
        .maybeSingle()
      if (!snapshot) {
        await supabase.from('location_snapshots').insert({
          employee_id: person.id,
          action: 'check_in',
          latitude: 19.2,
          longitude: 72.9,
          inside_geofence: false,
          ip: '203.0.113.10',
          successful: true,
          attendance_record_id: record.id,
        })
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Team pulse: six weeks, aggregate-friendly partial participation
// ---------------------------------------------------------------------------
const pulseWeeks = Array.from({ length: 6 }, (_, index) =>
  weekStart(addDays(new Date(), -(5 - index) * 7))
)
let pulseCount = 0
for (let e = 0; e < employeeList.length; e += 1) {
  const person = employeeList[e]
  for (let w = 0; w < pulseWeeks.length; w += 1) {
    if (e + w === 7) continue
    if (w === pulseWeeks.length - 1 && e > 3) continue
    const { error } = await supabase.from('pulse_responses').upsert(
      {
        employee_id: person.id,
        week_start: pulseWeeks[w],
        score: 3 + ((e + w) % 3),
        note: e === 1 && w === pulseWeeks.length - 1 ? 'Busy week, but good momentum.' : null,
      },
      { onConflict: 'employee_id,week_start' }
    )
    if (error) throw error
    pulseCount += 1
  }
}

console.log('Demo workspace ready.')
console.log(`  People: ${employeeList.length}`)
console.log(`  Attendance rows: ${attendanceCount}`)
console.log(`  Pulse responses: ${pulseCount}`)
console.log(`  Sign in: demo.owner@${emailDomain} / priya@${emailDomain} / sam@${emailDomain}`)
console.log('  Password: the DEMO_PASSWORD value from .env.local')
console.log('  Today is intentionally unpunched so you can try check-in.')
