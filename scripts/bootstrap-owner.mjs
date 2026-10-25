#!/usr/bin/env node
/**
 * Create the first Attendora owner.
 *
 * Usage:
 *   cp .env.example .env.local
 *   # fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   # BOOTSTRAP_OWNER_EMAIL, BOOTSTRAP_OWNER_PASSWORD
 *   npm run bootstrap:owner
 *
 * Safe to re-run: the auth user is updated and the employees row is upserted.
 */
import { requireEnv, serviceClient, ensureAuthUser, toISODate } from './_demo-shared.mjs'

const email = requireEnv('BOOTSTRAP_OWNER_EMAIL').trim().toLowerCase()
const password = requireEnv('BOOTSTRAP_OWNER_PASSWORD')
const firstName = process.env.BOOTSTRAP_OWNER_FIRST_NAME?.trim() || 'Owner'
const lastName = process.env.BOOTSTRAP_OWNER_LAST_NAME?.trim() || 'Account'

if (password.length < 12) {
  console.error('BOOTSTRAP_OWNER_PASSWORD must be at least 12 characters.')
  process.exit(1)
}

const supabase = serviceClient()

const user = await ensureAuthUser(supabase, {
  email,
  password,
  firstName,
  lastName,
})

const { error } = await supabase.from('employees').upsert(
  {
    auth_id: user.id,
    employee_code: process.env.BOOTSTRAP_OWNER_CODE || `OWN-${new Date().getFullYear()}-0001`,
    first_name: firstName,
    last_name: lastName,
    email,
    role: 'owner',
    employment_type: 'full_time',
    employment_status: 'active',
    join_date: toISODate(new Date()),
    is_first_login: false,
    is_active: true,
  },
  { onConflict: 'email' }
)

if (error) {
  console.error('Could not create the owner employee row:', error.message)
  process.exit(1)
}

console.log(`Owner ready: ${email}`)
console.log('Sign in at /login with the password from BOOTSTRAP_OWNER_PASSWORD.')
