import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseServerInstance: SupabaseClient | null = null

export function getSupabaseServer(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
    return null
  }

  if (!supabaseServerInstance) {
    supabaseServerInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return supabaseServerInstance
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseServer() !== null
}
