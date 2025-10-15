
/**
 * 💾 API para gerenciamento de backups
 */

import { NextRequest, NextResponse } from 'next/server'
import { backupSystem } from '@/lib/production/backup-system'
import { productionLogger as logger } from '@/lib/production/logger'
import { rateLimiters } from '@/lib/production/rate-limiter'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await rateLimiters.api(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  
  try {
    const stats = backupSystem.getStats()
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      backup: stats
    })
    
  } catch (error: any) {
    logger.error('Backup stats error', { error: error.message })
    
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting mais restritivo para backups
  const rateLimitResponse = await rateLimiters.strict(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  
  try {
    const body = await request.json()
    const { type = 'full' } = body
    
    if (!['database', 'files', 'config', 'logs', 'full'].includes(type)) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid backup type'
      }, { status: 400 })
    }
    
    logger.info('Starting manual backup', { type })
    
    // Executar backup manual
    const results = await backupSystem.manualBackup(type)
    
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    
    return NextResponse.json({
      status: failed.length === 0 ? 'success' : 'partial_success',
      timestamp: new Date().toISOString(),
      results: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        backups: results.map(r => ({
          backupId: r.backupId,
          success: r.success,
          size: r.size,
          duration: r.duration,
          location: r.location,
          error: r.error
        }))
      }
    })
    
  } catch (error: any) {
    logger.error('Manual backup failed', { error: error.message })
    
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 })
  }
}
