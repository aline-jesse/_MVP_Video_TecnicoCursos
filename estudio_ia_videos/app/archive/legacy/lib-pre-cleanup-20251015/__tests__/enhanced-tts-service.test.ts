/**
 * 🧪 Testes Unitários - EnhancedTTSService
 * Validação completa do serviço de TTS aprimorado
 */

import { EnhancedTTSService, type EnhancedTTSConfig } from '../enhanced-tts-service'

// Mock do fetch global
global.fetch = jest.fn()

describe('EnhancedTTSService', () => {
  let ttsService: EnhancedTTSService
  
  // Configuração mock global para todos os testes
  const mockConfig: EnhancedTTSConfig = {
    text: 'Olá, este é um teste de síntese de voz avançada.',
    language: 'pt-BR',
    voice: 'francisca-neural',
    speed: 1.0,
    pitch: 0.0,
    cacheEnabled: false,
    provider: 'synthetic' // Forçar uso do provider sintético para testes
  }
  
  beforeEach(() => {
    // Reset singleton para cada teste
    (EnhancedTTSService as any).instance = null
    ttsService = EnhancedTTSService.getInstance()
    
    // Reset mocks
    jest.clearAllMocks()
    
    // Mock do fetch
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
      json: () => Promise.resolve({ success: true })
    } as Response)
  })

  describe('Singleton Pattern', () => {
    it('deve retornar a mesma instância', () => {
      const instance1 = EnhancedTTSService.getInstance()
      const instance2 = EnhancedTTSService.getInstance()
      
      expect(instance1).toBe(instance2)
    })
  })

  describe('synthesizeSpeech', () => {

    it('deve sintetizar fala com configuração válida', async () => {
      const result = await ttsService.synthesizeSpeech(mockConfig)
      
      expect(result).toBeDefined()
      expect(result.audioUrl).toContain('data:audio/wav;base64,')
      expect(result.duration).toBeGreaterThan(0)
      expect(result.phonemes).toBeDefined()
      expect(result.lipSyncData).toBeDefined()
      expect(result.quality).toBeGreaterThan(0)
    })

    it('deve gerar fonemas corretos para texto em português', async () => {
      const result = await ttsService.synthesizeSpeech(mockConfig)
      
      expect(result.phonemes).toHaveLength(expect.any(Number))
      expect(result.phonemes[0]).toHaveProperty('phoneme')
      expect(result.phonemes[0]).toHaveProperty('startTime')
      expect(result.phonemes[0]).toHaveProperty('endTime')
      expect(result.phonemes[0]).toHaveProperty('confidence')
    })

    it('deve gerar dados de lip-sync com precisão alta', async () => {
      const result = await ttsService.synthesizeSpeech(mockConfig)
      
      expect(result.lipSyncData).toBeDefined()
      expect(result.lipSyncData.frames).toHaveLength(expect.any(Number))
      expect(result.lipSyncData.frameRate).toBe(60) // Precisão alta
      expect(result.lipSyncData.frames[0]).toHaveProperty('time')
      expect(result.lipSyncData.frames[0]).toHaveProperty('mouthShape')
      expect(result.lipSyncData.frames[0]).toHaveProperty('intensity')
    })

    it('deve ajustar qualidade baseado na emoção', async () => {
      const emotionalConfig = { ...mockConfig, emotion: 'happy' as const }
      const result = await ttsService.synthesizeSpeech(emotionalConfig)
      
      expect(result.quality).toBeGreaterThan(0.5)
      expect(result.metadata).toHaveProperty('emotionalStyle')
    })

    it('deve falhar com texto vazio', async () => {
      const invalidConfig = { ...mockConfig, text: '' }
      
      await expect(ttsService.synthesizeSpeech(invalidConfig))
        .rejects.toThrow('Texto não pode estar vazio')
    })

    it('deve falhar com texto muito longo', async () => {
      const longText = 'a'.repeat(10001)
      const invalidConfig = { ...mockConfig, text: longText }
      
      await expect(ttsService.synthesizeSpeech(invalidConfig))
        .rejects.toThrow('Texto muito longo')
    })
  })

  describe('Cache System', () => {
    const mockConfig: EnhancedTTSConfig = {
      text: 'Teste de cache',
      language: 'pt-BR',
      voice: 'test-voice',
      speed: 1.0,
      pitch: 1.0,
      emotion: 'neutral',
      provider: 'synthetic',
      lipSyncPrecision: 'medium'
    }

    it('deve usar cache para requisições idênticas', async () => {
      // Primeira chamada
      const result1 = await ttsService.synthesizeSpeech(mockConfig)
      
      // Segunda chamada (deve usar cache)
      const result2 = await ttsService.synthesizeSpeech(mockConfig)
      
      expect(result1.audioUrl).toBe(result2.audioUrl)
      expect(result1.metadata.cached).toBe(false)
      expect(result2.metadata.cached).toBe(true)
    })

    it('deve limpar cache quando necessário', () => {
      ttsService.clearCache()
      const stats = ttsService.getCacheStats()
      
      expect(stats.size).toBe(0)
      expect(stats.hitRate).toBe(0)
    })

    it('deve retornar estatísticas de cache corretas', async () => {
      await ttsService.synthesizeSpeech(mockConfig)
      await ttsService.synthesizeSpeech(mockConfig) // Cache hit
      
      const stats = ttsService.getCacheStats()
      
      expect(stats.size).toBeGreaterThan(0)
      expect(stats.hits).toBe(1)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBe(0.5)
    })
  })

  describe('Provider Fallback', () => {
    it('deve usar fallback quando provider principal falha', async () => {
      // Mock falha do ElevenLabs
      ;(fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('ElevenLabs API Error')
      )

      const config: EnhancedTTSConfig = {
        text: 'Teste de fallback',
        language: 'pt-BR',
        voice: 'test-voice',
        speed: 1.0,
        pitch: 1.0,
        emotion: 'neutral',
        provider: 'elevenlabs',
        lipSyncPrecision: 'medium'
      }

      const result = await ttsService.synthesizeSpeech(config)
      
      expect(result).toBeDefined()
      expect(result.metadata.provider).toBe('synthetic') // Fallback
      expect(result.metadata.fallbackUsed).toBe(true)
    })
  })

  describe('testProviders', () => {
    it('deve testar todos os providers disponíveis', async () => {
      const results = await ttsService.testProviders()
      
      expect(results).toHaveProperty('elevenlabs')
      expect(results).toHaveProperty('azure')
      expect(results).toHaveProperty('google')
      expect(results).toHaveProperty('synthetic')
      
      // Synthetic deve sempre funcionar
      expect(results.synthetic.available).toBe(true)
      expect(results.synthetic.latency).toBeGreaterThan(0)
    })
  })

  describe('Phoneme Generation', () => {
    it('deve gerar fonemas para diferentes idiomas', async () => {
      const configs = [
        { ...mockConfig, language: 'pt-BR' as const, text: 'Olá mundo' },
        { ...mockConfig, language: 'en-US' as const, text: 'Hello world' },
        { ...mockConfig, language: 'es-ES' as const, text: 'Hola mundo' }
      ]

      for (const config of configs) {
        const result = await ttsService.synthesizeSpeech(config)
        
        expect(result.phonemes).toBeDefined()
        expect(result.phonemes.length).toBeGreaterThan(0)
        expect(result.phonemes[0].phoneme).toMatch(/^[a-zA-Z]+$/)
      }
    })

    it('deve calcular confiança dos fonemas corretamente', async () => {
      const result = await ttsService.synthesizeSpeech(mockConfig)
      
      result.phonemes.forEach(phoneme => {
        expect(phoneme.confidence).toBeGreaterThanOrEqual(0)
        expect(phoneme.confidence).toBeLessThanOrEqual(1)
      })
    })
  })

  describe('Lip-Sync Data Generation', () => {
    it('deve gerar dados de lip-sync com diferentes precisões', async () => {
      const precisions: Array<'low' | 'medium' | 'high' | 'ultra'> = ['low', 'medium', 'high', 'ultra']
      
      for (const precision of precisions) {
        const config = { ...mockConfig, lipSyncPrecision: precision }
        const result = await ttsService.synthesizeSpeech(config)
        
        expect(result.lipSyncData).toBeDefined()
        expect(result.lipSyncData.precision).toBe(precision)
        
        // Frame rate deve aumentar com a precisão
        const expectedFrameRate = precision === 'low' ? 24 : 
                                 precision === 'medium' ? 30 :
                                 precision === 'high' ? 60 : 120
        expect(result.lipSyncData.frameRate).toBe(expectedFrameRate)
      }
    })

    it('deve gerar formas de boca válidas', async () => {
      const result = await ttsService.synthesizeSpeech(mockConfig)
      
      const validMouthShapes = ['A', 'E', 'I', 'O', 'U', 'M', 'B', 'P', 'F', 'V', 'T', 'D', 'S', 'Z', 'L', 'R', 'N', 'closed', 'open']
      
      result.lipSyncData.frames.forEach(frame => {
        expect(validMouthShapes).toContain(frame.mouthShape)
        expect(frame.intensity).toBeGreaterThanOrEqual(0)
        expect(frame.intensity).toBeLessThanOrEqual(1)
      })
    })
  })

  describe('Error Handling', () => {
    it('deve tratar erro de configuração inválida', async () => {
      const invalidConfig = {
        text: 'Teste',
        language: 'invalid-lang' as any,
        voice: '',
        speed: -1,
        pitch: 10,
        emotion: 'invalid-emotion' as any,
        provider: 'invalid-provider' as any,
        lipSyncPrecision: 'invalid-precision' as any
      }

      await expect(ttsService.synthesizeSpeech(invalidConfig))
        .rejects.toThrow()
    })

    it('deve tratar erro de rede graciosamente', async () => {
      ;(fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(
        new Error('Network Error')
      )

      const result = await ttsService.synthesizeSpeech(mockConfig)
      
      // Deve usar fallback synthetic
      expect(result).toBeDefined()
      expect(result.metadata.provider).toBe('synthetic')
    })
  })

  describe('Performance Metrics', () => {
    it('deve coletar métricas de performance', async () => {
      const startTime = Date.now()
      const result = await ttsService.synthesizeSpeech(mockConfig)
      const endTime = Date.now()
      
      expect(result.metadata.processingTime).toBeGreaterThan(0)
      expect(result.metadata.processingTime).toBeLessThan(endTime - startTime + 100) // Margem de erro
    })

    it('deve estimar duração corretamente', async () => {
      const result = await ttsService.synthesizeSpeech(mockConfig)
      
      // Duração deve ser proporcional ao tamanho do texto
      const expectedDuration = mockConfig.text.length * 80 // ~80ms por caractere
      expect(result.duration).toBeGreaterThan(expectedDuration * 0.5)
      expect(result.duration).toBeLessThan(expectedDuration * 2)
    })
  })

  describe('Configuration Validation', () => {
    it('deve validar velocidade dentro dos limites', async () => {
      const configs = [
        { ...mockConfig, speed: 0.25 }, // Mínimo
        { ...mockConfig, speed: 1.0 },  // Normal
        { ...mockConfig, speed: 4.0 }   // Máximo
      ]

      for (const config of configs) {
        const result = await ttsService.synthesizeSpeech(config)
        expect(result).toBeDefined()
      }

      // Teste valores inválidos
      await expect(ttsService.synthesizeSpeech({ ...mockConfig, speed: 0.1 }))
        .rejects.toThrow()
      await expect(ttsService.synthesizeSpeech({ ...mockConfig, speed: 5.0 }))
        .rejects.toThrow()
    })

    it('deve validar pitch dentro dos limites', async () => {
      const configs = [
        { ...mockConfig, pitch: 0.5 }, // Mínimo
        { ...mockConfig, pitch: 1.0 }, // Normal
        { ...mockConfig, pitch: 2.0 }  // Máximo
      ]

      for (const config of configs) {
        const result = await ttsService.synthesizeSpeech(config)
        expect(result).toBeDefined()
      }
    })
  })
})