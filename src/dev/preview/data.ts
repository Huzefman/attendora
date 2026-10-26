import type { Session, User } from '@supabase/supabase-js'
import type { Employee } from '@/types'

/**
 * Synthetic data for `VITE_UI_PREVIEW=true`.
 *
 * This module is only loaded by the preview Supabase shim and the preview-only
 * Edge Function stub. It never touches a real project or sends network traffic.
 */
export type PreviewRow = Record<string, unknown>

const NOW = new Date()
const CURRENT_YEAR = NOW.getFullYear()
const TODAY = dateOnly(NOW)
const NOW_ISO = NOW.toISOString()

const PREVIEW_USER_ID = '00000000-0000-4000-8000-000000000001'

const DEPT = {
  people: '00000000-0000-4000-8000-000000000101',
  engineering: '00000000-0000-4000-8000-000000000102',
  design: '00000000-0000-4000-8000-000000000103',
  gtm: '00000000-0000-4000-8000-000000000104',
}

const DESIG = {
  peoplePartner: '00000000-0000-4000-8000-000000000201',
  engineeringLead: '00000000-0000-4000-8000-000000000202',
  engineer: '00000000-0000-4000-8000-000000000203',
  designer: '00000000-0000-4000-8000-000000000204',
  accountManager: '00000000-0000-4000-8000-000000000205',
}

const EMP = {
  owner: '00000000-0000-4000-8000-000000000301',
  hr: '00000000-0000-4000-8000-000000000302',
  marco: '00000000-0000-4000-8000-000000000303',
  noor: '00000000-0000-4000-8000-000000000304',
  sam: '00000000-0000-4000-8000-000000000305',
  elena: '00000000-0000-4000-8000-000000000306',
}

const SHIFT_ID = '00000000-0000-4000-8000-000000000401'
const GEOFENCE_ID = '00000000-0000-4000-8000-000000000501'
const HOLIDAY_ID = '00000000-0000-4000-8000-000000000601'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function dateOnly(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
}

function atNoon(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12, 0, 0, 0)
}

function addDays(value: Date, amount: number): Date {
  const next = atNoon(value)
  next.setDate(next.getDate() + amount)
  return next
}

function addDaysIso(value: string, amount: number): string {
  const [year, month, day] = value.split('-').map(Number)
  return dateOnly(addDays(new Date(year, month - 1, day, 12), amount))
}

function localISO(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute, 0, 0).toISOString()
}

function previousWeekdays(count: number): string[] {
  const dates: string[] = []
  let cursor = addDays(NOW, -1)
  while (dates.length < count) {
    const day = cursor.getDay()
    if (day !== 0 && day !== 6) dates.unshift(dateOnly(cursor))
    cursor = addDays(cursor, -1)
  }
  return dates
}

function weekStart(value: Date): string {
  const cursor = atNoon(value)
  const daysSinceMonday = (cursor.getDay() + 6) % 7
  cursor.setDate(cursor.getDate() - daysSinceMonday)
  return dateOnly(cursor)
}

function nextWeekday(day: number): Date {
  let cursor = addDays(NOW, 1)
  while (cursor.getDay() !== day) cursor = addDays(cursor, 1)
  return cursor
}

function minutesAgo(value: number): string {
  return new Date(Date.now() - value * 60_000).toISOString()
}

function hoursAgo(value: number): string {
  return new Date(Date.now() - value * 3_600_000).toISOString()
}

function daysAgo(value: number): string {
  return new Date(Date.now() - value * 86_400_000).toISOString()
}

const departmentNames: Record<string, string> = {
  [DEPT.people]: 'People Ops',
  [DEPT.engineering]: 'Engineering',
  [DEPT.design]: 'Design',
  [DEPT.gtm]: 'Go-to-market',
}

const designationNames: Record<string, string> = {
  [DESIG.peoplePartner]: 'People Partner',
  [DESIG.engineeringLead]: 'Engineering Lead',
  [DESIG.engineer]: 'Software Engineer',
  [DESIG.designer]: 'Product Designer',
  [DESIG.accountManager]: 'Account Manager',
}

const departments: PreviewRow[] = [
  {
    id: DEPT.people,
    name: 'People Ops',
    parent_id: null,
    depth: 0,
    is_active: true,
    created_by: EMP.owner,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
  },
  {
    id: DEPT.engineering,
    name: 'Engineering',
    parent_id: null,
    depth: 0,
    is_active: true,
    created_by: EMP.owner,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
  },
  {
    id: DEPT.design,
    name: 'Design',
    parent_id: null,
    depth: 0,
    is_active: true,
    created_by: EMP.owner,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
  },
  {
    id: DEPT.gtm,
    name: 'Go-to-market',
    parent_id: null,
    depth: 0,
    is_active: true,
    created_by: EMP.owner,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
  },
]

const designations: PreviewRow[] = [
  { id: DESIG.peoplePartner, name: 'People Partner', department_id: DEPT.people, is_active: true, created_at: NOW_ISO, updated_at: NOW_ISO },
  { id: DESIG.engineeringLead, name: 'Engineering Lead', department_id: DEPT.engineering, is_active: true, created_at: NOW_ISO, updated_at: NOW_ISO },
  { id: DESIG.engineer, name: 'Software Engineer', department_id: DEPT.engineering, is_active: true, created_at: NOW_ISO, updated_at: NOW_ISO },
  { id: DESIG.designer, name: 'Product Designer', department_id: DEPT.design, is_active: true, created_at: NOW_ISO, updated_at: NOW_ISO },
  { id: DESIG.accountManager, name: 'Account Manager', department_id: DEPT.gtm, is_active: true, created_at: NOW_ISO, updated_at: NOW_ISO },
]

const team = [
  {
    id: EMP.owner,
    authId: PREVIEW_USER_ID,
    code: 'ATD-0001',
    first: 'Avery',
    last: 'Chen',
    role: 'owner',
    department: DEPT.people,
    designation: DESIG.peoplePartner,
    manager: null,
    join: `${CURRENT_YEAR - 2}-01-15`,
    email: 'demo.owner@example.com',
  },
  {
    id: EMP.hr,
    authId: '00000000-0000-4000-8000-000000000012',
    code: 'ATD-0002',
    first: 'Priya',
    last: 'Sharma',
    role: 'hr',
    department: DEPT.people,
    designation: DESIG.peoplePartner,
    manager: EMP.owner,
    join: `${CURRENT_YEAR - 1}-03-04`,
    email: 'priya@example.com',
  },
  {
    id: EMP.marco,
    authId: '00000000-0000-4000-8000-000000000013',
    code: 'ATD-0003',
    first: 'Marco',
    last: 'Liu',
    role: 'employee',
    department: DEPT.engineering,
    designation: DESIG.engineeringLead,
    manager: EMP.owner,
    join: `${CURRENT_YEAR - 2}-09-11`,
    email: 'marco@example.com',
  },
  {
    id: EMP.noor,
    authId: '00000000-0000-4000-8000-000000000014',
    code: 'ATD-0004',
    first: 'Noor',
    last: 'Ahmed',
    role: 'employee',
    department: DEPT.design,
    designation: DESIG.designer,
    manager: EMP.marco,
    join: `${CURRENT_YEAR - 1}-06-17`,
    email: 'noor@example.com',
  },
  {
    id: EMP.sam,
    authId: '00000000-0000-4000-8000-000000000015',
    code: 'ATD-0005',
    first: 'Sam',
    last: 'Rivera',
    role: 'employee',
    department: DEPT.engineering,
    designation: DESIG.engineer,
    manager: EMP.marco,
    join: `${CURRENT_YEAR - 1}-10-02`,
    email: 'sam@example.com',
  },
  {
    id: EMP.elena,
    authId: '00000000-0000-4000-8000-000000000016',
    code: 'ATD-0006',
    first: 'Elena',
    last: 'Popova',
    role: 'employee',
    department: DEPT.gtm,
    designation: DESIG.accountManager,
    manager: EMP.owner,
    join: `${CURRENT_YEAR}-02-19`,
    email: 'elena@example.com',
  },
]

function employeeSummary(person: (typeof team)[number]) {
  return {
    id: person.id,
    first_name: person.first,
    last_name: person.last,
    employee_code: person.code,
  }
}

const employees: PreviewRow[] = team.map((person, index) => ({
  id: person.id,
  auth_id: person.authId,
  employee_code: person.code,
  first_name: person.first,
  last_name: person.last,
  email: person.email,
  personal_email: `${person.first.toLowerCase()}.${person.last.toLowerCase()}@personal.example`,
  phone: `+1 555 010${index}`,
  department_id: person.department,
  designation_id: person.designation,
  role: person.role,
  employment_type: 'full_time',
  employment_status: 'active',
  join_date: person.join,
  probation_end_date: addDaysIso(person.join, 90),
  is_active: true,
  is_first_login: false,
  reporting_manager_id: person.manager,
  date_of_birth: `${CURRENT_YEAR - 30 - index}-0${(index % 8) + 1}-${pad((index % 20) + 10)}`,
  gender: index % 2 === 0 ? 'male' : 'female',
  address_line1: `${100 + index} Example Street`,
  address_line2: null,
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  emergency_contact_name: index === 0 ? 'Jordan Chen' : 'Demo Contact',
  emergency_contact_phone: '+1 555 0199',
  guardian_email: null,
  photo_url: null,
  current_salary: index === 0 ? 95000 : null,
  created_by: EMP.owner,
  created_at: NOW_ISO,
  updated_at: NOW_ISO,
  previous_employee_id: null,
  exit_date: null,
  department: { id: person.department, name: departmentNames[person.department] },
  designation: { id: person.designation, name: designationNames[person.designation] },
}))

export const previewEmployee = employees[0] as unknown as Employee

function createPreviewUser(person: (typeof team)[number]): User {
  return {
    id: person.authId,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { first_name: person.first, last_name: person.last },
    aud: 'authenticated',
    created_at: NOW_ISO,
    email: person.email,
    email_confirmed_at: NOW_ISO,
    last_sign_in_at: NOW_ISO,
    role: 'authenticated',
    updated_at: NOW_ISO,
  } as unknown as User
}

function createPreviewSession(user: User): Session {
  return {
    access_token: 'preview-access-token',
    refresh_token: 'preview-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user,
  } as unknown as Session
}

export const previewUser = createPreviewUser(team[0])
export const previewSession = createPreviewSession(previewUser)

export function previewUserForEmail(email: string): User {
  const normalized = email.trim().toLowerCase()
  const person = team.find((candidate) => candidate.email === normalized) ?? team[0]
  return createPreviewUser(person)
}

export function previewSessionForUser(user: User): Session {
  return createPreviewSession(user)
}

const shifts: PreviewRow[] = [
  {
    id: SHIFT_ID,
    name: 'Standard day',
    start_time: '09:30',
    end_time: '18:30',
    break_minutes: 60,
    weekly_off_days: [0, 6],
    grace_period_minutes: 10,
    half_day_threshold_minutes: 45,
    early_checkout_grace_minutes: 15,
    late_mark_threshold: 3,
    is_night_shift: false,
    is_active: true,
    is_default: true,
    saturday_start_time: null,
    saturday_end_time: null,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
  },
]

const leaveTypes: PreviewRow[] = [
  {
    id: '00000000-0000-4000-8000-000000000701',
    name: 'Paid time off',
    code: 'PTO',
    accrual_type: 'yearly',
    accrual_days: 20,
    max_carry_forward_days: 5,
    carry_forward_expiry_days: 90,
    min_notice_days: 3,
    requires_attachment: false,
    attachment_required_after_days: null,
    is_lwp: false,
    is_encashable: false,
    allow_negative_balance: false,
    applicable_gender: null,
    max_consecutive_days: null,
    max_per_month: null,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
  },
  {
    id: '00000000-0000-4000-8000-000000000702',
    name: 'Sick leave',
    code: 'SICK',
    accrual_type: 'yearly',
    accrual_days: 10,
    max_carry_forward_days: 0,
    carry_forward_expiry_days: null,
    min_notice_days: 0,
    requires_attachment: true,
    attachment_required_after_days: 2,
    is_lwp: false,
    is_encashable: false,
    allow_negative_balance: false,
    applicable_gender: null,
    max_consecutive_days: null,
    max_per_month: null,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
  },
  {
    id: '00000000-0000-4000-8000-000000000703',
    name: 'Unpaid leave',
    code: 'UNPAID',
    accrual_type: 'manual',
    accrual_days: null,
    max_carry_forward_days: 0,
    carry_forward_expiry_days: null,
    min_notice_days: 0,
    requires_attachment: false,
    attachment_required_after_days: null,
    is_lwp: true,
    is_encashable: false,
    allow_negative_balance: false,
    applicable_gender: null,
    max_consecutive_days: null,
    max_per_month: null,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO,
  },
]

const leaveTypeByCode = Object.fromEntries(leaveTypes.map((row) => [row.code, row])) as Record<string, PreviewRow>

const leaveBalances: PreviewRow[] = []
for (const [employeeIndex, person] of team.entries()) {
  for (const leaveType of leaveTypes) {
    const code = String(leaveType.code)
    const opening = code === 'PTO' ? 15 : code === 'SICK' ? 8 : 0
    const taken = code === 'PTO' ? [4, 2, 3, 1, 0, 2][employeeIndex] : code === 'SICK' ? [1, 0, 1, 1, 0, 0][employeeIndex] : 0
    const pending = code === 'PTO' ? [0, 0, 0, 0, 2, 1][employeeIndex] : 0
    leaveBalances.push({
      id: `leave-balance-${person.id}-${code}`,
      employee_id: person.id,
      leave_type_id: leaveType.id,
      year: CURRENT_YEAR,
      opening_balance: opening,
      annual_allocation: code === 'PTO' ? 20 : code === 'SICK' ? 10 : 0,
      carry_forward_amount: employeeIndex === 0 && code === 'PTO' ? 2 : 0,
      carry_forward_expiry: employeeIndex === 0 && code === 'PTO' ? `${CURRENT_YEAR}-12-31` : null,
      accrued: 0,
      taken,
      pending,
      adjusted: 0,
      updated_at: NOW_ISO,
      leave_type: leaveType,
    })
  }
}

const todayAttendanceDates = previousWeekdays(12)

const attendanceRecords: PreviewRow[] = []
for (const [employeeIndex, person] of team.entries()) {
  for (const [dateIndex, date] of todayAttendanceDates.entries()) {
    let status = 'present'
    let checkIn = '09:30'
    let checkOut = '18:30'
    let totalHours: number | null = 8
    let isLate = false
    let isWfh = false
    let isGeoFlagged = false
    let earlyCheckoutStatus: string | null = null
    let earlyCheckoutReason: string | null = null

    if (employeeIndex === 3 && dateIndex === 2) {
      status = 'on_leave'
    } else if (employeeIndex === 4 && dateIndex === 5) {
      status = 'absent'
    } else if (employeeIndex === 5 && dateIndex === 7) {
      status = 'work_from_home'
      isWfh = true
      checkIn = '09:35'
      checkOut = '18:15'
      totalHours = 7.75
    } else if (employeeIndex === 2 && dateIndex === 10) {
      status = 'late'
      checkIn = '10:35'
      checkOut = '18:40'
      totalHours = 7.5
      isLate = true
    } else if (employeeIndex === 1 && dateIndex === 4) {
      status = 'work_from_home'
      isWfh = true
      checkIn = '09:20'
      checkOut = '18:30'
    } else if (employeeIndex === 0 && dateIndex === 8) {
      status = 'half_day'
      checkIn = '09:30'
      checkOut = '13:30'
      totalHours = 4
    }

    if (employeeIndex === 1 && dateIndex === 6) {
      isGeoFlagged = true
    }

    if (employeeIndex === 2 && dateIndex === 11) {
      earlyCheckoutStatus = 'pending'
      earlyCheckoutReason = 'School pickup'
      checkOut = '16:30'
      totalHours = 6
    }

    const hasPunch = status !== 'absent' && status !== 'on_leave'
    const checkInTime = hasPunch ? localISO(date, checkIn) : null
    const checkOutTime = hasPunch ? localISO(date, checkOut) : null

    attendanceRecords.push({
      id: `attendance-${person.id}-${date}`,
      employee_id: person.id,
      date,
      shift_id: SHIFT_ID,
      check_in_time: checkInTime,
      check_out_time: checkOutTime,
      check_in_ip: hasPunch ? '203.0.113.10' : null,
      check_in_lat: hasPunch ? (isGeoFlagged ? 19.19 : 19.076) : null,
      check_in_lng: hasPunch ? (isGeoFlagged ? 72.91 : 72.8777) : null,
      check_out_lat: hasPunch ? 19.076 : null,
      check_out_lng: hasPunch ? 72.8777 : null,
      is_geo_flagged: isGeoFlagged,
      is_wfh: isWfh,
      wfh_start_time: isWfh ? checkInTime : null,
      wfh_end_time: isWfh ? checkOutTime : null,
      status,
      total_hours: totalHours,
      is_late: isLate,
      is_manually_entered: false,
      manual_entry_by: null,
      manual_entry_reason: null,
      overtime_hours: null,
      overtime_approved: null,
      overtime_approved_by: null,
      early_checkout_reason: earlyCheckoutReason,
      early_checkout_status: earlyCheckoutStatus,
      checkout_reminder_sent_at: null,
      created_at: checkInTime ?? `${date}T09:30:00.000Z`,
      updated_at: checkOutTime ?? `${date}T09:30:00.000Z`,
      employee: employeeSummary(person),
    })
  }
}

const nextMonday = nextWeekday(1)
const nextTuesday = addDays(nextMonday, 1)
const nextWednesday = addDays(nextMonday, 2)
const nextFriday = addDays(nextMonday, 4)
const lastWeek = previousWeekdays(8)

const leaveApplications: PreviewRow[] = [
  {
    id: '00000000-0000-4000-8000-000000000801',
    employee_id: EMP.sam,
    leave_type_id: leaveTypeByCode.PTO.id,
    from_date: dateOnly(nextMonday),
    to_date: dateOnly(nextTuesday),
    working_days_count: 2,
    reason: 'Family trip',
    status: 'pending',
    applied_at: hoursAgo(20),
    reviewed_by: null,
    reviewed_at: null,
    reviewer_comment: null,
    cancellation_requested: false,
    cancellation_requested_at: null,
    cancellation_reason: null,
    cancelled_by: null,
    cancelled_at: null,
    escalated_at: null,
    escalated_to: null,
    attachment_path: null,
    is_half_day: false,
    half_day_period: null,
    lwp_days: 0,
    leave_type: leaveTypeByCode.PTO,
    employee: employeeSummary(team[4]),
  },
  {
    id: '00000000-0000-4000-8000-000000000802',
    employee_id: EMP.noor,
    leave_type_id: leaveTypeByCode.SICK.id,
    from_date: lastWeek[lastWeek.length - 1],
    to_date: lastWeek[lastWeek.length - 1],
    working_days_count: 1,
    reason: 'Flu recovery',
    status: 'approved',
    applied_at: daysAgo(5),
    reviewed_by: EMP.hr,
    reviewed_at: daysAgo(4),
    reviewer_comment: 'Get well soon.',
    cancellation_requested: false,
    cancellation_requested_at: null,
    cancellation_reason: null,
    cancelled_by: null,
    cancelled_at: null,
    escalated_at: null,
    escalated_to: null,
    attachment_path: null,
    is_half_day: false,
    half_day_period: null,
    lwp_days: 0,
    leave_type: leaveTypeByCode.SICK,
    employee: employeeSummary(team[3]),
  },
  {
    id: '00000000-0000-4000-8000-000000000803',
    employee_id: EMP.elena,
    leave_type_id: leaveTypeByCode.PTO.id,
    from_date: dateOnly(nextWednesday),
    to_date: dateOnly(nextWednesday),
    working_days_count: 1,
    reason: 'Personal appointment',
    status: 'pending',
    applied_at: hoursAgo(2),
    reviewed_by: null,
    reviewed_at: null,
    reviewer_comment: null,
    cancellation_requested: false,
    cancellation_requested_at: null,
    cancellation_reason: null,
    cancelled_by: null,
    cancelled_at: null,
    escalated_at: null,
    escalated_to: null,
    attachment_path: null,
    is_half_day: false,
    half_day_period: null,
    lwp_days: 0,
    leave_type: leaveTypeByCode.PTO,
    employee: employeeSummary(team[5]),
  },
  {
    id: '00000000-0000-4000-8000-000000000804',
    employee_id: EMP.owner,
    leave_type_id: leaveTypeByCode.PTO.id,
    from_date: dateOnly(nextFriday),
    to_date: dateOnly(nextFriday),
    working_days_count: 1,
    reason: 'A long weekend',
    status: 'approved',
    applied_at: daysAgo(6),
    reviewed_by: EMP.hr,
    reviewed_at: daysAgo(5),
    reviewer_comment: 'Enjoy the break.',
    cancellation_requested: false,
    cancellation_requested_at: null,
    cancellation_reason: null,
    cancelled_by: null,
    cancelled_at: null,
    escalated_at: null,
    escalated_to: null,
    attachment_path: null,
    is_half_day: false,
    half_day_period: null,
    lwp_days: 0,
    leave_type: leaveTypeByCode.PTO,
    employee: employeeSummary(team[0]),
  },
]

const samAttendance = attendanceRecords.find(
  (row) => row.employee_id === EMP.sam && row.date === todayAttendanceDates[8]
)

const regularizationRequests: PreviewRow[] = [
  {
    id: '00000000-0000-4000-8000-000000000901',
    attendance_record_id: samAttendance?.id ?? '',
    employee_id: EMP.sam,
    reason: 'Client call ran late and I forgot to check out.',
    requested_check_in: samAttendance?.check_in_time ?? null,
    requested_check_out: localISO(todayAttendanceDates[8], '18:45'),
    requested_status: 'present',
    status: 'pending',
    reviewed_by: null,
    reviewed_at: null,
    reviewer_comment: null,
    created_at: hoursAgo(7),
    employee: employeeSummary(team[4]),
    attendance_record: samAttendance
      ? {
          id: samAttendance.id,
          date: samAttendance.date,
          check_in_time: samAttendance.check_in_time,
          check_out_time: samAttendance.check_out_time,
          status: samAttendance.status,
          is_wfh: samAttendance.is_wfh,
          total_hours: samAttendance.total_hours,
        }
      : null,
  },
]

const notifications: PreviewRow[] = [
  {
    id: '00000000-0000-4000-8000-000000001001',
    recipient_id: EMP.owner,
    title: 'Time off request from Sam',
    body: 'Sam Rivera requested 2 days off starting next Monday.',
    type: 'leave_requested',
    reference_id: leaveApplications[0].id,
    reference_table: 'leave_applications',
    is_read: false,
    read_at: null,
    created_at: minutesAgo(18),
  },
  {
    id: '00000000-0000-4000-8000-000000001002',
    recipient_id: EMP.owner,
    title: 'Attendance correction to review',
    body: 'Sam Rivera asked for a correction on a recent attendance record.',
    type: 'attendance_regularization',
    reference_id: regularizationRequests[0].id,
    reference_table: 'attendance_regularization_requests',
    is_read: false,
    read_at: null,
    created_at: hoursAgo(2),
  },
  {
    id: '00000000-0000-4000-8000-000000001003',
    recipient_id: EMP.owner,
    title: 'A new announcement is live',
    body: 'Team pulse is live — open the dashboard to see the weekly trend.',
    type: 'announcement',
    reference_id: null,
    reference_table: null,
    is_read: false,
    read_at: null,
    created_at: hoursAgo(26),
  },
  {
    id: '00000000-0000-4000-8000-000000001004',
    recipient_id: EMP.owner,
    title: 'Welcome to Attendora',
    body: 'This is a synthetic preview workspace. Every person and note is fictional.',
    type: 'announcement',
    reference_id: null,
    reference_table: null,
    is_read: true,
    read_at: hoursAgo(30),
    created_at: daysAgo(2),
  },
]

const announcements: PreviewRow[] = [
  {
    id: '00000000-0000-4000-8000-000000001101',
    title: 'Welcome to Attendora',
    body: 'This is a synthetic demo workspace for exploring Attendora. Every person, email, and note here is fictional. Nothing is sent to a real inbox.',
    created_by: EMP.owner,
    created_at: daysAgo(3),
    updated_at: null,
    is_active: true,
  },
  {
    id: '00000000-0000-4000-8000-000000001102',
    title: 'Team pulse is live',
    body: 'Open your dashboard and try the weekly pulse check-in. Leads see an aggregate trend only — individual responses and notes stay private.',
    created_by: EMP.owner,
    created_at: daysAgo(2),
    updated_at: null,
    is_active: true,
  },
]

const pulseWeeks = Array.from({ length: 6 }, (_, index) => weekStart(addDays(NOW, -(5 - index) * 7)))
const pulseResponses: PreviewRow[] = []
for (const [employeeIndex, person] of team.entries()) {
  for (const [weekIndex, week] of pulseWeeks.entries()) {
    if (employeeIndex + weekIndex === 7) continue
    if (weekIndex === pulseWeeks.length - 1 && employeeIndex === 0) continue
    pulseResponses.push({
      id: `pulse-${person.id}-${week}`,
      employee_id: person.id,
      week_start: week,
      score: 3 + ((employeeIndex + weekIndex) % 3),
      note:
        employeeIndex === 1 && weekIndex === pulseWeeks.length - 1
          ? 'Busy week, but good momentum.'
          : null,
      created_at: localISO(week, '17:00'),
      updated_at: localISO(week, '17:00'),
    })
  }
}

const geofenceConfig: PreviewRow[] = [
  {
    id: GEOFENCE_ID,
    label: 'Studio office',
    latitude: 19.076,
    longitude: 72.8777,
    radius_meters: 300,
    is_active: true,
    created_by: EMP.owner,
    created_at: NOW_ISO,
  },
]

const locationSnapshots: PreviewRow[] = []
for (const record of attendanceRecords) {
  const person = team.find((candidate) => candidate.id === record.employee_id)
  if (!person || !record.check_in_time || !record.check_out_time) continue
  const inside = !record.is_geo_flagged
  locationSnapshots.push({
    id: `location-${record.id}-in`,
    employee_id: record.employee_id,
    attendance_record_id: record.id,
    action: 'check_in',
    latitude: record.check_in_lat,
    longitude: record.check_in_lng,
    inside_geofence: inside,
    ip: record.check_in_ip,
    successful: true,
    error_code: null,
    created_at: record.check_in_time,
    employee: { first_name: person.first, last_name: person.last },
  })
  locationSnapshots.push({
    id: `location-${record.id}-out`,
    employee_id: record.employee_id,
    attendance_record_id: record.id,
    action: 'check_out',
    latitude: record.check_out_lat,
    longitude: record.check_out_lng,
    inside_geofence: inside,
    ip: record.check_in_ip,
    successful: true,
    error_code: null,
    created_at: record.check_out_time,
    employee: { first_name: person.first, last_name: person.last },
  })
}

// A small amount of today's context makes the map cards useful before anyone
// has checked in during the preview session.
for (const person of [team[1], team[4]]) {
  locationSnapshots.push({
    id: `location-today-${person.id}`,
    employee_id: person.id,
    attendance_record_id: null,
    action: 'check_in',
    latitude: 19.0761,
    longitude: 72.8778,
    inside_geofence: true,
    ip: '203.0.113.10',
    successful: true,
    error_code: null,
    created_at: localISO(TODAY, '09:18'),
    employee: { first_name: person.first, last_name: person.last },
  })
}

const holidays: PreviewRow[] = [
  { id: '00000000-0000-4000-8000-000000001201', date: `${CURRENT_YEAR}-01-01`, name: "New Year's Day", type: 'national', is_optional: false, year: CURRENT_YEAR, state_code: null, created_at: NOW_ISO },
  { id: '00000000-0000-4000-8000-000000001202', date: `${CURRENT_YEAR}-03-20`, name: 'Spring Day', type: 'company', is_optional: false, year: CURRENT_YEAR, state_code: null, created_at: NOW_ISO },
  { id: '00000000-0000-4000-8000-000000001203', date: `${CURRENT_YEAR}-07-04`, name: 'Midyear Reset', type: 'company', is_optional: false, year: CURRENT_YEAR, state_code: null, created_at: NOW_ISO },
  { id: HOLIDAY_ID, date: `${CURRENT_YEAR}-11-27`, name: 'Harvest Day', type: 'optional', is_optional: true, year: CURRENT_YEAR, state_code: null, created_at: NOW_ISO },
  { id: '00000000-0000-4000-8000-000000001205', date: `${CURRENT_YEAR}-12-25`, name: 'Winter Day', type: 'national', is_optional: false, year: CURRENT_YEAR, state_code: null, created_at: NOW_ISO },
  { id: '00000000-0000-4000-8000-000000001206', date: `${CURRENT_YEAR + 1}-01-01`, name: "New Year's Day", type: 'national', is_optional: false, year: CURRENT_YEAR + 1, state_code: null, created_at: NOW_ISO },
]

const optionalHolidays: PreviewRow[] = [
  {
    id: '00000000-0000-4000-8000-000000001301',
    employee_id: EMP.owner,
    holiday_id: HOLIDAY_ID,
    year: CURRENT_YEAR,
    created_at: NOW_ISO,
  },
]

const appConfig: PreviewRow[] = [
  { key: 'attendance_location_policy', value: 'flag', description: 'Attendance location policy: off, flag, or strict', updated_at: NOW_ISO, updated_by: EMP.owner },
  { key: 'regularization_window_days', value: '7', description: 'Max calendar days in the past for attendance corrections', updated_at: NOW_ISO, updated_by: EMP.owner },
  { key: 'leave_sla_business_days', value: '2', description: 'Business days before a pending time-off request is escalated', updated_at: NOW_ISO, updated_by: EMP.owner },
  { key: 'optional_holiday_limit_per_year', value: '2', description: 'Max optional holidays an employee can opt into per year', updated_at: NOW_ISO, updated_by: EMP.owner },
  { key: 'auto_checkout_time', value: '23:59:00', description: 'Local time at which auto-checkout runs', updated_at: NOW_ISO, updated_by: EMP.owner },
  { key: 'rehire_carry_leave_balance', value: 'false', description: 'Carry time-off balance when an employee is rehired', updated_at: NOW_ISO, updated_by: EMP.owner },
]

const ipWhitelist: PreviewRow[] = [
  {
    id: '00000000-0000-4000-8000-000000001401',
    label: 'Studio network',
    ip_range: '203.0.113.0/24',
    is_active: true,
    created_by: EMP.owner,
    created_at: NOW_ISO,
  },
  {
    id: '00000000-0000-4000-8000-000000001402',
    label: 'People Ops VPN',
    ip_range: '198.51.100.10/32',
    is_active: true,
    created_by: EMP.owner,
    created_at: NOW_ISO,
  },
]

const departmentShifts: PreviewRow[] = [DEPT.people, DEPT.engineering, DEPT.design, DEPT.gtm].map((departmentId, index) => ({
  id: `department-shift-${index + 1}`,
  department_id: departmentId,
  shift_id: SHIFT_ID,
  effective_from: `${CURRENT_YEAR}-01-01`,
  effective_to: null,
  shift: { name: 'Standard day' },
  department: { name: departmentNames[departmentId] },
}))

const employeeShiftOverrides: PreviewRow[] = [
  {
    id: '00000000-0000-4000-8000-000000001501',
    employee_id: EMP.sam,
    shift_id: SHIFT_ID,
    effective_from: `${CURRENT_YEAR}-01-01`,
    effective_to: null,
    assigned_by: EMP.owner,
    shift: { name: 'Standard day' },
    employee: employeeSummary(team[4]),
  },
]

const onboardingTemplates: PreviewRow[] = [
  { id: '00000000-0000-4000-8000-000000001601', item_name: 'Meet your manager', description: 'Book a 30-minute intro chat.', is_required: true, sort_order: 1, is_active: true, created_at: NOW_ISO },
  { id: '00000000-0000-4000-8000-000000001602', item_name: 'Read the workspace handbook', description: 'Find the handbook in your welcome email.', is_required: true, sort_order: 2, is_active: true, created_at: NOW_ISO },
  { id: '00000000-0000-4000-8000-000000001603', item_name: 'Set up your tools', description: 'Get access to the tools your team uses.', is_required: true, sort_order: 3, is_active: true, created_at: NOW_ISO },
  { id: '00000000-0000-4000-8000-000000001604', item_name: 'Complete payroll details', description: 'Add your bank and tax details securely.', is_required: false, sort_order: 4, is_active: true, created_at: NOW_ISO },
]

const onboardingProgress: PreviewRow[] = onboardingTemplates.map((template, index) => ({
  id: `onboarding-progress-${String(template.id).slice(-1)}`,
  employee_id: EMP.owner,
  checklist_item_id: template.id,
  is_completed: index < 2,
  completed_at: index < 2 ? daysAgo(10 - index) : null,
  completed_by: index < 2 ? EMP.owner : null,
  template,
}))

const employeeDocuments: PreviewRow[] = [
  {
    id: '00000000-0000-4000-8000-000000001701',
    employee_id: EMP.owner,
    document_type: 'id_proof',
    file_name: 'avery-chen-id.pdf',
    file_size_bytes: 184320,
    mime_type: 'application/pdf',
    storage_path: 'demo/owner/avery-chen-id.pdf',
    document_hash: null,
    uploaded_by: EMP.owner,
    is_active: true,
    created_at: daysAgo(40),
  },
  {
    id: '00000000-0000-4000-8000-000000001702',
    employee_id: EMP.owner,
    document_type: 'offer_letter',
    file_name: 'avery-chen-offer.pdf',
    file_size_bytes: 96256,
    mime_type: 'application/pdf',
    storage_path: 'demo/owner/avery-chen-offer.pdf',
    document_hash: null,
    uploaded_by: EMP.owner,
    is_active: true,
    created_at: daysAgo(45),
  },
]

const employeeBankDetails: PreviewRow[] = [
  {
    id: '00000000-0000-4000-8000-000000001801',
    employee_id: EMP.owner,
    bank_name: 'Example Bank',
    account_holder_name: 'Avery Chen',
    account_number_last4: '4242',
    account_number_encrypted: 'preview-encrypted-value',
    ifsc_code: 'EXMP0000123',
    is_active: true,
    updated_by: EMP.owner,
    created_at: daysAgo(50),
    updated_at: daysAgo(20),
  },
]

const lifecycleEvents: PreviewRow[] = [
  {
    id: '00000000-0000-4000-8000-000000001901',
    employee_id: EMP.owner,
    event_type: 'promotion',
    effective_date: `${CURRENT_YEAR - 1}-04-01`,
    reason: 'Expanded ownership of people operations.',
    previous_department_id: DEPT.people,
    new_department_id: DEPT.people,
    previous_designation_id: DESIG.peoplePartner,
    new_designation_id: DESIG.peoplePartner,
    previous_salary: 82000,
    new_salary: 95000,
    document_path: null,
    performed_by: EMP.owner,
    created_at: daysAgo(180),
    performer: employeeSummary(team[0]),
    previous_department: { id: DEPT.people, name: 'People Ops' },
    new_department: { id: DEPT.people, name: 'People Ops' },
    previous_designation: { id: DESIG.peoplePartner, name: 'People Partner' },
    new_designation: { id: DESIG.peoplePartner, name: 'People Partner' },
  },
]

const profileEditRequests: PreviewRow[] = [
  {
    id: '00000000-0000-4000-8000-000000002001',
    employee_id: EMP.sam,
    requested_changes: {
      phone: '+1 555 0177',
      emergency_contact_name: 'Riley Rivera',
    },
    status: 'pending',
    reviewed_by: null,
    reviewer_notes: null,
    created_at: hoursAgo(9),
    updated_at: hoursAgo(9),
    employee: { ...employeeSummary(team[4]), photo_url: null },
  },
]

const auditLogs: PreviewRow[] = [
  {
    id: '00000000-0000-4000-8000-000000002101',
    table_name: 'leave_applications',
    action: 'INSERT',
    record_id: leaveApplications[0].id,
    actor_id: EMP.sam,
    actor_role: 'employee',
    actor_system_function: null,
    old_data: null,
    new_data: { status: 'pending', working_days_count: 2 },
    ip_address: '203.0.113.10',
    created_at: hoursAgo(20),
  },
  {
    id: '00000000-0000-4000-8000-000000002102',
    table_name: 'attendance_records',
    action: 'UPDATE',
    record_id: samAttendance?.id ?? '',
    actor_id: EMP.sam,
    actor_role: 'employee',
    actor_system_function: null,
    old_data: { status: 'present' },
    new_data: { status: 'present', is_manual: false },
    ip_address: '203.0.113.10',
    created_at: hoursAgo(18),
  },
  {
    id: '00000000-0000-4000-8000-000000002103',
    table_name: 'employees',
    action: 'UPDATE',
    record_id: EMP.elena,
    actor_id: EMP.hr,
    actor_role: 'hr',
    actor_system_function: null,
    old_data: { designation_id: DESIG.engineer },
    new_data: { designation_id: DESIG.accountManager },
    ip_address: '198.51.100.10',
    created_at: daysAgo(2),
  },
  {
    id: '00000000-0000-4000-8000-000000002104',
    table_name: 'app_config',
    action: 'UPDATE',
    record_id: 'attendance_location_policy',
    actor_id: EMP.owner,
    actor_role: 'owner',
    actor_system_function: null,
    old_data: { value: 'off' },
    new_data: { value: 'flag' },
    ip_address: '198.51.100.10',
    created_at: daysAgo(4),
  },
]

export const fixtures: Record<string, PreviewRow[]> = {
  announcements,
  app_config: appConfig,
  attendance_records: attendanceRecords,
  attendance_regularization_requests: regularizationRequests,
  audit_logs: auditLogs,
  department_shifts: departmentShifts,
  departments,
  designations,
  employee_bank_details: employeeBankDetails,
  employee_documents: employeeDocuments,
  employee_lifecycle_events: lifecycleEvents,
  employee_onboarding_progress: onboardingProgress,
  employee_optional_holidays: optionalHolidays,
  employee_shift_overrides: employeeShiftOverrides,
  employees,
  geofence_config: geofenceConfig,
  holidays,
  ip_whitelist: ipWhitelist,
  leave_applications: leaveApplications,
  leave_balances: leaveBalances,
  leave_types: leaveTypes,
  location_snapshots: locationSnapshots,
  notifications,
  onboarding_checklist_templates: onboardingTemplates,
  profile_edit_requests: profileEditRequests,
  pulse_responses: pulseResponses,
  shifts,
}

export const previewMeta = {
  today: TODAY,
  currentYear: CURRENT_YEAR,
  ownerId: EMP.owner,
  employeeId: EMP.sam,
  hrId: EMP.hr,
  shiftId: SHIFT_ID,
  leaveTypePtoId: leaveTypeByCode.PTO.id as string,
}
