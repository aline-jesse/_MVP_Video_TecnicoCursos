/**
 * Audio2Face Service
 * FASE 2: Avatares 3D Hiper-Realistas
 * 
 * Serviço para integração com NVIDIA Audio2Face OSS
 * Responsável por gerar curvas ARKit e blend shapes para lip-sync
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

// Configurações do Audio2Face
const AUDIO2FACE_API_URL = process.env.AUDIO2FACE_API_URL || 'http://localhost:8012'
const AUDIO2FACE_GRPC_URL = process.env.AUDIO2FACE_GRPC_URL || 'http://localhost:8011'
const AUDIO2FACE_MODEL_NAME = process.env.AUDIO2FACE_MODEL_NAME || 'default_model'
const AUDIO2FACE_SAMPLE_RATE = parseInt(process.env.AUDIO2FACE_SAMPLE_RATE || '22050')

// Tipos específicos do Audio2Face
export interface Audio2FaceSession {
  id: string
  sessionId: string
  modelName: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  audioFilePath: string
  blendShapesData?: BlendShapesData
  arkitCurvesUrl?: string
  accuracyScore?: number
  processingTime?: number
  errorMessage?: string
}

export interface BlendShapesData {
  frameRate: number
  totalFrames: number
  blendShapes: {
    [shapeName: string]: number[]
  }
  metadata: {
    audioLength: number
    processingTime: number
    accuracy: number
  }
}

export interface Audio2FaceConfig {
  modelName: string
  sampleRate: number
  enableRealTime: boolean
  qualityPreset: 'draft' | 'standard' | 'high' | 'ultra'
  outputFormat: 'arkit' | 'blendshapes' | 'both'
}

export interface RenderJobProgress {
  jobId: string
  progress: number
  stage: string
  estimatedTimeRemaining?: number
  currentFrame?: number
  totalFrames?: number
}

class Audio2FaceService {
  private supabase: ReturnType<typeof createClient<Database>>

  constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /**
   * Verifica se o Audio2Face está disponível
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${AUDIO2FACE_API_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 segundos timeout
      })

      return response.ok
    } catch (error) {
      console.error('Audio2Face health check failed:', error)
      return false
    }
  }

  /**
   * Cria uma nova sessão Audio2Face
   */
  async createSession(renderJobId: string, config: Audio2FaceConfig): Promise<Audio2FaceSession> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Criar registro na base de dados
      const { data: sessionData, error } = await this.supabase
        .from('audio2face_sessions')
        .insert({
          render_job_id: renderJobId,
          session_id: sessionId,
          model_name: config.modelName,
          sample_rate: config.sampleRate,
          audio_file_path: '', // Será atualizado quando o áudio for processado
          status: 'pending',
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create Audio2Face session: ${error.message}`)
      }

      return {
        id: sessionData.id,
        sessionId: sessionData.session_id,
        modelName: sessionData.model_name,
        status: sessionData.status as any,
        audioFilePath: sessionData.audio_file_path,
      }
    } catch (error) {
      console.error('Error creating Audio2Face session:', error)
      throw error
    }
  }

  /**
   * Processa áudio para gerar blend shapes
   */
  async processAudio(
    sessionId: string,
    audioBuffer: Buffer,
    config: Audio2FaceConfig
  ): Promise<BlendShapesData> {
    try {
      // Atualizar status para processing
      await this.updateSessionStatus(sessionId, 'processing')

      const formData = new FormData()
      formData.append('audio', new Blob([audioBuffer], { type: 'audio/wav' }), 'audio.wav')
      formData.append('model_name', config.modelName)
      formData.append('sample_rate', config.sampleRate.toString())
      formData.append('quality_preset', config.qualityPreset)
      formData.append('output_format', config.outputFormat)

      const startTime = Date.now()

      const response = await fetch(`${AUDIO2FACE_API_URL}/api/v1/process`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(300000), // 5 minutos timeout
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Audio2Face processing failed: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      const processingTime = (Date.now() - startTime) / 1000

      // Validar resultado
      if (!result.blend_shapes || !result.metadata) {
        throw new Error('Invalid Audio2Face response: missing blend_shapes or metadata')
      }

      const blendShapesData: BlendShapesData = {
        frameRate: result.frame_rate || 30,
        totalFrames: result.total_frames || 0,
        blendShapes: result.blend_shapes,
        metadata: {
          audioLength: result.metadata.audio_length || 0,
          processingTime,
          accuracy: result.metadata.accuracy || 0,
        },
      }

      // Atualizar sessão com resultados
      await this.supabase
        .from('audio2face_sessions')
        .update({
          blend_shapes_data: blendShapesData,
          processing_time_seconds: processingTime,
          accuracy_score: blendShapesData.metadata.accuracy,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId)

      return blendShapesData
    } catch (error) {
      console.error('Error processing audio with Audio2Face:', error)
      
      // Atualizar status para failed
      await this.updateSessionStatus(sessionId, 'failed', error.message)
      throw error
    }
  }

  /**
   * Gera curvas ARKit a partir de blend shapes
   */
  async generateARKitCurves(
    sessionId: string,
    blendShapesData: BlendShapesData
  ): Promise<string> {
    try {
      const response = await fetch(`${AUDIO2FACE_API_URL}/api/v1/export/arkit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          blend_shapes: blendShapesData.blendShapes,
          frame_rate: blendShapesData.frameRate,
          total_frames: blendShapesData.totalFrames,
        }),
        signal: AbortSignal.timeout(60000), // 1 minuto timeout
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`ARKit export failed: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      const arkitCurvesUrl = result.download_url

      // Atualizar sessão com URL das curvas ARKit
      await this.supabase
        .from('audio2face_sessions')
        .update({
          arkit_curves_url: arkitCurvesUrl,
        })
        .eq('session_id', sessionId)

      return arkitCurvesUrl
    } catch (error) {
      console.error('Error generating ARKit curves:', error)
      throw error
    }
  }

  /**
   * Obtém o progresso de um job de renderização
   */
  async getRenderProgress(sessionId: string): Promise<RenderJobProgress | null> {
    try {
      const response = await fetch(`${AUDIO2FACE_API_URL}/api/v1/progress/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 segundos timeout
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null // Sessão não encontrada
        }
        throw new Error(`Failed to get render progress: ${response.status}`)
      }

      const progress = await response.json()
      
      return {
        jobId: sessionId,
        progress: progress.progress || 0,
        stage: progress.stage || 'unknown',
        estimatedTimeRemaining: progress.estimated_time_remaining,
        currentFrame: progress.current_frame,
        totalFrames: progress.total_frames,
      }
    } catch (error) {
      console.error('Error getting render progress:', error)
      return null
    }
  }

  /**
   * Cancela uma sessão de processamento
   */
  async cancelSession(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${AUDIO2FACE_API_URL}/api/v1/cancel/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 segundos timeout
      })

      if (response.ok) {
        // Atualizar status na base de dados
        await this.updateSessionStatus(sessionId, 'cancelled')
        return true
      }

      return false
    } catch (error) {
      console.error('Error cancelling Audio2Face session:', error)
      return false
    }
  }

  /**
   * Obtém informações de uma sessão
   */
  async getSession(sessionId: string): Promise<Audio2FaceSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('audio2face_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single()

      if (error || !data) {
        return null
      }

      return {
        id: data.id,
        sessionId: data.session_id,
        modelName: data.model_name,
        status: data.status as any,
        audioFilePath: data.audio_file_path,
        blendShapesData: data.blend_shapes_data as BlendShapesData,
        arkitCurvesUrl: data.arkit_curves_url || undefined,
        accuracyScore: data.accuracy_score || undefined,
        processingTime: data.processing_time_seconds || undefined,
        errorMessage: data.error_message || undefined,
      }
    } catch (error) {
      console.error('Error getting Audio2Face session:', error)
      return null
    }
  }

  /**
   * Lista modelos disponíveis no Audio2Face
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${AUDIO2FACE_API_URL}/api/v1/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 segundos timeout
      })

      if (!response.ok) {
        throw new Error(`Failed to get available models: ${response.status}`)
      }

      const result = await response.json()
      return result.models || [AUDIO2FACE_MODEL_NAME]
    } catch (error) {
      console.error('Error getting available models:', error)
      return [AUDIO2FACE_MODEL_NAME] // Fallback para modelo padrão
    }
  }

  /**
   * Valida a precisão do lip-sync
   */
  async validateLipSyncAccuracy(
    sessionId: string,
    targetAccuracy: number = 0.95
  ): Promise<{ isValid: boolean; accuracy: number; message: string }> {
    try {
      const session = await this.getSession(sessionId)
      
      if (!session || !session.blendShapesData) {
        return {
          isValid: false,
          accuracy: 0,
          message: 'Session or blend shapes data not found',
        }
      }

      const accuracy = session.blendShapesData.metadata.accuracy
      const isValid = accuracy >= targetAccuracy

      return {
        isValid,
        accuracy,
        message: isValid 
          ? `Lip-sync accuracy ${(accuracy * 100).toFixed(1)}% meets target ${(targetAccuracy * 100).toFixed(1)}%`
          : `Lip-sync accuracy ${(accuracy * 100).toFixed(1)}% below target ${(targetAccuracy * 100).toFixed(1)}%`,
      }
    } catch (error) {
      console.error('Error validating lip-sync accuracy:', error)
      return {
        isValid: false,
        accuracy: 0,
        message: `Validation error: ${error.message}`,
      }
    }
  }

  /**
   * Atualiza o status de uma sessão
   */
  private async updateSessionStatus(
    sessionId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled',
    errorMessage?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (status === 'processing') {
        updateData.started_at = new Date().toISOString()
      } else if (status === 'completed' || status === 'failed' || status === 'cancelled') {
        updateData.completed_at = new Date().toISOString()
      }

      if (errorMessage) {
        updateData.error_message = errorMessage
      }

      await this.supabase
        .from('audio2face_sessions')
        .update(updateData)
        .eq('session_id', sessionId)
    } catch (error) {
      console.error('Error updating session status:', error)
    }
  }

  /**
   * Limpa sessões antigas (mais de 24 horas)
   */
  async cleanupOldSessions(): Promise<number> {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      const { data, error } = await this.supabase
        .from('audio2face_sessions')
        .delete()
        .lt('created_at', oneDayAgo)
        .select('id')

      if (error) {
        throw error
      }

      return data?.length || 0
    } catch (error) {
      console.error('Error cleaning up old sessions:', error)
      return 0
    }
  }
}

// Instância singleton do serviço
export const audio2FaceService = new Audio2FaceService()

// Configurações padrão
export const defaultAudio2FaceConfig: Audio2FaceConfig = {
  modelName: AUDIO2FACE_MODEL_NAME,
  sampleRate: AUDIO2FACE_SAMPLE_RATE,
  enableRealTime: false,
  qualityPreset: 'standard',
  outputFormat: 'both',
}

// Utilitários
export const Audio2FaceUtils = {
  /**
   * Converte blend shapes para formato ARKit
   */
  convertToARKit(blendShapes: BlendShapesData): any {
    // Implementação da conversão para ARKit
    return {
      version: '1.0',
      frameRate: blendShapes.frameRate,
      totalFrames: blendShapes.totalFrames,
      curves: blendShapes.blendShapes,
      metadata: blendShapes.metadata,
    }
  },

  /**
   * Valida dados de blend shapes
   */
  validateBlendShapes(data: any): boolean {
    return (
      data &&
      typeof data.frameRate === 'number' &&
      typeof data.totalFrames === 'number' &&
      data.blendShapes &&
      typeof data.blendShapes === 'object' &&
      data.metadata &&
      typeof data.metadata.accuracy === 'number'
    )
  },

  /**
   * Calcula estatísticas de qualidade
   */
  calculateQualityStats(blendShapes: BlendShapesData): {
    averageIntensity: number
    peakIntensity: number
    smoothness: number
    coverage: number
  } {
    const shapes = Object.values(blendShapes.blendShapes)
    const allValues = shapes.flat()
    
    const averageIntensity = allValues.reduce((sum, val) => sum + val, 0) / allValues.length
    const peakIntensity = Math.max(...allValues)
    
    // Calcular suavidade (variação entre frames consecutivos)
    let totalVariation = 0
    let variationCount = 0
    
    shapes.forEach(shapeValues => {
      for (let i = 1; i < shapeValues.length; i++) {
        totalVariation += Math.abs(shapeValues[i] - shapeValues[i - 1])
        variationCount++
      }
    })
    
    const smoothness = variationCount > 0 ? 1 - (totalVariation / variationCount) : 0
    const coverage = shapes.filter(values => Math.max(...values) > 0.1).length / shapes.length
    
    return {
      averageIntensity,
      peakIntensity,
      smoothness: Math.max(0, smoothness),
      coverage,
    }
  },
}

export default Audio2FaceService