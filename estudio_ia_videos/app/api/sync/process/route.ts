/**
 * 🎭 Lip-Sync Processing API
 * 
 * API para processamento avançado de sincronização labial
 * com análise MFCC e detecção de fonemas
 */

import { NextRequest, NextResponse } from 'next/server'
import { lipSyncProcessor, LipSyncResult } from '@/lib/sync/lip-sync-processor'
import { Logger } from '@/lib/logger'
import { supabase } from '@/lib/supabase'

const logger = new Logger('LipSyncAPI')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extrair parâmetros
    const audioFile = formData.get('audio') as File
    const includeEmotions = formData.get('include_emotions') === 'true'
    const includeBreathing = formData.get('include_breathing') === 'true'
    const accuracyMode = (formData.get('accuracy_mode') as string) || 'balanced'
    const projectId = formData.get('project_id') as string
    const avatarId = formData.get('avatar_id') as string

    // Validar parâmetros obrigatórios
    if (!audioFile || !projectId) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters',
          required: ['audio', 'project_id']
        },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only audio files are supported.' },
        { status: 400 }
      )
    }

    // Validar tamanho do arquivo (máx 50MB)
    if (audioFile.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    // Extrair user_id do header de autenticação
    const authHeader = request.headers.get('authorization')
    let userId: string | undefined

    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await supabase.auth.getUser(token)
        userId = user?.id
      } catch (error) {
        logger.warn('Failed to extract user from token', { error })
      }
    }

    logger.info('Lip-sync processing request received', {
      fileName: audioFile.name,
      fileSize: audioFile.size,
      fileType: audioFile.type,
      projectId,
      avatarId,
      userId,
      options: {
        includeEmotions,
        includeBreathing,
        accuracyMode
      }
    })

    // Converter arquivo para ArrayBuffer
    const audioBuffer = await audioFile.arrayBuffer()

    // Processar sincronização labial
    const result = await lipSyncProcessor.processAudioForLipSync(audioBuffer, {
      includeEmotions,
      includeBreathing,
      accuracyMode: accuracyMode as 'fast' | 'balanced' | 'high'
    })

    // Salvar informações adicionais no banco
    await supabase.from('sync_jobs').update({
      project_id: projectId,
      avatar_id: avatarId,
      user_id: userId,
      file_name: audioFile.name,
      file_size: audioFile.size,
      file_type: audioFile.type,
      options: {
        includeEmotions,
        includeBreathing,
        accuracyMode
      }
    }).eq('job_id', result.metadata.job_id)

    // Resposta de sucesso
    return NextResponse.json({
      success: true,
      data: {
        job_id: result.metadata.job_id,
        visemes: result.visemes,
        phonemes: result.phonemes,
        blend_shapes: result.blendShapes,
        emotions: result.emotions,
        breathing: result.breathing,
        metadata: {
          audio_duration: result.metadata.audio_duration,
          processing_time: result.metadata.processing_time,
          accuracy_score: result.metadata.accuracy_score,
          confidence_avg: result.metadata.confidence_avg,
          visemes_count: result.visemes.length,
          phonemes_count: result.phonemes.length
        }
      }
    })

  } catch (error) {
    logger.error('Lip-sync processing failed', { error: error.message })
    
    return NextResponse.json(
      { 
        error: 'Lip-sync processing failed',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const jobId = searchParams.get('job_id')

    switch (action) {
      case 'status':
        if (!jobId) {
          return NextResponse.json(
            { error: 'Missing job_id parameter' },
            { status: 400 }
          )
        }

        // Buscar status do job
        const { data: job, error } = await supabase
          .from('sync_jobs')
          .select('*')
          .eq('job_id', jobId)
          .single()

        if (error || !job) {
          return NextResponse.json(
            { error: 'Job not found' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          data: {
            job_id: job.job_id,
            status: job.status,
            progress: job.progress || 100,
            created_at: job.created_at,
            completed_at: job.completed_at,
            metadata: {
              audio_duration: job.audio_duration,
              processing_time: job.processing_time,
              accuracy_score: job.accuracy_score,
              confidence_avg: job.confidence_avg,
              visemes_count: job.visemes_count,
              phonemes_count: job.phonemes_count
            }
          }
        })

      case 'result':
        if (!jobId) {
          return NextResponse.json(
            { error: 'Missing job_id parameter' },
            { status: 400 }
          )
        }

        // Buscar resultado completo do job
        const { data: resultJob, error: resultError } = await supabase
          .from('sync_jobs')
          .select('*')
          .eq('job_id', jobId)
          .eq('status', 'completed')
          .single()

        if (resultError || !resultJob) {
          return NextResponse.json(
            { error: 'Job not found or not completed' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          data: {
            job_id: resultJob.job_id,
            visemes: resultJob.visemes_data,
            phonemes: resultJob.phonemes_data,
            blend_shapes: resultJob.blend_shapes_data,
            emotions: resultJob.emotions_data,
            breathing: resultJob.breathing_data,
            metadata: {
              audio_duration: resultJob.audio_duration,
              processing_time: resultJob.processing_time,
              accuracy_score: resultJob.accuracy_score,
              confidence_avg: resultJob.confidence_avg
            }
          }
        })

      case 'history':
        const userId = searchParams.get('user_id')
        const projectId = searchParams.get('project_id')
        const limit = parseInt(searchParams.get('limit') || '10')

        let query = supabase
          .from('sync_jobs')
          .select('job_id, status, created_at, accuracy_score, audio_duration, file_name')
          .order('created_at', { ascending: false })
          .limit(limit)

        if (userId) {
          query = query.eq('user_id', userId)
        }

        if (projectId) {
          query = query.eq('project_id', projectId)
        }

        const { data: history, error: historyError } = await query

        if (historyError) {
          throw historyError
        }

        return NextResponse.json({
          success: true,
          data: { history }
        })

      case 'stats':
        // Estatísticas gerais de processamento
        const { data: stats, error: statsError } = await supabase
          .from('sync_jobs')
          .select('accuracy_score, processing_time, audio_duration, status')
          .eq('status', 'completed')

        if (statsError) {
          throw statsError
        }

        const totalJobs = stats.length
        const avgAccuracy = stats.reduce((sum, job) => sum + (job.accuracy_score || 0), 0) / totalJobs
        const avgProcessingTime = stats.reduce((sum, job) => sum + (job.processing_time || 0), 0) / totalJobs
        const totalAudioDuration = stats.reduce((sum, job) => sum + (job.audio_duration || 0), 0)

        return NextResponse.json({
          success: true,
          data: {
            total_jobs: totalJobs,
            avg_accuracy: Math.round(avgAccuracy * 100) / 100,
            avg_processing_time: Math.round(avgProcessingTime),
            total_audio_duration: Math.round(totalAudioDuration * 100) / 100,
            processing_efficiency: totalAudioDuration > 0 ? 
              Math.round((totalAudioDuration / (avgProcessingTime / 1000)) * 100) / 100 : 0
          }
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available: status, result, history, stats' },
          { status: 400 }
        )
    }

  } catch (error) {
    logger.error('Lip-sync API GET failed', { error: error.message })
    
    return NextResponse.json(
      { 
        error: 'Request failed',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('job_id')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing job_id parameter' },
        { status: 400 }
      )
    }

    // Marcar job como cancelado
    const { error } = await supabase
      .from('sync_jobs')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('job_id', jobId)

    if (error) {
      throw error
    }

    logger.info('Lip-sync job cancelled', { jobId })

    return NextResponse.json({
      success: true,
      message: 'Job cancelled successfully'
    })

  } catch (error) {
    logger.error('Lip-sync job cancellation failed', { error: error.message })
    
    return NextResponse.json(
      { 
        error: 'Cancellation failed',
        message: error.message 
      },
      { status: 500 }
    )
  }
}