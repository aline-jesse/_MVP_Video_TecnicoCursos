/**
 * 🚀 API Route: Processamento Avançado de PPTX com Batch e Narração
 * POST /api/v1/pptx/process-advanced
 * 
 * Funcionalidades:
 * - Upload múltiplo de arquivos
 * - Processamento paralelo
 * - Narração automática opcional
 * - Análise de qualidade
 * - Conversão de animações
 * - Persistência em banco de dados (Prisma)
 */

import { NextRequest, NextResponse } from 'next/server'
import { BatchPPTXProcessor } from '@/lib/pptx/batch-processor'
import { LayoutAnalyzer } from '@/lib/pptx/layout-analyzer'
import { AnimationConverter } from '@/lib/pptx/animation-converter'
import { PPTXBatchDBService } from '@/lib/pptx/batch-db-service'
import { auth } from '@/lib/auth'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutos

export async function POST(request: NextRequest) {
  try {
    console.log('📦 Recebendo requisição de processamento avançado de PPTX...')

    // 1. Autenticação
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const organizationId = (session.user as any).currentOrgId || undefined

    // 2. Parse do FormData
    const formData = await request.formData()
    const files: File[] = []
    
    // Coletar todos os arquivos
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value)
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      )
    }

    console.log(`📁 ${files.length} arquivo(s) recebido(s)`)

    // 3. Opções de processamento
    const generateNarration = formData.get('generateNarration') === 'true'
    const analyzeQuality = formData.get('analyzeQuality') === 'true'
    const convertAnimations = formData.get('convertAnimations') === 'true'
    const maxConcurrent = parseInt(formData.get('maxConcurrent') as string) || 3
    const batchName = formData.get('batchName') as string || `Batch ${new Date().toLocaleString()}`

    const narrationProvider = (formData.get('narrationProvider') as string) || 'azure'
    const narrationVoice = (formData.get('narrationVoice') as string) || 'pt-BR-FranciscaNeural'

    const processingOptions = {
      maxConcurrent,
      maxRetries: 2,
      uploadToS3: true,
      generateNarration,
      narrationOptions: generateNarration ? {
        provider: narrationProvider as any,
        voice: narrationVoice,
        speed: 1.0,
        preferNotes: true
      } : undefined,
      autoSave: true
    }

    console.log(`⚙️ Opções:`, {
      generateNarration,
      analyzeQuality,
      convertAnimations,
      maxConcurrent,
      narrationProvider,
      narrationVoice,
      batchName
    })

    // 4. Criar Batch Job no banco de dados
    console.log('💾 Criando batch job no banco de dados...')
    const batchJob = await PPTXBatchDBService.createBatchJob({
      userId,
      organizationId,
      batchName,
      totalFiles: files.length,
      options: processingOptions
    })

    console.log(`✅ Batch job criado: ${batchJob.id}`)

    // 5. Criar jobs individuais para cada arquivo
    const processingJobs = await Promise.all(
      files.map(file => 
        PPTXBatchDBService.createProcessingJob({
          batchJobId: batchJob.id,
          userId,
          organizationId,
          filename: file.name,
          originalSize: file.size
        })
      )
    )

    console.log(`✅ ${processingJobs.length} jobs individuais criados`)

    // 6. Atualizar batch job para status "processing"
    await PPTXBatchDBService.updateBatchJob(batchJob.id, {
      status: 'processing'
    })

    // 7. Processar arquivos em lote com callbacks do DB
    const batchProcessor = new BatchPPTXProcessor()
    
    let jobIndex = 0
    const batchResult = await batchProcessor.processBatch(
      files,
      userId,
      processingOptions,
      async (job, current, total) => {
        const dbJob = processingJobs[jobIndex]
        
        // Atualizar job individual no DB
        await PPTXBatchDBService.updateProcessingJob(dbJob.id, {
          status: job.status === 'completed' ? 'completed' : 
                  job.status === 'failed' ? 'failed' : 'processing',
          progress: job.progress,
          phase: job.status === 'processing' ? 'extraction' : 
                 job.status === 'completed' ? 'complete' : 'upload',
          errorMessage: job.errorMessage
        })

        // Atualizar batch job
        const completedCount = current
        const failedCount = batchResult?.jobs?.filter((j: any) => j.status === 'failed').length || 0
        
        await PPTXBatchDBService.updateBatchJob(batchJob.id, {
          completed: completedCount,
          failed: failedCount,
          processing: total - completedCount - failedCount,
          progress: Math.round((current / total) * 100)
        })

        jobIndex++
        
        console.log(`📊 DB atualizado: ${current}/${total} - ${job.filename} (${job.progress}%)`)
      }
    )

    console.log(`✅ Processamento em lote concluído:`, {
      completed: batchResult.completed,
      failed: batchResult.failed,
      totalSlides: batchResult.totalSlides
    })

    // 8. Atualizar jobs individuais com resultados finais
    for (let i = 0; i < batchResult.jobs.length; i++) {
      const job = batchResult.jobs[i]
      const dbJob = processingJobs[i]

      if (job.status === 'completed' && job.result) {
        await PPTXBatchDBService.completeProcessingJob(dbJob.id, job.result)
      } else if (job.status === 'failed') {
        await PPTXBatchDBService.recordJobError(
          dbJob.id,
          (job as any).error?.message || 'Erro desconhecido',
          (job as any).error?.stack
        )
      }
    }

    // 9. Finalizar batch job
    const finalStatus = batchResult.failed === 0 ? 'completed' :
                       batchResult.completed === 0 ? 'failed' : 'partial'

    await PPTXBatchDBService.updateBatchJob(batchJob.id, {
      status: finalStatus,
      completed: batchResult.completed,
      failed: batchResult.failed,
      totalSlides: batchResult.totalSlides,
      totalDuration: batchResult.totalDuration,
      processingTime: batchResult.processingTime
    })

    console.log(`💾 Batch job finalizado no DB com status: ${finalStatus}`)

    // 10. Análise de qualidade (se solicitado)
    let qualityAnalysis = null
    if (analyzeQuality && batchResult.completed > 0) {
      console.log('🔍 Iniciando análise de qualidade...')
      const analyzer = new LayoutAnalyzer()
      
      // Analisar slides dos projetos completos
      const qualityResults = []
      for (const job of batchResult.jobs) {
        if (job.status === 'completed' && job.result && (job.result as any)?.slidesData) {
          for (const slide of (job.result as any).slidesData) {
            const analysis = analyzer.analyzeSlide(slide)
            qualityResults.push({
              projectId: job.result.projectId,
              slideNumber: slide.slideNumber,
              score: analysis.score,
              issues: analysis.issues
            })
          }
        }
      }

      qualityAnalysis = {
        totalAnalyzed: qualityResults.length,
        averageScore: qualityResults.reduce((sum, r) => sum + r.score, 0) / qualityResults.length,
        results: qualityResults
      }

      console.log(`✅ Análise de qualidade concluída: ${qualityResults.length} slides`)
    }

    // 11. Conversão de animações (se solicitado)
    let animationsConverted = null
    if (convertAnimations && batchResult.completed > 0) {
      console.log('🎬 Iniciando conversão de animações...')
      
      const converter = new AnimationConverter()
      const animationResults = []

      for (const job of batchResult.jobs) {
        if (job.status === 'completed' && job.result && (job.result as any)?.pptxUrl) {
          // TODO: Converter animações do PPTX
          // Por enquanto, placeholder
          animationResults.push({
            projectId: job.result.projectId,
            filename: job.filename,
            message: 'Conversão de animações aguarda implementação completa'
          })
        }
      }

      animationsConverted = {
        totalConverted: animationResults.length,
        results: animationResults
      }

      console.log(`✅ Conversão de animações processada`)
    }

    // 12. Obter estatísticas finais do banco
    const finalStats = await PPTXBatchDBService.getBatchStatistics(batchJob.id)

    // 13. Resposta final
    return NextResponse.json({
      success: true,
      batchJobId: batchJob.id,
      batch: {
        id: batchJob.id,
        name: batchName,
        status: finalStatus,
        totalFiles: batchResult.totalJobs,
        completed: batchResult.completed,
        failed: batchResult.failed,
        totalSlides: batchResult.totalSlides,
        totalDuration: batchResult.totalDuration,
        processingTime: batchResult.processingTime
      },
      jobs: batchResult.jobs.map((job, index) => ({
        id: processingJobs[index].id,
        filename: job.filename,
        fileSize: job.fileSize,
        status: job.status,
        progress: job.progress,
        phase: job.phase,
        error: job.error,
        result: job.result ? {
          projectId: job.result.projectId,
          slideCount: job.result.slideCount,
          duration: job.result.duration,
          thumbnailUrl: job.result.thumbnailUrl,
          narrationGenerated: job.result.narrationGenerated
        } : null
      })),
      statistics: finalStats.statistics,
      qualityAnalysis,
      animationsConverted,
      errors: batchResult.errors
    })

  } catch (error) {
    console.error('❌ Erro no processamento avançado de PPTX:', error)
    
    return NextResponse.json(
      {
        error: 'Erro ao processar arquivos PPTX',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

/**
 * GET: Status de processamento em lote
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const batchJobId = searchParams.get('batchJobId')
    const jobId = searchParams.get('jobId')

    if (batchJobId) {
      // Status de batch job específico
      const batchJob = await PPTXBatchDBService.getBatchJobWithJobs(batchJobId)
      
      if (!batchJob) {
        return NextResponse.json(
          { error: 'Batch job não encontrado' },
          { status: 404 }
        )
      }

      // Obter progresso em tempo real
      const progress = await PPTXBatchDBService.getBatchProgress(batchJobId)

      return NextResponse.json({
        batchJob: {
          id: batchJob.id,
          name: batchJob.batchName,
          status: batchJob.status,
          progress: batchJob.progress,
          totalFiles: batchJob.totalFiles,
          completed: batchJob.completed,
          failed: batchJob.failed,
          processing: batchJob.processing,
          createdAt: batchJob.createdAt,
          startedAt: batchJob.startedAt,
          completedAt: batchJob.completedAt
        },
        jobs: progress.jobs,
        summary: progress.summary
      })
    } else if (jobId) {
      // Status de job individual
      const job = await PPTXBatchDBService.getProcessingJob(jobId)
      
      if (!job) {
        return NextResponse.json(
          { error: 'Job não encontrado' },
          { status: 404 }
        )
      }

      return NextResponse.json({ job })
    } else {
      // Listar todos os batch jobs do usuário
      const { jobs, total } = await PPTXBatchDBService.listUserBatchJobs(
        session.user.id,
        {
          limit: 50,
          offset: 0
        }
      )

      return NextResponse.json({
        totalJobs: total,
        jobs: jobs.map((job: any) => ({
          id: job.id,
          batchName: job.batchName,
          status: job.status,
          progress: job.progress,
          totalFiles: job.totalFiles,
          completed: job.completed,
          failed: job.failed,
          createdAt: job.createdAt
        }))
      })
    }

  } catch (error) {
    console.error('❌ Erro ao obter status:', error)
    
    return NextResponse.json(
      { error: 'Erro ao obter status de processamento' },
      { status: 500 }
    )
  }
}

/**
 * DELETE: Cancelar batch job em processamento
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const batchJobId = searchParams.get('batchJobId')
    const jobId = searchParams.get('jobId')

    if (batchJobId) {
      // Cancelar batch job inteiro
      const cancelled = await PPTXBatchDBService.cancelBatchJob(batchJobId)

      return NextResponse.json({
        success: true,
        message: `Batch job ${batchJobId} e todos os jobs associados foram cancelados`,
        batchJob: {
          id: cancelled.id,
          status: cancelled.status,
          completed: cancelled.completed,
          failed: cancelled.failed
        }
      })
    } else if (jobId) {
      // Cancelar job individual
      const job = await PPTXBatchDBService.updateProcessingJob(jobId, {
        status: 'cancelled'
      })

      return NextResponse.json({
        success: true,
        message: `Job ${jobId} cancelado`,
        job: {
          id: job.id,
          filename: job.filename,
          status: job.status
        }
      })
    } else {
      return NextResponse.json(
        { error: 'batchJobId ou jobId não fornecido' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('❌ Erro ao cancelar job:', error)
    
    return NextResponse.json(
      { error: 'Erro ao cancelar job' },
      { status: 500 }
    )
  }
}
