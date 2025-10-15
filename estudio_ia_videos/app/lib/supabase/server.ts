import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from './config'
import type { Database } from './types'

export function createServerClientInstance(): SupabaseClient<Database> {
  const { url, anonKey } = getSupabaseConfig()
  const cookieStore = cookies()

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // Server Components cannot mutate cookies directly; middleware refresh handles it.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch {
          // Server Components cannot mutate cookies directly; middleware refresh handles it.
        }
      },
    },
  })
}
