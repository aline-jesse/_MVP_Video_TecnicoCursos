/**
 * 🎬 Render Authentication Middleware
 * Handles authentication for video render endpoints with test mode support
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from './auth-config'

export interface RenderAuthContext {
  user: {
    id: string
    email: string
    name?: string
    role?: string
  } | null
  isTestMode: boolean
  isAuthenticated: boolean
}

export async function getRenderAuthContext(request: NextRequest): Promise<RenderAuthContext> {
  try {
    // Check for test mode
    const url = new URL(request.url)
    const isTestMode = url.searchParams.get('test') === 'true' || 
                      url.searchParams.get('action') === 'test' ||
                      url.searchParams.get('force') === 'true'

    // In test mode, create a mock user
    if (isTestMode) {
      return {
        user: {
          id: 'test-user-123',
          email: 'test@estudio.ai',
          name: 'Test User',
          role: 'user'
        },
        isTestMode: true,
        isAuthenticated: true
      }
    }

    // Try to get real session
    const session = await getServerSession(authConfig)
    
    if (session?.user?.email) {
      return {
        user: {
          id: (session.user as any).id || `user-${Date.now()}`,
          email: session.user.email,
          name: session.user.name || undefined,
          role: 'user'
        },
        isTestMode: false,
        isAuthenticated: true
      }
    }

    // No authentication
    return {
      user: null,
      isTestMode: false,
      isAuthenticated: false
    }

  } catch (error) {
    console.error('Error getting render auth context:', error)
    return {
      user: null,
      isTestMode: false,
      isAuthenticated: false
    }
  }
}

export function createRenderAuthError(message = 'Authentication required') {
  return NextResponse.json(
    { 
      error: message,
      hint: 'Add ?test=true for testing or provide valid authentication'
    },
    { status: 401 }
  )
}

export function createRenderValidationError(message = 'Invalid request') {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  )
}

export async function withRenderAuth(
  request: NextRequest,
  handler: (request: NextRequest, context: RenderAuthContext) => Promise<NextResponse> | NextResponse,
  options: { requireAuth?: boolean } = {}
) {
  try {
    const context = await getRenderAuthContext(request)
    
    // If authentication is required and user is not authenticated
    if (options.requireAuth && !context.isAuthenticated) {
      return createRenderAuthError()
    }

    return handler(request, context)
    
  } catch (error) {
    console.error('Render auth middleware error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}