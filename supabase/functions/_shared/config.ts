import { getServiceClient } from './supabase.ts'

/**
 * Read a single app_config value. Falls back to `fallback` when the row or
 * table is unavailable so a missing setting never blocks a core action.
 */
export async function getAppConfigValue(key: string, fallback: string): Promise<string> {
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', key)
      .maybeSingle()

    if (error || !data?.value) return fallback
    return data.value
  } catch {
    return fallback
  }
}
