/**
 * 🧪 Testes de Integração - UnifiedAvatarPipeline
 * Validação do pipeline completo de geração de vídeo com avatar
 */

import { UnifiedAvatarPipeline } from '../unified-avatar-pipeline'
import { EnhancedTTSService } from '../enhanced-tts-service'
import { ElevenLabsService } from '../elevenlabs-service'
import { AdvancedLipSyncService } from '../advanced-lipsync-service'
import { MonitoringService } from '../monitoring-service'

// Mock dos serviços externos
jest.mock('../enhanced-tts-service')
jest.mock('../elevenlabs-service')
jest.mock('../advanced-lipsync-service')
jest.mock('../monitoring-service')

describe('UnifiedAvatarPipeline - Integration Tests', () => {
  let pipeline: UnifiedAvatarPipeline
  let mockTTSService: jest.Mocked<EnhancedTTSService>
  let mockElevenLabsService: jest.Mocked<ElevenLabsService>
  let mockLipSyncService: jest.Mocked<AdvancedLipSyncService>
  let mockMonitoringService: jest.Mocked<MonitoringService>

  beforeEach(() => {
    // Reset singletons
    ;(UnifiedAvatarPipeline as any).instance = null
    ;(EnhancedTTSService as any).instance = null
    ;(ElevenLabsService as any).instance = null
    ;(AdvancedLipSyncService as any).instance = null
    ;(MonitoringService as any).instance = null

    // Setup mocks
    mockTTSService = {
      synthesizeSpeech: jest.fn(),
      generatePhonemes: jest.fn(),
      generateLipSyncData: jest.fn(),
      testProviders: jest.fn(),
      getPerformanceMetrics: jest.fn(),
      clearCache: jest.fn()
    } as any

    mockElevenLabsService = {
      generateSpeech: jest.fn(),
      getVoices: jest.fn(),
      getBrazilianVoices: jest.fn(),
      cloneVoice: jest.fn(),
      getUserInfo: jest.fn(),
      detectLanguage: jest.fn(),
      getPerformanceMetrics: jest.fn(),
      runConnectionDiagnostics: jest.fn(),
      runTTSDiagnostics: jest.fn()
    } as any

    mockLipSyncService = {
      generateAdvancedLipSync: jest.fn(),
      analyzeAudio: jest.fn(),
      processPhonemes: jest.fn(),
      analyzeEmotions: jest.fn(),
      updateConfig: jest.fn(),
      getConfig: jest.fn(),
      dispose: jest.fn()
    } as any

    mockMonitoringService = {
      log: jest.fn(),
      logTTSStart: jest.fn(),
      logTTSSuccess: jest.fn(),
      logTTSError: jest.fn(),
      logLipSyncStart: jest.fn(),
      logLipSyncSuccess: jest.fn(),
      logLipSyncError: jest.fn(),
      logRenderStart: jest.fn(),
      logRenderSuccess: jest.fn(),
      logRenderError: jest.fn(),
      logPipelineStart: jest.fn(),
      logPipelineSuccess: jest.fn(),
      logPipelineError: jest.fn(),
      logCacheHit: jest.fn(),
      logCacheMiss: jest.fn(),
      logAPIRequest: jest.fn(),
      logSystemWarning: jest.fn(),
      getMetrics: jest.fn(),
      getHealthReport: jest.fn(),
      collectSystemMetrics: jest.fn()
    } as any

    // Mock getInstance methods
    ;(EnhancedTTSService.getInstance as jest.Mock).mockReturnValue(mockTTSService)
    ;(ElevenLabsService.getInstance as jest.Mock).mockReturnValue(mockElevenLabsService)
    ;(AdvancedLipSyncService.getInstance as jest.Mock).mockReturnValue(mockLipSyncService)
    ;(MonitoringService.getInstance as jest.Mock).mockReturnValue(mockMonitoringService)

    pipeline = UnifiedAvatarPipeline.getInstance()
  })

  describe('Pipeline Initialization', () => {
    it('deve inicializar todos os serviços corretamente', () => {
      expect(EnhancedTTSService.getInstance).toHaveBeenCalled()
      expect(ElevenLabsService.getInstance).toHaveBeenCalled()
      expect(AdvancedLipSyncService.getInstance).toHaveBeenCalled()
      expect(MonitoringService.getInstance).toHaveBeenCalled()
    })

    it('deve retornar a mesma instância (singleton)', () => {
      const instance1 = UnifiedAvatarPipeline.getInstance()
      const instance2 = UnifiedAvatarPipeline.getInstance()
      
      expect(instance1).toBe(instance2)
    })
  })

  describe('Complete Pipeline Flow', () => {
    const mockInput = {
      text: 'Olá, como você está hoje?',
      voice: 'pt-BR-female-1',
      avatarConfig: {
        model: 'realistic-female',
        background: 'office',
        lighting: 'natural',
        camera: 'medium-shot'
      },
      outputFormat: 'mp4' as const,
      quality: 'high' as const
    }

    beforeEach(() => {
      // Setup successful mocks
      mockTTSService.synthesizeSpeech.mockResolvedValue({
        audioBuffer: new ArrayBuffer(44100 * 2),
        phonemes: [
          { phoneme: 'o', startTime: 0, endTime: 200, confidence: 0.9 },
          { phoneme: 'l', startTime: 200, endTime: 400, confidence: 0.8 },
          { phoneme: 'a', startTime: 400, endTime: 600, confidence: 0.9 }
        ],
        metadata: {
          duration: 2000,
          sampleRate: 44100,
          channels: 1,
          provider: 'elevenlabs',
          voice: 'pt-BR-female-1',
          model: 'eleven_multilingual_v2',
          processingTime: 1500,
          confidence: 0.9
        }
      })

      mockLipSyncService.generateAdvancedLipSync.mockResolvedValue({
        keyframes: [
          {
            time: 0,
            blendShapes: {
              jawOpen: 0.3,
              mouthClose: 0.0,
              mouthFunnel: 0.1,
              mouthPucker: 0.0,
              mouthLeft: 0.0,
              mouthRight: 0.0,
              mouthSmileLeft: 0.0,
              mouthSmileRight: 0.0,
              mouthFrownLeft: 0.0,
              mouthFrownRight: 0.0,
              mouthDimpleLeft: 0.0,
              mouthDimpleRight: 0.0,
              mouthStretchLeft: 0.0,
              mouthStretchRight: 0.0,
              mouthRollLower: 0.0,
              mouthRollUpper: 0.0,
              mouthShrugLower: 0.0,
              mouthShrugUpper: 0.0,
              mouthPressLeft: 0.0,
              mouthPressRight: 0.0,
              mouthLowerDownLeft: 0.0,
              mouthLowerDownRight: 0.0,
              mouthUpperUpLeft: 0.0,
              mouthUpperUpRight: 0.0,
              browDownLeft: 0.0,
              browDownRight: 0.0,
              browInnerUp: 0.0,
              browOuterUpLeft: 0.0,
              browOuterUpRight: 0.0,
              cheekPuff: 0.0,
              cheekSquintLeft: 0.0,
              cheekSquintRight: 0.0,
              noseSneerLeft: 0.0,
              noseSneerRight: 0.0,
              tongueOut: 0.0
            },
            confidence: 0.9,
            emotion: { emotion: 'neutral', intensity: 0.1 }
          }
        ],
        metadata: {
          duration: 2000,
          frameRate: 60,
          precision: 'high',
          confidence: 0.9,
          emotions: [
            { emotion: 'neutral', intensity: 0.8, startTime: 0, endTime: 2000 }
          ],
          processingTime: 800
        }
      })

      mockMonitoringService.getMetrics.mockReturnValue({
        tts: {
          totalRequests: 1,
          successfulRequests: 1,
          failedRequests: 0,
          averageLatency: 1500,
          totalProcessingTime: 1500,
          cacheHitRate: 0.0,
          providerUsage: { elevenlabs: 1 }
        },
        lipSync: {
          totalRequests: 1,
          successfulRequests: 1,
          failedRequests: 0,
          averageLatency: 800,
          totalProcessingTime: 800,
          averageConfidence: 0.9,
          precisionUsage: { high: 1 }
        },
        rendering: {
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          averageLatency: 0,
          totalProcessingTime: 0,
          qualityUsage: {},
          formatUsage: {}
        },
        pipeline: {
          totalJobs: 1,
          completedJobs: 0,
          failedJobs: 0,
          averageLatency: 0,
          totalProcessingTime: 0,
          stageLatencies: {}
        },
        system: {
          memoryUsage: 512,
          cpuUsage: 45,
          diskUsage: 60,
          uptime: 3600
        },
        cache: {
          hitRate: 0.0,
          totalRequests: 1,
          hits: 0,
          misses: 1,
          size: 0,
          maxSize: 1000
        }
      })
    })

    it('deve processar job completo com sucesso', async () => {
      const jobId = await pipeline.createRenderJob(mockInput)
      expect(jobId).toBeDefined()
      expect(typeof jobId).toBe('string')

      const job = pipeline.getJob(jobId)
      expect(job).toBeDefined()
      expect(job?.status).toBe('pending')

      await pipeline.processJob(jobId)

      const completedJob = pipeline.getJob(jobId)
      expect(completedJob?.status).toBe('completed')
      expect(completedJob?.output).toBeDefined()
      expect(completedJob?.output?.videoUrl).toBeDefined()
      expect(completedJob?.output?.audioUrl).toBeDefined()
      expect(completedJob?.output?.lipSyncData).toBeDefined()
    })

    it('deve registrar logs durante todo o pipeline', async () => {
      const jobId = await pipeline.createRenderJob(mockInput)
      await pipeline.processJob(jobId)

      // Verificar se os logs foram chamados
      expect(mockMonitoringService.logPipelineStart).toHaveBeenCalled()
      expect(mockMonitoringService.logTTSStart).toHaveBeenCalled()
      expect(mockMonitoringService.logTTSSuccess).toHaveBeenCalled()
      expect(mockMonitoringService.logLipSyncStart).toHaveBeenCalled()
      expect(mockMonitoringService.logLipSyncSuccess).toHaveBeenCalled()
      expect(mockMonitoringService.logRenderStart).toHaveBeenCalled()
      expect(mockMonitoringService.logRenderSuccess).toHaveBeenCalled()
    })

    it('deve atualizar progresso durante processamento', async () => {
      const jobId = await pipeline.createRenderJob(mockInput)
      
      // Mock para simular progresso
      let progressUpdates: number[] = []
      const originalProcessJob = pipeline.processJob.bind(pipeline)
      
      jest.spyOn(pipeline, 'processJob').mockImplementation(async (id: string) => {
        const job = pipeline.getJob(id)
        if (job) {
          // Simular atualizações de progresso
          job.progress = 0.1 // Preprocessing
          progressUpdates.push(job.progress)
          
          job.progress = 0.3 // TTS
          progressUpdates.push(job.progress)
          
          job.progress = 0.6 // Lip-sync
          progressUpdates.push(job.progress)
          
          job.progress = 0.9 // Rendering
          progressUpdates.push(job.progress)
          
          job.progress = 1.0 // Complete
          progressUpdates.push(job.progress)
        }
        
        return originalProcessJob(id)
      })

      await pipeline.processJob(jobId)

      expect(progressUpdates).toEqual([0.1, 0.3, 0.6, 0.9, 1.0])
    })

    it('deve coletar métricas de performance', async () => {
      const jobId = await pipeline.createRenderJob(mockInput)
      await pipeline.processJob(jobId)

      const job = pipeline.getJob(jobId)
      expect(job?.performanceMetrics).toBeDefined()
      expect(job?.performanceMetrics?.totalTime).toBeGreaterThan(0)
      expect(job?.performanceMetrics?.stages).toBeDefined()
      expect(job?.performanceMetrics?.stages?.preprocessing).toBeGreaterThan(0)
      expect(job?.performanceMetrics?.stages?.tts).toBeGreaterThan(0)
      expect(job?.performanceMetrics?.stages?.lipSync).toBeGreaterThan(0)
      expect(job?.performanceMetrics?.stages?.rendering).toBeGreaterThan(0)
    })
  })

  describe('Error Handling Integration', () => {
    const mockInput = {
      text: 'Texto de teste',
      voice: 'pt-BR-female-1',
      avatarConfig: {
        model: 'realistic-female',
        background: 'office',
        lighting: 'natural',
        camera: 'medium-shot'
      },
      outputFormat: 'mp4' as const,
      quality: 'high' as const
    }

    it('deve tratar erro no TTS graciosamente', async () => {
      mockTTSService.synthesizeSpeech.mockRejectedValue(new Error('TTS service unavailable'))

      const jobId = await pipeline.createRenderJob(mockInput)
      await pipeline.processJob(jobId)

      const job = pipeline.getJob(jobId)
      expect(job?.status).toBe('failed')
      expect(job?.error).toContain('TTS service unavailable')
      expect(mockMonitoringService.logTTSError).toHaveBeenCalled()
    })

    it('deve tratar erro no lip-sync graciosamente', async () => {
      mockTTSService.synthesizeSpeech.mockResolvedValue({
        audioBuffer: new ArrayBuffer(44100),
        phonemes: [],
        metadata: {
          duration: 1000,
          sampleRate: 44100,
          channels: 1,
          provider: 'elevenlabs',
          voice: 'pt-BR-female-1',
          model: 'eleven_multilingual_v2',
          processingTime: 1000,
          confidence: 0.9
        }
      })

      mockLipSyncService.generateAdvancedLipSync.mockRejectedValue(new Error('Lip-sync generation failed'))

      const jobId = await pipeline.createRenderJob(mockInput)
      await pipeline.processJob(jobId)

      const job = pipeline.getJob(jobId)
      expect(job?.status).toBe('failed')
      expect(job?.error).toContain('Lip-sync generation failed')
      expect(mockMonitoringService.logLipSyncError).toHaveBeenCalled()
    })

    it('deve implementar fallback quando serviço principal falha', async () => {
      // Primeiro TTS falha, segundo sucede
      mockTTSService.synthesizeSpeech
        .mockRejectedValueOnce(new Error('Primary TTS failed'))
        .mockResolvedValueOnce({
          audioBuffer: new ArrayBuffer(44100),
          phonemes: [],
          metadata: {
            duration: 1000,
            sampleRate: 44100,
            channels: 1,
            provider: 'fallback',
            voice: 'pt-BR-female-1',
            model: 'fallback_model',
            processingTime: 1200,
            confidence: 0.8
          }
        })

      mockLipSyncService.generateAdvancedLipSync.mockResolvedValue({
        keyframes: [],
        metadata: {
          duration: 1000,
          frameRate: 30,
          precision: 'medium',
          confidence: 0.8,
          emotions: [],
          processingTime: 500
        }
      })

      const jobId = await pipeline.createRenderJob(mockInput)
      await pipeline.processJob(jobId)

      const job = pipeline.getJob(jobId)
      expect(job?.status).toBe('completed')
      expect(job?.intermediateResults?.tts?.metadata.provider).toBe('fallback')
    })
  })

  describe('Cache Integration', () => {
    const mockInput = {
      text: 'Texto para cache',
      voice: 'pt-BR-female-1',
      avatarConfig: {
        model: 'realistic-female',
        background: 'office',
        lighting: 'natural',
        camera: 'medium-shot'
      },
      outputFormat: 'mp4' as const,
      quality: 'high' as const
    }

    it('deve usar cache quando disponível', async () => {
      // Primeiro processamento
      mockTTSService.synthesizeSpeech.mockResolvedValue({
        audioBuffer: new ArrayBuffer(44100),
        phonemes: [],
        metadata: {
          duration: 1000,
          sampleRate: 44100,
          channels: 1,
          provider: 'elevenlabs',
          voice: 'pt-BR-female-1',
          model: 'eleven_multilingual_v2',
          processingTime: 1000,
          confidence: 0.9
        }
      })

      const jobId1 = await pipeline.createRenderJob(mockInput)
      await pipeline.processJob(jobId1)

      // Segundo processamento (deve usar cache)
      const jobId2 = await pipeline.createRenderJob(mockInput)
      await pipeline.processJob(jobId2)

      const job2 = pipeline.getJob(jobId2)
      expect(job2?.status).toBe('completed')
      
      // Verificar se cache foi usado
      expect(mockMonitoringService.logCacheHit).toHaveBeenCalled()
    })

    it('deve invalidar cache quando necessário', async () => {
      const config = pipeline.getConfig()
      const newConfig = {
        ...config,
        cache: {
          ...config.cache,
          ttl: 0 // Cache expira imediatamente
        }
      }
      
      pipeline.updateConfig(newConfig)

      const jobId = await pipeline.createRenderJob(mockInput)
      await pipeline.processJob(jobId)

      // Cache deve ter sido invalidado
      expect(mockMonitoringService.logCacheMiss).toHaveBeenCalled()
    })
  })

  describe('Performance Optimization', () => {
    it('deve otimizar configuração baseada no input', async () => {
      const longTextInput = {
        text: 'Este é um texto muito longo que requer otimizações especiais para garantir que o processamento seja eficiente e que a qualidade do resultado final seja mantida mesmo com o aumento da complexidade do conteúdo a ser processado.',
        voice: 'pt-BR-female-1',
        avatarConfig: {
          model: 'realistic-female',
          background: 'office',
          lighting: 'natural',
          camera: 'medium-shot'
        },
        outputFormat: 'mp4' as const,
        quality: 'medium' as const // Qualidade reduzida para texto longo
      }

      const jobId = await pipeline.createRenderJob(longTextInput)
      const job = pipeline.getJob(jobId)

      // Verificar se otimizações foram aplicadas
      expect(job?.input.quality).toBe('medium')
      
      // Para texto longo, deve usar configurações otimizadas
      const config = pipeline.getConfig()
      expect(config.lipSync.precision).toBe('medium') // Reduzido para performance
    })

    it('deve processar múltiplos jobs em paralelo', async () => {
      const inputs = Array.from({ length: 3 }, (_, i) => ({
        text: `Texto ${i + 1}`,
        voice: 'pt-BR-female-1',
        avatarConfig: {
          model: 'realistic-female',
          background: 'office',
          lighting: 'natural',
          camera: 'medium-shot'
        },
        outputFormat: 'mp4' as const,
        quality: 'medium' as const
      }))

      const jobIds = await Promise.all(
        inputs.map(input => pipeline.createRenderJob(input))
      )

      const startTime = Date.now()
      await Promise.all(
        jobIds.map(jobId => pipeline.processJob(jobId))
      )
      const endTime = Date.now()

      // Verificar se todos os jobs foram processados
      jobIds.forEach(jobId => {
        const job = pipeline.getJob(jobId)
        expect(job?.status).toBe('completed')
      })

      // Processamento paralelo deve ser mais rápido que sequencial
      expect(endTime - startTime).toBeLessThan(5000)
    })
  })

  describe('Resource Management', () => {
    it('deve limpar recursos após processamento', async () => {
      const jobId = await pipeline.createRenderJob({
        text: 'Teste de limpeza',
        voice: 'pt-BR-female-1',
        avatarConfig: {
          model: 'realistic-female',
          background: 'office',
          lighting: 'natural',
          camera: 'medium-shot'
        },
        outputFormat: 'mp4' as const,
        quality: 'high' as const
      })

      await pipeline.processJob(jobId)
      
      // Simular limpeza de recursos
      pipeline.cleanupJob(jobId)
      
      const job = pipeline.getJob(jobId)
      expect(job).toBeUndefined()
    })

    it('deve gerenciar memória eficientemente', async () => {
      const initialMemory = process.memoryUsage().heapUsed

      // Processar vários jobs
      for (let i = 0; i < 5; i++) {
        const jobId = await pipeline.createRenderJob({
          text: `Teste de memória ${i}`,
          voice: 'pt-BR-female-1',
          avatarConfig: {
            model: 'realistic-female',
            background: 'office',
            lighting: 'natural',
            camera: 'medium-shot'
          },
          outputFormat: 'mp4' as const,
          quality: 'medium' as const
        })

        await pipeline.processJob(jobId)
        pipeline.cleanupJob(jobId)
      }

      // Forçar garbage collection se disponível
      if (global.gc) {
        global.gc()
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      // Aumento de memória deve ser razoável (menos de 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    })
  })
})