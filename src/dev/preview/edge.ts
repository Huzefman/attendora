import { fixtures, previewMeta, type PreviewRow } from './data'
import { getPreviewEmployeeRow } from './supabase'

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function nowIso(): string {
  return new Date().toISOString()
}

function employeeSummary(employee: PreviewRow | null) {
  if (!employee) return null
  return {
    id: employee.id,
    first_name: employee.first_name,
    last_name: employee.last_name,
    employee_code: employee.employee_code,
  }
}

function currentEmployee(): PreviewRow {
  return (
    getPreviewEmployeeRow() ??
    fixtures.employees.find((row) => row.id === previewMeta.ownerId) ?? {
      id: previewMeta.ownerId,
      first_name: 'Avery',
      last_name: 'Chen',
      employee_code: 'ATD-0001',
    }
  )
}

function todayRecord(employeeId: unknown): PreviewRow | undefined {
  return fixtures.attendance_records.find(
    (row) => row.employee_id === employeeId && row.date === previewMeta.today
  )
}

function ensureTodayRecord(employee: PreviewRow): PreviewRow {
  const existing = todayRecord(employee.id)
  if (existing) return existing

  const record: PreviewRow = {
    id: `attendance-${employee.id}-${previewMeta.today}`,
    employee_id: employee.id,
    date: previewMeta.today,
    shift_id: previewMeta.shiftId,
    check_in_time: null,
    check_out_time: null,
    check_in_ip: '203.0.113.10',
    check_in_lat: 19.076,
    check_in_lng: 72.8777,
    check_out_lat: null,
    check_out_lng: null,
    is_geo_flagged: false,
    is_wfh: false,
    wfh_start_time: null,
    wfh_end_time: null,
    status: 'present',
    total_hours: null,
    is_late: false,
    is_manually_entered: false,
    manual_entry_by: null,
    manual_entry_reason: null,
    overtime_hours: null,
    overtime_approved: null,
    overtime_approved_by: null,
    early_checkout_reason: null,
    early_checkout_status: null,
    checkout_reminder_sent_at: null,
    created_at: nowIso(),
    updated_at: nowIso(),
    employee: employeeSummary(employee),
  }
  fixtures.attendance_records.push(record)
  return record
}

function leaveTypeFor(id: unknown): PreviewRow | null {
  return fixtures.leave_types.find((row) => row.id === id) ?? null
}

function notify(title: string, body: string, type: string) {
  fixtures.notifications.unshift({
    id: `notification-${Date.now()}`,
    recipient_id: currentEmployee().id,
    title,
    body,
    type,
    reference_id: null,
    reference_table: null,
    is_read: false,
    read_at: null,
    created_at: nowIso(),
  })
}

export function previewEdgeResponse(functionName: string, body: unknown): unknown {
  const payload = asRecord(body)
  const employee = currentEmployee()

  switch (functionName) {
    case 'check-network':
      return { whitelisted: true }

    case 'check-in': {
      const record = ensureTodayRecord(employee)
      if (record.check_in_time) {
        return {
          attendance_record_id: record.id,
          check_in_time: record.check_in_time,
          is_late: Boolean(record.is_late),
          is_geo_flagged: Boolean(record.is_geo_flagged),
          status: record.status,
        }
      }
      record.check_in_time = nowIso()
      record.status = 'present'
      record.updated_at = record.check_in_time
      return {
        attendance_record_id: record.id,
        check_in_time: record.check_in_time,
        is_late: false,
        is_geo_flagged: false,
        status: 'present',
        late_count_this_month: 0,
        late_threshold: 3,
      }
    }

    case 'check-out': {
      const record = ensureTodayRecord(employee)
      const checkIn = record.check_in_time ? new Date(String(record.check_in_time)) : new Date()
      const checkOut = new Date()
      const totalHours = Math.max(0, (checkOut.getTime() - checkIn.getTime()) / 3_600_000)
      record.check_out_time = checkOut.toISOString()
      record.total_hours = Number(totalHours.toFixed(2))
      record.status = 'present'
      record.updated_at = record.check_out_time
      return {
        attendance_record_id: record.id,
        check_out_time: record.check_out_time,
        total_hours: record.total_hours,
        is_geo_flagged: false,
      }
    }

    case 'log-wfh': {
      const record = ensureTodayRecord(employee)
      record.is_wfh = true
      record.wfh_start_time = nowIso()
      record.check_in_time = record.check_in_time ?? record.wfh_start_time
      record.status = 'work_from_home'
      record.updated_at = record.wfh_start_time
      return {
        attendance_record_id: record.id,
        is_wfh: true,
        wfh_start_time: record.wfh_start_time,
      }
    }

    case 'end-wfh': {
      const record = ensureTodayRecord(employee)
      record.wfh_end_time = nowIso()
      record.check_out_time = record.wfh_end_time
      const start = record.wfh_start_time ? new Date(String(record.wfh_start_time)) : new Date()
      record.total_hours = Number(Math.max(0, (Date.now() - start.getTime()) / 3_600_000).toFixed(2))
      record.updated_at = record.wfh_end_time
      return {
        attendance_record_id: record.id,
        wfh_start_time: record.wfh_start_time,
        wfh_end_time: record.wfh_end_time,
        total_hours: record.total_hours,
      }
    }

    case 'submit-pulse': {
      const score = asNumber(payload.score, 3)
      const note = asString(payload.note) || null
      const weekStart = (() => {
        const date = new Date()
        const daysSinceMonday = (date.getDay() + 6) % 7
        date.setDate(date.getDate() - daysSinceMonday)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      })()
      const existing = fixtures.pulse_responses.find(
        (row) => row.employee_id === employee.id && row.week_start === weekStart
      )
      if (existing) {
        existing.score = score
        existing.note = note
        existing.updated_at = nowIso()
        return { ...existing }
      }
      const row: PreviewRow = {
        id: `pulse-${employee.id}-${weekStart}`,
        employee_id: employee.id,
        week_start: weekStart,
        score,
        note,
        created_at: nowIso(),
        updated_at: nowIso(),
      }
      fixtures.pulse_responses.push(row)
      return { ...row }
    }

    case 'submit-leave': {
      const leaveTypeId = payload.leave_type_id
      const leaveType = leaveTypeFor(leaveTypeId)
      const fromDate = asString(payload.from_date, previewMeta.today)
      const toDate = asString(payload.to_date, fromDate)
      const row: PreviewRow = {
        id: `leave-application-${Date.now()}`,
        employee_id: employee.id,
        leave_type_id: leaveTypeId ?? previewMeta.leaveTypePtoId,
        from_date: fromDate,
        to_date: toDate,
        working_days_count: asNumber(payload.working_days_count, 1),
        reason: asString(payload.reason, 'Preview request'),
        status: 'pending',
        applied_at: nowIso(),
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
        is_half_day: Boolean(payload.is_half_day),
        half_day_period: payload.half_day_period ?? null,
        lwp_days: 0,
        leave_type: leaveType,
        employee: employeeSummary(employee),
      }
      fixtures.leave_applications.unshift(row)
      notify('Time off request submitted', `${employee.first_name} requested time off.`, 'leave_requested')
      return {
        application_id: row.id,
        working_days_count: row.working_days_count,
        status: 'pending',
        escalated_to: null,
      }
    }

    case 'review-leave': {
      const application = fixtures.leave_applications.find((row) => row.id === payload.application_id)
      if (application) {
        application.status = payload.action === 'approve' ? 'approved' : 'rejected'
        application.reviewed_by = employee.id
        application.reviewed_at = nowIso()
        application.reviewer_comment = payload.reviewer_comment ?? null
      }
      return { application_id: payload.application_id, status: application?.status ?? 'pending' }
    }

    case 'request-leave-cancellation':
    case 'cancel-leave': {
      const application = fixtures.leave_applications.find((row) => row.id === payload.application_id)
      if (application) {
        application.cancellation_requested = true
        application.cancellation_requested_at = nowIso()
        application.cancellation_reason = payload.reason ?? null
      }
      return { application_id: payload.application_id, status: application?.status ?? 'pending' }
    }

    case 'confirm-leave-cancellation': {
      const application = fixtures.leave_applications.find((row) => row.id === payload.application_id)
      if (application) {
        application.status = 'cancelled'
        application.cancelled_at = nowIso()
        application.cancelled_by = employee.id
      }
      return { application_id: payload.application_id, status: 'cancelled' }
    }

    case 'submit-regularization': {
      const row: PreviewRow = {
        id: `regularization-${Date.now()}`,
        attendance_record_id: payload.attendance_record_id ?? '',
        employee_id: employee.id,
        reason: asString(payload.reason, 'Preview correction'),
        requested_check_in: payload.requested_check_in ?? null,
        requested_check_out: payload.requested_check_out ?? null,
        requested_status: payload.requested_status ?? 'present',
        status: 'pending',
        reviewed_by: null,
        reviewed_at: null,
        reviewer_comment: null,
        created_at: nowIso(),
        employee: employeeSummary(employee),
      }
      fixtures.attendance_regularization_requests.unshift(row)
      notify('Attendance correction submitted', `${employee.first_name} requested an attendance correction.`, 'attendance_regularization')
      return { request_id: row.id, status: 'pending' }
    }

    case 'review-regularization': {
      const request = fixtures.attendance_regularization_requests.find((row) => row.id === payload.request_id)
      if (request) {
        request.status = payload.action === 'approve' ? 'approved' : 'rejected'
        request.reviewed_by = employee.id
        request.reviewed_at = nowIso()
        request.reviewer_comment = payload.reviewer_comment ?? null
      }
      return { request_id: payload.request_id, status: request?.status ?? 'pending' }
    }

    case 'withdraw-regularization': {
      fixtures.attendance_regularization_requests = fixtures.attendance_regularization_requests.filter(
        (row) => row.id !== payload.request_id
      )
      return { request_id: payload.request_id, status: 'withdrawn' }
    }

    case 'manual-attendance': {
      const record = ensureTodayRecord(employee)
      if (payload.check_in_time) record.check_in_time = payload.check_in_time
      if (payload.check_out_time) record.check_out_time = payload.check_out_time
      record.status = payload.status ?? 'present'
      record.is_manually_entered = true
      record.manual_entry_reason = payload.reason ?? null
      record.manual_entry_by = employee.id
      record.updated_at = nowIso()
      return {
        attendance_record_id: record.id,
        status: record.status,
        total_hours: record.total_hours ?? null,
      }
    }

    case 'bulk-import-employees':
      // CSV parsing needs a real file reader; the preview accepts the upload
      // and reports an empty batch instead of throwing.
      return { total_rows: 0, success_count: 0, failure_count: 0, failures: [] }

    case 'create-announcement': {
      const row: PreviewRow = {
        id: `announcement-${Date.now()}`,
        title: asString(payload.title, 'Untitled announcement'),
        body: asString(payload.body),
        created_by: employee.id,
        created_at: nowIso(),
        updated_at: null,
        is_active: true,
      }
      fixtures.announcements.unshift(row)
      return row
    }

    case 'update-app-config': {
      const key = asString(payload.key)
      const value = asString(payload.value)
      const existing = fixtures.app_config.find((row) => row.key === key)
      if (existing) {
        existing.value = value
        existing.updated_at = nowIso()
        existing.updated_by = employee.id
      } else if (key) {
        fixtures.app_config.push({
          key,
          value,
          description: null,
          updated_at: nowIso(),
          updated_by: employee.id,
        })
      }
      return { key, value }
    }

    case 'update-employee': {
      const target = fixtures.employees.find((row) => row.id === payload.employee_id)
      if (target) {
        for (const [key, value] of Object.entries(payload)) {
          if (key !== 'employee_id') target[key] = value
        }
        target.updated_at = nowIso()
      }
      return { id: target?.id ?? payload.employee_id }
    }

    case 'create-employee': {
      const id = `employee-${Date.now()}`
      const row: PreviewRow = {
        id,
        auth_id: `auth-${Date.now()}`,
        employee_code: `ATD-${String(fixtures.employees.length + 1).padStart(4, '0')}`,
        first_name: asString(payload.first_name, 'New'),
        last_name: asString(payload.last_name, 'Teammate'),
        email: asString(payload.email, `new.${Date.now()}@example.com`),
        role: payload.role ?? 'employee',
        employment_type: payload.employment_type ?? 'full_time',
        employment_status: payload.employment_status ?? 'active',
        join_date: payload.join_date ?? previewMeta.today,
        probation_end_date: null,
        is_active: true,
        is_first_login: true,
        reporting_manager_id: payload.reporting_manager_id ?? null,
        department_id: payload.department_id ?? null,
        designation_id: payload.designation_id ?? null,
        phone: null,
        personal_email: null,
        photo_url: null,
        created_at: nowIso(),
        updated_at: nowIso(),
      }
      fixtures.employees.push(row)
      return {
        employee_id: id,
        employee_code: row.employee_code,
        employment_status: row.employment_status,
        temporary_password: 'preview-only-password',
      }
    }

    case 'deactivate-employee':
    case 'reactivate-employee': {
      const target = fixtures.employees.find((row) => row.id === payload.employee_id)
      if (target) {
        const active = functionName === 'reactivate-employee'
        target.is_active = active
        target.employment_status = active ? 'active' : 'terminated'
        target.exit_date = active ? null : previewMeta.today
        target.updated_at = nowIso()
      }
      return functionName === 'deactivate-employee'
        ? { deactivated: true }
        : { reactivated: true }
    }

    case 'add-lifecycle-event': {
      const row: PreviewRow = {
        id: `lifecycle-${Date.now()}`,
        employee_id: payload.employee_id,
        event_type: payload.event_type ?? 'note',
        effective_date: payload.effective_date ?? previewMeta.today,
        reason: payload.reason ?? null,
        performed_by: employee.id,
        created_at: nowIso(),
      }
      fixtures.employee_lifecycle_events.unshift(row)
      return { event_id: row.id }
    }

    case 'create-employee-document':
    case 'upload-document': {
      return {
        document_id: `document-${Date.now()}`,
        storage_path: `preview/${employee.id}/${Date.now()}-document`,
      }
    }

    case 'upload-leave-attachment':
      return {
        storage_path: `preview/${employee.id}/${Date.now()}-attachment`,
        file_name: 'preview-attachment.pdf',
      }

    case 'generate-presigned-url':
      return {
        url: '#preview-document',
        expires_at: new Date(Date.now() + 300_000).toISOString(),
      }

    case 'review-profile-edit': {
      const request = fixtures.profile_edit_requests.find((row) => row.id === payload.request_id)
      if (request) {
        request.status = payload.action === 'approve' ? 'approved' : 'rejected'
        request.reviewed_by = employee.id
        request.reviewer_notes = payload.reviewer_notes ?? null
        request.updated_at = nowIso()
      }
      return { reviewed: true }
    }

    case 'opt-in-holiday': {
      const holidayId = payload.holiday_id
      const exists = fixtures.employee_optional_holidays.some(
        (row) => row.employee_id === employee.id && row.holiday_id === holidayId
      )
      if (!exists) {
        fixtures.employee_optional_holidays.push({
          id: `optional-holiday-${Date.now()}`,
          employee_id: employee.id,
          holiday_id: holidayId,
          year: previewMeta.currentYear,
          created_at: nowIso(),
        })
      }
      return { ok: true }
    }

    case 'opt-out-holiday': {
      fixtures.employee_optional_holidays = fixtures.employee_optional_holidays.filter(
        (row) => !(row.employee_id === employee.id && row.holiday_id === payload.holiday_id)
      )
      return { ok: true }
    }

    case 'sync-holiday-attendance':
    case 'subscribe-push':
      return { ok: true }

    default:
      return { ok: true }
  }
}
