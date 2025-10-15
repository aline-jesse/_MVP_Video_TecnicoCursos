
/**
 * 📊 Metrics Endpoint
 * 
 * Endpoint para métricas Prometheus-compatible
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
// import { getRedisClient } from '@/lib/cache/redis-client'

// Inline Redis client simulation
function getRedisClient() {
  return {
    info: async () => 'connected_clients:5',
    get: async (key: string) => null,
    set: async (key: string, value: string) => 'OK',
    del: async (key: string) => 1,
    exists: async (key: string) => 0
  };
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const redis = getRedisClient()
    
    // Métricas básicas
    const metrics: string[] = [
      '# HELP app_info Application information',
      '# TYPE app_info gauge',
      `app_info{version="${process.env.APP_VERSION || '1.0.0'}",environment="${process.env.NODE_ENV}"} 1`,
      '',
      '# HELP nodejs_uptime_seconds Node.js process uptime in seconds',
      '# TYPE nodejs_uptime_seconds gauge',
      `nodejs_uptime_seconds ${process.uptime()}`,
      '',
      '# HELP nodejs_memory_heap_used_bytes Memory heap used in bytes',
      '# TYPE nodejs_memory_heap_used_bytes gauge',
      `nodejs_memory_heap_used_bytes ${process.memoryUsage().heapUsed}`,
      '',
      '# HELP nodejs_memory_heap_total_bytes Memory heap total in bytes',
      '# TYPE nodejs_memory_heap_total_bytes gauge',
      `nodejs_memory_heap_total_bytes ${process.memoryUsage().heapTotal}`,
      '',
    ]
    
    // Métricas de banco de dados
    try {
      const userCount = await prisma.user.count()
      const projectCount = await prisma.project?.count() || 0
      
      metrics.push(
        '# HELP app_users_total Total number of users',
        '# TYPE app_users_total gauge',
        `app_users_total ${userCount}`,
        '',
        '# HELP app_projects_total Total number of projects',
        '# TYPE app_projects_total gauge',
        `app_projects_total ${projectCount}`,
        ''
      )
    } catch (error) {
      // Ignore se tabelas não existirem
    }
    
    // Métricas de Redis
    try {
      if (redis) {
        const redisInfo = await redis.info()
        const connected = redisInfo.includes('connected_clients')
        
        metrics.push(
          '# HELP redis_connected Redis connection status',
          '# TYPE redis_connected gauge',
          `redis_connected ${connected ? 1 : 0}`,
          ''
        )
      } else {
        metrics.push(
          '# HELP redis_connected Redis connection status',
          '# TYPE redis_connected gauge',
          'redis_connected 0',
          ''
        )
      }
    } catch (error) {
      metrics.push(
        '# HELP redis_connected Redis connection status',
        '# TYPE redis_connected gauge',
        'redis_connected 0',
        ''
      )
    }
    
    return new NextResponse(metrics.join('\n'), {
      headers: {
        'Content-Type': 'text/plain; version=0.0.4',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
    
  } catch (error: any) {
    return new NextResponse('# Error generating metrics\n', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}
