export const APP_NAME = Deno.env.get('APP_NAME') ?? 'Attendora'
export const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'
export const SUPPORT_EMAIL = Deno.env.get('SUPPORT_EMAIL') ?? 'support@example.com'
export const EMAIL_FROM =
  Deno.env.get('EMAIL_FROM') ?? `${APP_NAME} <noreply@example.com>`
