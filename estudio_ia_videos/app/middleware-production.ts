
/**
 * 🛡️ Production-Ready Middleware
 * 
 * Middleware completo com todas as proteções de produção
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSecurityHeaders, getCorsHeaders } from '@/lib/security/security-headers'
import { applyRateLimit } from '@/lib/security/rate-limiter'
import { log } from '@/lib/monitoring/logger'

// Padrões de ataque
const ATTACK_PATTERNS = [
  /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
  /(<script|<iframe|<object|<embed)/i,
  /(javascript:|vbscript:)/i,
  /(\.\.\/|\.\.\\)/i,
  /(%00|%0d%0a)/i, // Null bytes e line breaks
]

// Endpoints públicos (sem rate limit estrito)
const PUBLIC_PATHS = [
  '/api/health',
  '/api/metrics',
  '/api/docs',
  '/_next',
  '/favicon.ico',
  '/manifest.json',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const startTime = Date.now()
  
  try {
    // 1. CORS preflight
    if (request.method === 'OPTIONS') {
      const origin = request.headers.get('origin')
      const corsHeaders = getCorsHeaders(origin)
      
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      })
    }
    
    // 2. Security headers
    const isDev = process.env.NODE_ENV === 'development'
    const securityHeaders = getSecurityHeaders(isDev)
    
    // 3. Attack pattern detection
    const url = decodeURIComponent(request.url).toLowerCase()
    const hasAttackPattern = ATTACK_PATTERNS.some(pattern => pattern.test(url))
    
    if (hasAttackPattern) {
      log.security('Potential attack detected', {
        url: request.url,
        ip: request.ip,
        userAgent: request.headers.get('user-agent'),
      })
      
      return new NextResponse('Access denied', {
        status: 403,
        headers: securityHeaders,
      })
    }
    
    // 4. Rate limiting (exceto endpoints públicos)
    const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path))
    
    if (!isPublicPath && pathname.startsWith('/api/')) {
      const identifier = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
      const rateLimitResult = await applyRateLimit(identifier)
      
      if (!rateLimitResult.success) {
        log.security('Rate limit exceeded', {
          pathname,
          ip: request.ip,
        })
        
        return new NextResponse('Too many requests', {
          status: 429,
          headers: {
            ...securityHeaders,
            ...rateLimitResult.headers,
          },
        })
      }
      
      // Adicionar rate limit headers à response
      const response = NextResponse.next()
      
      Object.entries({
        ...securityHeaders,
        ...rateLimitResult.headers,
      }).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      
      // Log API request
      const duration = Date.now() - startTime
      log.apiRequest(request.method, pathname, duration, response.status)
      
      // Add timing header
      response.headers.set('X-Response-Time', `${duration}ms`)
      
      return response
    }
    
    // 5. Continue normalmente para rotas não-API
    const response = NextResponse.next()
    
    // Adicionar security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    // CORS headers
    const origin = request.headers.get('origin')
    if (origin) {
      const corsHeaders = getCorsHeaders(origin)
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
    }
    
    return response
    
  } catch (error: any) {
    log.error('Middleware error', error, {
      pathname,
      method: request.method,
    })
    
    // Em caso de erro, permitir (fail open) mas adicionar headers básicos
    const response = NextResponse.next()
    response.headers.set('X-Middleware-Error', 'true')
    
    const securityHeaders = getSecurityHeaders(true)
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|icon-|manifest.json).*)',
  ],
}
