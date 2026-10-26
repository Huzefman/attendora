import type {
  AuthChangeEvent,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import {
  fixtures,
  previewSession,
  previewSessionForUser,
  previewUser,
  previewUserForEmail,
  type PreviewRow,
} from './data'

type PreviewResult = {
  data: unknown
  error: { message: string } | null
  count?: number | null
}

type PreviewListener = (event: AuthChangeEvent, session: Session | null) => void
type PreviewFilter = (row: PreviewRow) => boolean

function equalValue(left: unknown, right: unknown): boolean {
  if (left === right) return true
  if (left == null || right == null) return left == null && right == null
  return String(left) === String(right)
}

function compareValues(left: unknown, right: unknown): number {
  if (left == null && right == null) return 0
  if (left == null) return 1
  if (right == null) return -1
  if (typeof left === 'number' && typeof right === 'number') return left - right
  return String(left).localeCompare(String(right))
}

function matchesLike(value: unknown, pattern: string, caseInsensitive: boolean): boolean {
  if (value == null) return false
  const source = String(value)
  const escaped = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/%/g, '.*')
    .replace(/_/g, '.')
  return new RegExp(`^${escaped}$`, caseInsensitive ? 'i' : '').test(source)
}

function predicate(column: string, operator: string, value: unknown): PreviewFilter {
  switch (operator) {
    case 'eq':
      return (row) => equalValue(row[column], value)
    case 'neq':
      return (row) => !equalValue(row[column], value)
    case 'is':
      return (row) => (value === null ? row[column] == null : equalValue(row[column], value))
    case 'in':
      return (row) => Array.isArray(value) && value.some((candidate) => equalValue(row[column], candidate))
    case 'gte':
      return (row) => compareValues(row[column], value) >= 0
    case 'lte':
      return (row) => compareValues(row[column], value) <= 0
    case 'gt':
      return (row) => compareValues(row[column], value) > 0
    case 'lt':
      return (row) => compareValues(row[column], value) < 0
    case 'like':
      return (row) => matchesLike(row[column], String(value), false)
    case 'ilike':
      return (row) => matchesLike(row[column], String(value), true)
    default:
      return () => true
  }
}

function parseOrTerm(term: string): PreviewFilter {
  const firstDot = term.indexOf('.')
  const secondDot = term.indexOf('.', firstDot + 1)
  if (firstDot === -1 || secondDot === -1) return () => false
  const column = term.slice(0, firstDot)
  const operator = term.slice(firstDot + 1, secondDot)
  const value = term.slice(secondDot + 1)
  return predicate(column, operator, value)
}

class PreviewQuery implements PromiseLike<PreviewResult> {
  private readonly table: string
  private filters: PreviewFilter[] = []
  private orders: Array<{ column: string; ascending: boolean }> = []
  private limitCount: number | null = null
  private rangeStart: number | null = null
  private rangeEnd: number | null = null
  private mode: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select'
  private payload: unknown = null
  private wantsRows = false
  private countMode = false
  private headMode = false
  private singleMode: 'none' | 'single' | 'maybe' = 'none'

  constructor(table: string) {
    this.table = table
  }

  select(_columns?: string, options?: { count?: 'exact'; head?: boolean }) {
    this.wantsRows = true
    this.countMode = options?.count === 'exact'
    this.headMode = options?.head === true
    return this
  }

  eq(column: string, value: unknown) {
    this.filters.push(predicate(column, 'eq', value))
    return this
  }

  neq(column: string, value: unknown) {
    this.filters.push(predicate(column, 'neq', value))
    return this
  }

  in(column: string, values: unknown[]) {
    this.filters.push(predicate(column, 'in', values))
    return this
  }

  is(column: string, value: unknown) {
    this.filters.push(predicate(column, 'is', value))
    return this
  }

  not(column: string, operator: string, value: unknown) {
    const matches = predicate(column, operator, value)
    this.filters.push((row) => !matches(row))
    return this
  }

  gte(column: string, value: unknown) {
    this.filters.push(predicate(column, 'gte', value))
    return this
  }

  lte(column: string, value: unknown) {
    this.filters.push(predicate(column, 'lte', value))
    return this
  }

  gt(column: string, value: unknown) {
    this.filters.push(predicate(column, 'gt', value))
    return this
  }

  lt(column: string, value: unknown) {
    this.filters.push(predicate(column, 'lt', value))
    return this
  }

  like(column: string, value: unknown) {
    this.filters.push(predicate(column, 'like', value))
    return this
  }

  ilike(column: string, value: unknown) {
    this.filters.push(predicate(column, 'ilike', value))
    return this
  }

  filter(column: string, operator: string, value: unknown) {
    this.filters.push(predicate(column, operator, value))
    return this
  }

  match(columns: Record<string, unknown>) {
    for (const [column, value] of Object.entries(columns)) {
      this.filters.push(predicate(column, 'eq', value))
    }
    return this
  }

  or(expression: string) {
    const terms = expression.split(',').map(parseOrTerm)
    this.filters.push((row) => terms.some((term) => term(row)))
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({ column, ascending: options?.ascending !== false })
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  range(from: number, to: number) {
    this.rangeStart = from
    this.rangeEnd = to
    return this
  }

  single() {
    this.singleMode = 'single'
    return this
  }

  maybeSingle() {
    this.singleMode = 'maybe'
    return this
  }

  insert(payload: unknown) {
    this.mode = 'insert'
    this.payload = payload
    return this
  }

  update(payload: unknown) {
    this.mode = 'update'
    this.payload = payload
    return this
  }

  delete() {
    this.mode = 'delete'
    return this
  }

  upsert(payload: unknown) {
    this.mode = 'upsert'
    this.payload = payload
    return this
  }

  then<TResult1 = PreviewResult, TResult2 = never>(
    onfulfilled?: ((value: PreviewResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected)
  }

  private applyReadOrder(rows: PreviewRow[]): PreviewRow[] {
    let output = [...rows]
    for (const { column, ascending } of this.orders) {
      output = output.sort((left, right) => {
        const result = compareValues(left[column], right[column])
        return ascending ? result : -result
      })
    }
    if (this.rangeStart != null) {
      output = output.slice(this.rangeStart, this.rangeEnd == null ? undefined : this.rangeEnd + 1)
    }
    if (this.limitCount != null) output = output.slice(0, this.limitCount)
    return output
  }

  private insertRows(payload: unknown, rows: PreviewRow[]): PreviewRow[] {
    const incoming = Array.isArray(payload) ? payload : [payload]
    const inserted = incoming.map((item, index) => {
      const row = typeof item === 'object' && item !== null ? { ...(item as PreviewRow) } : {}
      if (!row.id) row.id = `preview-${this.table}-${rows.length + index + 1}`
      if (!row.created_at) row.created_at = new Date().toISOString()
      return row
    })
    rows.push(...inserted)
    return inserted
  }

  private execute(): PreviewResult {
    const rows = fixtures[this.table] ?? (fixtures[this.table] = [])
    const matched = rows.filter((row) => this.filters.every((filter) => filter(row)))

    if (this.mode === 'insert') {
      const inserted = this.insertRows(this.payload, rows)
      return this.result(inserted)
    }

    if (this.mode === 'upsert') {
      const incoming = Array.isArray(this.payload) ? this.payload : [this.payload]
      const upserted: PreviewRow[] = incoming.map((item, index) => {
        const candidate = typeof item === 'object' && item !== null ? { ...(item as PreviewRow) } : {}
        const conflictColumns =
          this.table === 'employee_bank_details'
            ? ['employee_id']
            : candidate.id
              ? ['id']
              : candidate.key
                ? ['key']
                : []
        const existingIndex = conflictColumns.length
          ? rows.findIndex((row) =>
              conflictColumns.every((column) => equalValue(row[column], candidate[column]))
            )
          : -1
        if (existingIndex >= 0) {
          rows[existingIndex] = { ...rows[existingIndex], ...candidate, updated_at: new Date().toISOString() }
          return rows[existingIndex]
        }
        if (!candidate.id) candidate.id = `preview-${this.table}-${rows.length + index + 1}`
        if (!candidate.created_at) candidate.created_at = new Date().toISOString()
        rows.push(candidate)
        return candidate
      })
      return this.result(upserted)
    }

    if (this.mode === 'update') {
      const patch = typeof this.payload === 'object' && this.payload !== null ? (this.payload as PreviewRow) : {}
      for (const row of matched) Object.assign(row, patch, { updated_at: new Date().toISOString() })
      return this.result(matched)
    }

    if (this.mode === 'delete') {
      const matchedIds = new Set(matched.map((row) => row.id))
      fixtures[this.table] = rows.filter((row) => !matchedIds.has(row.id))
      return this.result(matched)
    }

    const ordered = this.applyReadOrder(matched)
    return this.result(ordered)
  }

  private result(rows: PreviewRow[]): PreviewResult {
    if (this.countMode) {
      return { data: this.headMode ? null : rows, error: null, count: rows.length }
    }
    if (!this.wantsRows) return { data: null, error: null }
    if (this.singleMode !== 'none') {
      return { data: rows[0] ?? null, error: null }
    }
    return { data: rows, error: null }
  }
}

class PreviewRpc implements PromiseLike<PreviewResult> {
  private readonly value: unknown
  private singleMode: 'none' | 'single' | 'maybe' = 'none'

  constructor(value: unknown) {
    this.value = value
  }

  single() {
    this.singleMode = 'single'
    return this
  }

  maybeSingle() {
    this.singleMode = 'maybe'
    return this
  }

  then<TResult1 = PreviewResult, TResult2 = never>(
    onfulfilled?: ((value: PreviewResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.result()).then(onfulfilled, onrejected)
  }

  private result(): PreviewResult {
    if (this.singleMode !== 'none') {
      return { data: this.value ?? null, error: null }
    }
    return { data: this.value, error: null }
  }
}

function currentEmployeeRow(): PreviewRow | null {
  return fixtures.employees.find((row) => equalValue(row.auth_id, currentUser.id)) ?? null
}

/** Used by the preview Edge Function shim to act as the signed-in demo user. */
export function getPreviewEmployeeRow(): PreviewRow | null {
  return currentEmployeeRow()
}

function pulseSummary(weeks: number): Array<{ week_start: string; average_score: number; response_count: number }> {
  const grouped = new Map<string, { total: number; count: number }>()
  for (const row of fixtures.pulse_responses) {
    const week = String(row.week_start)
    const score = Number(row.score)
    const entry = grouped.get(week) ?? { total: 0, count: 0 }
    entry.total += score
    entry.count += 1
    grouped.set(week, entry)
  }
  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-weeks)
    .map(([week_start, entry]) => ({
      week_start,
      average_score: entry.count > 0 ? entry.total / entry.count : 0,
      response_count: entry.count,
    }))
}

function createRpc(name: string, args?: Record<string, unknown>): PreviewRpc {
  if (name === 'get_employee_name') {
    const id = args?.p_id
    const employee = fixtures.employees.find((row) => equalValue(row.id, id))
    return new PreviewRpc(employee ? { id: employee.id, first_name: employee.first_name, last_name: employee.last_name } : null)
  }
  if (name === 'get_pulse_summary') {
    const weeks = typeof args?.weeks === 'number' ? args.weeks : 8
    return new PreviewRpc(pulseSummary(weeks))
  }
  if (name === 'get_my_employee_id') {
    return new PreviewRpc(currentEmployeeRow()?.id ?? null)
  }
  if (name === 'get_my_role') {
    return new PreviewRpc(currentEmployeeRow()?.role ?? null)
  }
  return new PreviewRpc(null)
}

const publicPreviewPaths = new Set(['/', '/login', '/forgot-password', '/set-password'])
let signedIn = !publicPreviewPaths.has(window.location.pathname)
let currentUser: User = previewUser
let currentSession: Session = previewSession
const listeners = new Set<PreviewListener>()

function emit(event: AuthChangeEvent, session: Session | null) {
  const recipients = [...listeners]
  setTimeout(() => {
    for (const listener of recipients) {
      if (listeners.has(listener)) listener(event, session)
    }
  }, 0)
}

const auth = {
  async getSession() {
    return { data: { session: signedIn ? currentSession : null }, error: null }
  },

  async getUser() {
    return { data: { user: signedIn ? currentUser : null }, error: null }
  },

  onAuthStateChange(callback: PreviewListener) {
    listeners.add(callback)
    const timer = setTimeout(() => {
      if (!listeners.has(callback) || !signedIn) return
      callback('SIGNED_IN', currentSession)
    }, 0)
    return {
      data: {
        subscription: {
          unsubscribe() {
            clearTimeout(timer)
            listeners.delete(callback)
          },
        },
      },
    }
  },

  async signInWithPassword({ email }: { email: string; password: string }) {
    currentUser = previewUserForEmail(email)
    currentSession = previewSessionForUser(currentUser)
    signedIn = true
    emit('SIGNED_IN', currentSession)
    return { data: { user: currentUser, session: currentSession }, error: null }
  },

  async signOut() {
    signedIn = false
    emit('SIGNED_OUT', null)
    return { error: null }
  },

  async setSession() {
    signedIn = true
    currentUser = previewUser
    currentSession = previewSession
    return { data: { session: currentSession, user: currentUser }, error: null }
  },

  async refreshSession() {
    return {
      data: { session: signedIn ? currentSession : null, user: signedIn ? currentUser : null },
      error: null,
    }
  },

  async updateUser() {
    return { data: { user: signedIn ? currentUser : null }, error: null }
  },

  async resetPasswordForEmail() {
    return { data: {}, error: null }
  },

  async exchangeCodeForSession() {
    signedIn = true
    currentUser = previewUser
    currentSession = previewSession
    return { data: { session: currentSession, user: currentUser }, error: null }
  },
}

const client = {
  from(table: string) {
    return new PreviewQuery(table)
  },
  rpc(name: string, args?: Record<string, unknown>) {
    return createRpc(name, args)
  },
  auth,
}

export const supabase = client as unknown as SupabaseClient<Database>
