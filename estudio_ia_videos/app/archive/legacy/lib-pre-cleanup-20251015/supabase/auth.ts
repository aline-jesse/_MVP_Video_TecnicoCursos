/**
 * 🔐 Sistema de Autenticação Supabase
 * Implementação completa de autenticação com Supabase Auth
 * 
 * Features:
 * - Login/Logout
 * - Registro de usuários
 * - Reset de senha
 * - Verificação de email
 * - Gestão de sessões
 * - Refresh automático de tokens
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

export type UserProfile = {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'user' | 'admin' | 'enterprise'
  credits: number
  subscription_tier: 'free' | 'pro' | 'enterprise'
  created_at: string
  updated_at: string
}

/**
 * Cliente Supabase para componentes do lado do cliente
 */
export const createBrowserClient = () => {
  return createClientComponentClient<Database>()
}

/**
 * Cliente Supabase para componentes do lado do servidor
 * Nota: Removido para compatibilidade com Client Components
 */

/**
 * Realizar login com email e senha
 */
export async function signIn(email: string, password: string) {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * Realizar registro de novo usuário
 */
export async function signUp(email: string, password: string, fullName?: string) {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * Realizar logout
 */
export async function signOut() {
  const supabase = createBrowserClient()
  
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Solicitar reset de senha
 */
export async function resetPassword(email: string) {
  const supabase = createBrowserClient()
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Atualizar senha
 */
export async function updatePassword(newPassword: string) {
  const supabase = createBrowserClient()
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Obter sessão atual
 */
export async function getSession() {
  const supabase = createBrowserClient()
  
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  return session
}

/**
 * Obter usuário atual
 */
export async function getCurrentUser() {
  const supabase = createBrowserClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  return user
}

/**
 * Obter perfil completo do usuário
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data as UserProfile
}

/**
 * Atualizar perfil do usuário
 */
export async function updateUserProfile(
  userId: string, 
  updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
) {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as UserProfile
}

/**
 * Verificar se usuário está autenticado (server-side)
 */
export async function isAuthenticated() {
  const supabase = createServerClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  return !!session
}

/**
 * Verificar se usuário é admin (server-side)
 */
export async function isAdmin() {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  const profile = await getUserProfile(user.id)
  
  return profile?.role === 'admin'
}

/**
 * Login com Google OAuth
 */
export async function signInWithGoogle() {
  const supabase = createBrowserClient()
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Login com GitHub OAuth
 */
export async function signInWithGithub() {
  const supabase = createBrowserClient()
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Verificar e criar perfil do usuário se não existir
 */
export async function ensureUserProfile(userId: string, email: string) {
  const supabase = createBrowserClient()
  
  // Verificar se perfil existe
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (existingProfile) {
    return existingProfile as UserProfile
  }

  // Criar novo perfil
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      email,
      role: 'user',
      credits: 100, // Créditos iniciais gratuitos
      subscription_tier: 'free',
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as UserProfile
}
