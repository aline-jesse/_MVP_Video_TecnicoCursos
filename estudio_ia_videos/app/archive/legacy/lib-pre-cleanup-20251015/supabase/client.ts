/**
 * Supabase Client Configuration
 * FASE 2: Avatares 3D Hiper-Realistas
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { Database } from './types'

// Configurações do Supabase
const requireEnv = (value: string | undefined, key: string) => {
  if (!value) {
    throw new Error(`[Supabase] Missing environment variable: ${key}`)
  }
  return value
}

const supabaseUrl = requireEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL')
const supabaseAnonKey = requireEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')
const isServerEnvironment = typeof window === 'undefined'

type SupabaseGlobals = {
  supabaseClient?: SupabaseClient<Database>
  supabaseAdmin?: SupabaseClient<Database>
}

const globalSupabase = globalThis as typeof globalThis & SupabaseGlobals

const getSupabaseClient = () => {
  if (globalSupabase.supabaseClient) {
    return globalSupabase.supabaseClient
  }

  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  })

  globalSupabase.supabaseClient = client
  return client
}

// Cliente publico (frontend)
export const supabase = getSupabaseClient()

// Cliente administrativo (backend/server-side)
const createAdminClient = (): SupabaseClient<Database> => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('[Supabase] Missing environment variable: SUPABASE_SERVICE_ROLE_KEY')
  }

  if (globalSupabase.supabaseAdmin) {
    return globalSupabase.supabaseAdmin
  }

  const client = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  globalSupabase.supabaseAdmin = client
  return client
}

const supabaseAdminStub = new Proxy({} as SupabaseClient<Database>, {
  get: () => {
    throw new Error('[Supabase] Administrative client is only available on the server')
  }
})

export const supabaseAdmin = isServerEnvironment ? createAdminClient() : supabaseAdminStub

// Tipos para as tabelas
export type AvatarModel = Database['public']['Tables']['avatar_models']['Row']
export type AvatarModelInsert = Database['public']['Tables']['avatar_models']['Insert']
export type AvatarModelUpdate = Database['public']['Tables']['avatar_models']['Update']

export type VoiceProfile = Database['public']['Tables']['voice_profiles']['Row']
export type VoiceProfileInsert = Database['public']['Tables']['voice_profiles']['Insert']
export type VoiceProfileUpdate = Database['public']['Tables']['voice_profiles']['Update']

export type RenderJob = Database['public']['Tables']['render_jobs']['Row']
export type RenderJobInsert = Database['public']['Tables']['render_jobs']['Insert']
export type RenderJobUpdate = Database['public']['Tables']['render_jobs']['Update']

export type Audio2FaceSession = Database['public']['Tables']['audio2face_sessions']['Row']
export type Audio2FaceSessionInsert = Database['public']['Tables']['audio2face_sessions']['Insert']
export type Audio2FaceSessionUpdate = Database['public']['Tables']['audio2face_sessions']['Update']

export type AvatarAnalytics = Database['public']['Tables']['avatar_analytics']['Row']
export type AvatarAnalyticsInsert = Database['public']['Tables']['avatar_analytics']['Insert']

export type SystemStats = Database['public']['Tables']['system_stats']['Row']
export type SystemStatsInsert = Database['public']['Tables']['system_stats']['Insert']
export type SystemStatsUpdate = Database['public']['Tables']['system_stats']['Update']

// Enums
export type RenderStatus = Database['public']['Enums']['render_status']
export type RenderQuality = Database['public']['Enums']['render_quality']
export type VideoResolution = Database['public']['Enums']['video_resolution']
export type AvatarType = Database['public']['Enums']['avatar_type']
export type AvatarGender = Database['public']['Enums']['avatar_gender']
export type SupportedLanguage = Database['public']['Enums']['supported_language']

// Funções auxiliares
export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const isAuthenticated = async () => {
  const user = await getUser()
  return !!user
}

export const isAdmin = async () => {
  const user = await getUser()
  return user?.user_metadata?.role === 'admin'
}

// Realtime subscriptions
export const subscribeToRenderJobs = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('render_jobs_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'render_jobs',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToSystemStats = (callback: (payload: any) => void) => {
  return supabase
    .channel('system_stats_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'system_stats'
      },
      callback
    )
    .subscribe()
}

// Funções de conveniência para queries comuns
export const avatarQueries = {
  // Buscar todos os modelos ativos
  getActiveModels: async () => {
    const { data, error } = await supabase
      .from('avatar_models')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Buscar modelo por ID
  getModelById: async (id: string) => {
    const { data, error } = await supabase
      .from('avatar_models')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Buscar modelos por tipo
  getModelsByType: async (type: AvatarType) => {
    const { data, error } = await supabase
      .from('avatar_models')
      .select('*')
      .eq('avatar_type', type)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

export const voiceQueries = {
  // Buscar todos os perfis ativos
  getActiveProfiles: async () => {
    const { data, error } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Buscar perfis por idioma
  getProfilesByLanguage: async (language: SupportedLanguage) => {
    const { data, error } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('language', language)
      .eq('is_active', true)
      .order('quality_score', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Buscar perfis por gênero
  getProfilesByGender: async (gender: AvatarGender) => {
    const { data, error } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('gender', gender)
      .eq('is_active', true)
      .order('quality_score', { ascending: false })
    
    if (error) throw error
    return data
  }
}

export const renderQueries = {
  // Buscar jobs do usuário
  getUserJobs: async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('render_jobs')
      .select(`
        *,
        avatar_models(*),
        voice_profiles(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Buscar job por ID
  getJobById: async (id: string) => {
    const { data, error } = await supabase
      .from('render_jobs')
      .select(`
        *,
        avatar_models(*),
        voice_profiles(*),
        audio2face_sessions(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Buscar jobs por status
  getJobsByStatus: async (status: RenderStatus, userId?: string) => {
    let query = supabase
      .from('render_jobs')
      .select(`
        *,
        avatar_models(*),
        voice_profiles(*)
      `)
      .eq('status', status)
    
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Criar novo job
  createJob: async (job: RenderJobInsert) => {
    const { data, error } = await supabase
      .from('render_jobs')
      .insert(job)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Atualizar job
  updateJob: async (id: string, updates: RenderJobUpdate) => {
    const { data, error } = await supabase
      .from('render_jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export const analyticsQueries = {
  // Registrar evento de analytics
  trackEvent: async (event: AvatarAnalyticsInsert) => {
    const { error } = await supabase
      .from('avatar_analytics')
      .insert(event)
    
    if (error) throw error
  },

  // Buscar estatísticas do usuário
  getUserStats: async (userId: string) => {
    const { data, error } = await supabase
      .rpc('get_user_render_stats', { user_id: userId })
    
    if (error) throw error
    return data
  }
}

export const systemQueries = {
  // Buscar estatísticas mais recentes
  getLatestStats: async () => {
    const { data, error } = await supabase
      .from('system_stats')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error) throw error
    return data
  },

  // Atualizar estatísticas
  updateStats: async (stats: SystemStatsUpdate) => {
    const { data, error } = await supabaseAdmin
      .from('system_stats')
      .insert(stats)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}


