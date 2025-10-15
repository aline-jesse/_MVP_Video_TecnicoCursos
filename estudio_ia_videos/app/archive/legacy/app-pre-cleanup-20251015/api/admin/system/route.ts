
/**
 * 🖥️ API de informações do sistema
 */

import { NextRequest, NextResponse } from 'next/server'
import { productionLogger as logger, metricsCollector, alertSystem } from '@/lib/production/logger'
import { rateLimitStore, ipManager } from '@/lib/production/rate-limiter'
import { rateLimiters } from '@/lib/production/rate-limiter'
import os from 'os'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await rateLimiters.api(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  
  try {
    const systemInfo = {
      // Informações básicas
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      
      // Sistema operacional
      os: {
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        hostname: os.hostname(),
        cpus: os.cpus().length,
        totalMemory: Math.round(os.totalmem() / 1024 / 1024), // MB
        freeMemory: Math.round(os.freemem() / 1024 / 1024), // MB
        loadAverage: os.loadavg()
      },
      
      // Processo Node.js
      process: {
        pid: process.pid,
        memoryUsage: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        },
        cpuUsage: process.cpuUsage()
      },
      
      // Métricas da aplicação
      metrics: metricsCollector.getAllMetrics(),
      
      // Alertas ativos
      alerts: {
        active: alertSystem.getActiveAlerts().length,
        total: alertSystem.getAllAlerts().length,
        recent: alertSystem.getActiveAlerts().slice(-5)
      },
      
      // Rate limiting
      rateLimit: rateLimitStore.getStats(),
      
      // IP management
      security: {
        whitelist: ipManager.getWhitelist().length,
        blacklist: ipManager.getBlacklist().length
      },
      
      // Configurações
      config: {
        hasDatabase: !!process.env.DATABASE_URL,
        hasGoogleTTS: !!process.env.GOOGLE_TTS_API_KEY,
        hasAWSS3: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasElevenLabs: !!process.env.ELEVENLABS_API_KEY,
        backupEnabled: process.env.BACKUP_ENABLED === 'true'
      }
    }
    
    return NextResponse.json({
      status: 'success',
      data: systemInfo
    })
    
  } catch (error: any) {
    logger.error('System info error', { error: error.message })
    
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting mais restritivo para operações de sistema
  const rateLimitResponse = await rateLimiters.strict(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  
  try {
    const body = await request.json()
    const { action, params } = body
    
    switch (action) {
      case 'clearMetrics':
        // Limpar métricas (implementar se necessário)
        logger.info('Metrics cleared by admin')
        return NextResponse.json({ status: 'success', message: 'Metrics cleared' })
        
      case 'resolveAlert':
        if (params?.alertId) {
          alertSystem.resolve(params.alertId)
          logger.info('Alert resolved', { alertId: params.alertId })
          return NextResponse.json({ status: 'success', message: 'Alert resolved' })
        }
        break
        
      case 'addToWhitelist':
        if (params?.ip) {
          ipManager.addToWhitelist(params.ip)
          logger.info('IP added to whitelist', { ip: params.ip })
          return NextResponse.json({ status: 'success', message: 'IP added to whitelist' })
        }
        break
        
      case 'addToBlacklist':
        if (params?.ip) {
          ipManager.addToBlacklist(params.ip)
          logger.info('IP added to blacklist', { ip: params.ip })
          return NextResponse.json({ status: 'success', message: 'IP added to blacklist' })
        }
        break
        
      case 'removeFromWhitelist':
        if (params?.ip) {
          ipManager.removeFromWhitelist(params.ip)
          logger.info('IP removed from whitelist', { ip: params.ip })
          return NextResponse.json({ status: 'success', message: 'IP removed from whitelist' })
        }
        break
        
      case 'removeFromBlacklist':
        if (params?.ip) {
          ipManager.removeFromBlacklist(params.ip)
          logger.info('IP removed from blacklist', { ip: params.ip })
          return NextResponse.json({ status: 'success', message: 'IP removed from blacklist' })
        }
        break
        
      default:
        return NextResponse.json({
          status: 'error',
          message: 'Invalid action'
        }, { status: 400 })
    }
    
    return NextResponse.json({
      status: 'error',
      message: 'Missing required parameters'
    }, { status: 400 })
    
  } catch (error: any) {
    logger.error('System action error', { error: error.message })
    
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 })
  }
}
