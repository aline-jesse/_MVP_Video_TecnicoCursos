type SupabaseConfig = {
  url: string
  anonKey: string
}

let cachedConfig: SupabaseConfig | null = null

export function getSupabaseConfig(): SupabaseConfig {
  if (cachedConfig) {
    return cachedConfig
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables')
  }

  cachedConfig = { url, anonKey }
  return cachedConfig
}
