/**
 * 🔄 ROUTE REDIRECTS MIDDLEWARE - PRODUCTION READY
 * Middleware para redirecionamento de rotas e correção de URLs
 */

import { NextRequest, NextResponse } from 'next/server'

// 📍 ROUTE MAPPINGS
export const ROUTE_REDIRECTS = {
  // Fix /app/api/* to /api/*
  '/app/api/render/start': '/api/render/start',
  '/app/api/render/video-working': '/api/render/video-working',
  '/app/api/render/simple-test': '/api/render/simple-test',
  '/app/api/render/test-simple': '/api/render/test-simple',
  '/app/api/render/pipeline-test': '/api/render/pipeline-test',
  '/app/api/render/video-test': '/api/render/video-test',
  '/app/api/render/status': '/api/render/status',
  '/app/api/health': '/api/health',
  '/app/api/video': '/api/video',
  '/app/api/video-pipeline': '/api/video-pipeline',
  
  // Legacy API redirects
  '/api/render/video-working': '/api/render/status',
  '/api/render/simple-test': '/api/render/test-simple',
  
  // Health check aliases
  '/health': '/api/health',
  '/status': '/api/health',
  '/ping': '/api/health',
} as const

// 🎯 ROUTE PATTERNS
export const ROUTE_PATTERNS = [
  {
    pattern: /^\/app\/api\/(.+)$/,
    replacement: '/api/$1',
    description: 'Remove /app prefix from API routes'
  },
  {
    pattern: /^\/api\/render\/video-working(.*)$/,
    replacement: '/api/render/status$1',
    description: 'Redirect video-working to status endpoint'
  },
  {
    pattern: /^\/api\/render\/simple-test(.*)$/,
    replacement: '/api/render/test-simple$1',
    description: 'Redirect simple-test to test-simple'
  }
]

// 🔧 ROUTE REDIRECT HANDLER
export class RouteRedirectHandler {
  private static instance: RouteRedirectHandler
  private redirectCounts = new Map<string, number>()

  static getInstance(): RouteRedirectHandler {
    if (!RouteRedirectHandler.instance) {
      RouteRedirectHandler.instance = new RouteRedirectHandler()
    }
    return RouteRedirectHandler.instance
  }

  // 📊 LOG REDIRECT
  private logRedirect(from: string, to: string, method: string): void {
    const redirectKey = `${from} -> ${to}`
    this.redirectCounts.set(redirectKey, (this.redirectCounts.get(redirectKey) || 0) + 1)
    
    console.log(`🔄 Route Redirect: ${method} ${from} -> ${to}`)
  }

  // 🎯 CHECK FOR REDIRECT
  checkRedirect(request: NextRequest): NextResponse | null {
    const pathname = request.nextUrl.pathname
    const method = request.method

    // Check exact matches first
    if (pathname in ROUTE_REDIRECTS) {
      const newPath = ROUTE_REDIRECTS[pathname as keyof typeof ROUTE_REDIRECTS]
      this.logRedirect(pathname, newPath, method)
      
      const url = request.nextUrl.clone()
      url.pathname = newPath
      
      return NextResponse.redirect(url, 301)
    }

    // Check pattern matches
    for (const { pattern, replacement, description } of ROUTE_PATTERNS) {
      if (pattern.test(pathname)) {
        const newPath = pathname.replace(pattern, replacement)
        this.logRedirect(pathname, newPath, method)
        
        const url = request.nextUrl.clone()
        url.pathname = newPath
        
        return NextResponse.redirect(url, 301)
      }
    }

    return null
  }

  // 📈 GET REDIRECT STATS
  getRedirectStats(): Record<string, number> {
    const stats: Record<string, number> = {}
    this.redirectCounts.forEach((count, key) => {
      stats[key] = count
    })
    return stats
  }

  // 🔍 SUGGEST SIMILAR ROUTES
  suggestSimilarRoutes(pathname: string): string[] {
    const suggestions: string[] = []
    
    // Check for similar routes
    const availableRoutes = [
      '/api/health',
      '/api/render/start',
      '/api/render/status',
      '/api/render/test-simple',
      '/api/render/video-test',
      '/api/render/pipeline-test',
      '/api/video',
      '/api/video-pipeline',
    ]

    // Simple similarity check
    for (const route of availableRoutes) {
      if (route.includes(pathname.split('/').pop() || '')) {
        suggestions.push(route)
      }
    }

    return suggestions.slice(0, 3) // Return top 3 suggestions
  }
}

// 🚀 MIDDLEWARE FUNCTION
export function routeRedirectMiddleware(request: NextRequest): NextResponse | null {
  const handler = RouteRedirectHandler.getInstance()
  return handler.checkRedirect(request)
}

// 📊 STATS ENDPOINT HELPER
export function createRedirectStatsResponse(): NextResponse {
  const handler = RouteRedirectHandler.getInstance()
  const stats = handler.getRedirectStats()
  
  return NextResponse.json({
    success: true,
    redirectStats: stats,
    totalRedirects: Object.values(stats).reduce((sum, count) => sum + count, 0),
    timestamp: new Date().toISOString(),
  })
}

// 🔍 NOT FOUND HELPER
export function createNotFoundResponse(request: NextRequest): NextResponse {
  const handler = RouteRedirectHandler.getInstance()
  const suggestions = handler.suggestSimilarRoutes(request.nextUrl.pathname)
  
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `Route not found: ${request.method} ${request.nextUrl.pathname}`,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        availableRoutes: [
          'GET /api/health - Health check',
          'POST /api/render/start - Start render job',
          'GET /api/render/status - Check render status',
          'GET /api/render/test-simple - Simple test endpoint',
        ],
        timestamp: new Date().toISOString(),
      },
    },
    { status: 404 }
  )
}

export default RouteRedirectHandler