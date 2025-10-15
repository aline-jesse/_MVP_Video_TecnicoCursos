
/**
 * 🛡️ API Route Rate Limiting Helper
 * 
 * Wrapper para aplicar rate limiting em API routes
 * 
 * Uso:
 * ```typescript
 * export const POST = withRateLimit(async (request) => {
 *   // Your handler here
 * }, 'tts')
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit } from '@/lib/security/rate-limiter'
import { log } from '@/lib/monitoring/logger'

type APIHandler = (request: NextRequest, context?: any) => Promise<NextResponse> | NextResponse

type RateLimitAction = 'default' | 'voice-create' | 'compliance-check' | 'certificate-mint' | 'tts' | 'render' | 'upload' | 'auth'

/**
 * Wrapper para aplicar rate limiting em API routes
 */
export function withRateLimit(
  handler: APIHandler,
  action: RateLimitAction = 'default'
): APIHandler {
  return async (request: NextRequest, context?: any) => {
    try {
      // Apply rate limiting
      const identifier = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      const { success, headers: rateLimitHeaders } = await applyRateLimit(identifier, action)
      
      if (!success) {
        log.security('Rate limit exceeded', {
          path: request.nextUrl.pathname,
          action,
          ip: request.ip || request.headers.get('x-forwarded-for'),
        })
        
        return NextResponse.json(
          {
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
          },
          {
            status: 429,
            headers: rateLimitHeaders,
          }
        )
      }
      
      // Call original handler
      const response = await handler(request, context)
      
      // Add rate limit headers to response
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      return response
      
    } catch (error: any) {
      log.error('Rate limit middleware error', error, {
        path: request.nextUrl.pathname,
      })
      
      // Fail open - allow request but log error
      return handler(request, context)
    }
  }
}

/**
 * Wrapper específico para rotas de TTS
 */
export function withTTSRateLimit(handler: APIHandler): APIHandler {
  return withRateLimit(handler, 'tts')
}

/**
 * Wrapper específico para rotas de render
 */
export function withRenderRateLimit(handler: APIHandler): APIHandler {
  return withRateLimit(handler, 'render')
}

/**
 * Wrapper específico para rotas de upload
 */
export function withUploadRateLimit(handler: APIHandler): APIHandler {
  return withRateLimit(handler, 'upload')
}

/**
 * Wrapper específico para rotas de autenticação
 */
export function withAuthRateLimit(handler: APIHandler): APIHandler {
  return withRateLimit(handler, 'auth')
}
