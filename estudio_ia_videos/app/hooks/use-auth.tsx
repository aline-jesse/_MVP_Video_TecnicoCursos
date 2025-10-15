/**
 * 🪝 Hook useAuth
 * Hook React para gestão de autenticação
 * 
 * Features:
 * - Estado de autenticação reativo
 * - Funções de login/logout
 * - Loading e error states
 * - Auto-refresh de sessão
 * - Sincronização com Supabase Auth
 */

'use client'

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
  createBrowserClient,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  resetPassword as authResetPassword,
  updatePassword as authUpdatePassword,
  getCurrentUser,
  getUserProfile,
  ensureUserProfile,
  signInWithGoogle as authSignInWithGoogle,
  signInWithGithub as authSignInWithGithub,
  UserProfile
} from '@/lib/supabase/auth'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  refreshProfile: () => Promise<void>
  isAdmin: boolean
  isPro: boolean
  isEnterprise: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  // Carregar sessão inicial
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          const userProfile = await getUserProfile(currentSession.user.id)
          if (userProfile) {
            setProfile(userProfile)
          } else {
            // Criar perfil se não existir
            const newProfile = await ensureUserProfile(
              currentSession.user.id,
              currentSession.user.email!
            )
            setProfile(newProfile)
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Listener de mudanças de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event)
        
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          const userProfile = await getUserProfile(currentSession.user.id)
          if (userProfile) {
            setProfile(userProfile)
          } else {
            const newProfile = await ensureUserProfile(
              currentSession.user.id,
              currentSession.user.email!
            )
            setProfile(newProfile)
          }
        } else {
          setProfile(null)
        }

        // Redirecionar baseado no evento
        if (event === 'SIGNED_IN') {
          toast.success('Login realizado com sucesso!')
          router.push('/dashboard')
        } else if (event === 'SIGNED_OUT') {
          toast.success('Logout realizado com sucesso!')
          router.push('/login')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await authSignIn(email, password)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await authSignUp(email, password, fullName)
      toast.success('Conta criada! Verifique seu email.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar conta'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      await authSignOut()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer logout'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      await authSignInWithGoogle()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login com Google'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithGithub = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      await authSignInWithGithub()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login com GitHub'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await authResetPassword(email)
      toast.success('Email de recuperação enviado!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao solicitar reset'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePassword = useCallback(async (newPassword: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await authUpdatePassword(newPassword)
      toast.success('Senha atualizada com sucesso!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar senha'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    
    try {
      const userProfile = await getUserProfile(user.id)
      if (userProfile) {
        setProfile(userProfile)
      }
    } catch (err) {
      console.error('Error refreshing profile:', err)
    }
  }, [user])

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGithub,
    resetPassword,
    updatePassword,
    refreshProfile,
    isAdmin: profile?.role === 'admin',
    isPro: profile?.subscription_tier === 'pro',
    isEnterprise: profile?.subscription_tier === 'enterprise',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
