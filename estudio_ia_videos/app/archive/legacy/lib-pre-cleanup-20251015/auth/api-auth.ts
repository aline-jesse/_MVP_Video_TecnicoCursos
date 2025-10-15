
import { getServerSession } from 'next-auth'
import { authConfig } from './auth-config'
import { NextRequest } from 'next/server'

export interface AuthenticatedSession {
  user: {
    id: string
    email: string
    name?: string
    image?: string
  }
}

export async function getAuthenticatedSession(request?: NextRequest): Promise<AuthenticatedSession | null> {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return null
    }

    // For demo purposes, ensure user has an ID
    const userId = (session.user as any).id || `user-${Date.now()}`
    
    return {
      user: {
        id: userId,
        email: session.user.email,
        name: session.user.name || undefined,
        image: session.user.image || undefined
      }
    }
  } catch (error) {
    console.error('Error getting authenticated session:', error)
    return null
  }
}

export function createAuthError() {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  )
}

export function createServerError(message = 'Internal server error') {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  )
}

export function createValidationError(message = 'Validation error') {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 400, headers: { 'Content-Type': 'application/json' } }
  )
}
