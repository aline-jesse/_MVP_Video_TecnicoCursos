
/**
 * 📋 Queue Management API
 * Gerenciamento da fila de processamento
 */

import { NextRequest, NextResponse } from 'next/server'
import { QueueService } from '@/lib/queue-service'

export const dynamic = 'force-dynamic'

// Obter status da fila
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    const jobId = url.searchParams.get('jobId')
    
    if (action === 'status' && jobId) {
      // Status de job específico
      const job = QueueService.getJobStatus(jobId)
      
      if (!job) {
        return NextResponse.json({
          success: false,
          error: 'Job não encontrado'
        }, { status: 404 })
      }
      
      return NextResponse.json({
        success: true,
        job: {
          id: job.id,
          type: job.type,
          status: job.status,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          attempts: job.attempts,
          error: job.error,
          result: job.result,
          priority: job.priority
        }
      })
    }
    
    // Status geral da fila
    const stats = QueueService.getQueueStats()
    const allJobs = QueueService.getAllJobs()
    
    // Filtrar jobs recentes (últimas 24h)
    const recentJobs = allJobs.filter(job => 
      Date.now() - job.createdAt.getTime() < 24 * 60 * 60 * 1000
    ).slice(0, 50) // Limitar a 50 jobs mais recentes
    
    console.log('📋 Status da fila consultado')
    
    return NextResponse.json({
      success: true,
      stats,
      recentJobs: recentJobs.map(job => ({
        id: job.id,
        type: job.type,
        status: job.status,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        attempts: job.attempts,
        priority: job.priority,
        error: job.error,
        // Incluir apenas metadados básicos do resultado
        hasResult: !!job.result
      }))
    })
    
  } catch (error) {
    console.error('❌ Erro ao consultar fila:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get queue status'
    }, { status: 500 })
  }
}

// Adicionar job à fila
export async function POST(request: NextRequest) {
  try {
    const {
      type,
      data,
      priority = 0
    } = await request.json()
    
    if (!type || !data) {
      return NextResponse.json({
        success: false,
        error: 'Type and data are required'
      }, { status: 400 })
    }
    
    const validTypes = ['talking-photo', 'voice-clone', 'batch-process']
    if (!validTypes.includes(type)) {
      return NextResponse.json({
        success: false,
        error: `Invalid job type. Valid types: ${validTypes.join(', ')}`
      }, { status: 400 })
    }
    
    const jobId = await QueueService.addJob(type, data, priority)
    
    console.log(`📋 Job adicionado via API: ${jobId} (${type})`)
    
    return NextResponse.json({
      success: true,
      jobId,
      message: 'Job added to queue successfully'
    })
    
  } catch (error) {
    console.error('❌ Erro ao adicionar job:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to add job to queue'
    }, { status: 500 })
  }
}

// Gerenciar jobs (cancelar, limpar, etc.)
export async function DELETE(request: NextRequest) {
  try {
    const {
      action,
      jobId
    } = await request.json()
    
    if (action === 'cancel' && jobId) {
      // Cancelar job específico
      const success = QueueService.cancelJob(jobId)
      
      if (!success) {
        return NextResponse.json({
          success: false,
          error: 'Cannot cancel job (may be processing or not found)'
        }, { status: 400 })
      }
      
      console.log(`❌ Job cancelado via API: ${jobId}`)
      
      return NextResponse.json({
        success: true,
        message: 'Job cancelled successfully'
      })
    }
    
    if (action === 'cleanup') {
      // Limpar jobs concluídos
      QueueService.clearCompletedJobs()
      
      console.log('🧹 Jobs concluídos limpos via API')
      
      return NextResponse.json({
        success: true,
        message: 'Completed jobs cleared successfully'
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Erro no gerenciamento da fila:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to manage queue'
    }, { status: 500 })
  }
}

// Pausar/retomar processamento da fila
export async function PATCH(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'pause') {
      // TODO: Implementar pause da fila
      console.log('⏸️ Fila pausada via API')
      
      return NextResponse.json({
        success: true,
        message: 'Queue paused (not implemented yet)'
      })
    }
    
    if (action === 'resume') {
      // TODO: Implementar resume da fila
      console.log('▶️ Fila retomada via API')
      
      return NextResponse.json({
        success: true,
        message: 'Queue resumed (not implemented yet)'
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Erro ao controlar fila:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to control queue'
    }, { status: 500 })
  }
}
