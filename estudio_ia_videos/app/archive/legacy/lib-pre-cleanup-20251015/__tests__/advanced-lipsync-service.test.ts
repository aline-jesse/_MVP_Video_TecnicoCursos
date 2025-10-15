/**
 * 🧪 Testes Unitários - AdvancedLipSyncService
 * Validação completa do serviço de sincronização labial avançado
 */

import { AdvancedLipSyncService } from '../advanced-lipsync-service'

describe('AdvancedLipSyncService', () => {
  let lipSyncService: AdvancedLipSyncService
  
  beforeEach(() => {
    // Reset singleton para cada teste
    ;(AdvancedLipSyncService as any).instance = null
    lipSyncService = AdvancedLipSyncService.getInstance()
  })

  describe('Singleton Pattern', () => {
    it('deve retornar a mesma instância', () => {
      const instance1 = AdvancedLipSyncService.getInstance()
      const instance2 = AdvancedLipSyncService.getInstance()
      
      expect(instance1).toBe(instance2)
    })
  })

  describe('generateAdvancedLipSync', () => {
    const mockAudioBuffer = new ArrayBuffer(44100 * 2) // 1 segundo de áudio mono 16-bit
    const mockPhonemes = [
      { phoneme: 'o', startTime: 0, endTime: 200, confidence: 0.9 },
      { phoneme: 'l', startTime: 200, endTime: 400, confidence: 0.8 },
      { phoneme: 'a', startTime: 400, endTime: 600, confidence: 0.9 }
    ]
    const mockText = 'Olá'
    const mockConfig = {
      precision: 'high' as const,
      frameRate: 60,
      smoothing: 0.3,
      intensity: 0.8,
      enableEmotions: true,
      enableBreathing: true,
      enableMicroExpressions: false
    }

    it('deve gerar lip-sync avançado com sucesso', async () => {
      const result = await lipSyncService.generateAdvancedLipSync(
        mockAudioBuffer,
        mockPhonemes,
        mockText,
        mockConfig
      )
      
      expect(result).toBeDefined()
      expect(result.keyframes).toHaveLength(expect.any(Number))
      expect(result.metadata).toHaveProperty('confidence')
      expect(result.metadata).toHaveProperty('frameRate', 60)
      expect(result.metadata).toHaveProperty('precision', 'high')
      expect(result.metadata.confidence).toBeGreaterThan(0)
      expect(result.metadata.confidence).toBeLessThanOrEqual(1)
    })

    it('deve gerar keyframes com blend shapes corretos', async () => {
      const result = await lipSyncService.generateAdvancedLipSync(
        mockAudioBuffer,
        mockPhonemes,
        mockText,
        mockConfig
      )
      
      result.keyframes.forEach(keyframe => {
        expect(keyframe).toHaveProperty('time')
        expect(keyframe).toHaveProperty('blendShapes')
        expect(keyframe).toHaveProperty('confidence')
        expect(keyframe.time).toBeGreaterThanOrEqual(0)
        expect(keyframe.confidence).toBeGreaterThanOrEqual(0)
        expect(keyframe.confidence).toBeLessThanOrEqual(1)
        
        // Verificar blend shapes principais
        expect(keyframe.blendShapes).toHaveProperty('jawOpen')
        expect(keyframe.blendShapes).toHaveProperty('mouthClose')
        expect(keyframe.blendShapes).toHaveProperty('mouthFunnel')
        expect(keyframe.blendShapes).toHaveProperty('mouthPucker')
        expect(keyframe.blendShapes).toHaveProperty('mouthLeft')
        expect(keyframe.blendShapes).toHaveProperty('mouthRight')
        expect(keyframe.blendShapes).toHaveProperty('mouthSmileLeft')
        expect(keyframe.blendShapes).toHaveProperty('mouthSmileRight')
      })
    })

    it('deve aplicar coarticulação entre fonemas', async () => {
      const overlappingPhonemes = [
        { phoneme: 'm', startTime: 0, endTime: 150, confidence: 0.9 },
        { phoneme: 'a', startTime: 100, endTime: 300, confidence: 0.8 }, // Sobreposição
        { phoneme: 'n', startTime: 250, endTime: 400, confidence: 0.9 }
      ]

      const result = await lipSyncService.generateAdvancedLipSync(
        mockAudioBuffer,
        overlappingPhonemes,
        'man',
        mockConfig
      )
      
      // Verificar se a coarticulação foi aplicada
      const overlappingFrames = result.keyframes.filter(
        frame => frame.time >= 100 && frame.time <= 150
      )
      
      expect(overlappingFrames.length).toBeGreaterThan(0)
      // Durante a sobreposição, os blend shapes devem ser uma mistura
      overlappingFrames.forEach(frame => {
        expect(frame.blendShapes.mouthClose).toBeGreaterThan(0) // Influência do 'm'
        expect(frame.blendShapes.jawOpen).toBeGreaterThan(0) // Influência do 'a'
      })
    })

    it('deve detectar e aplicar emoções do texto', async () => {
      const emotionalTexts = [
        { text: 'Estou muito feliz hoje!', expectedEmotion: 'happy' },
        { text: 'Que tristeza profunda...', expectedEmotion: 'sad' },
        { text: 'Estou furioso com isso!', expectedEmotion: 'angry' }
      ]

      for (const { text, expectedEmotion } of emotionalTexts) {
        const result = await lipSyncService.generateAdvancedLipSync(
          mockAudioBuffer,
          mockPhonemes,
          text,
          mockConfig
        )
        
        expect(result.metadata.emotions).toBeDefined()
        expect(result.metadata.emotions.length).toBeGreaterThan(0)
        
        const dominantEmotion = result.metadata.emotions.reduce((prev, current) => 
          prev.intensity > current.intensity ? prev : current
        )
        
        expect(dominantEmotion.emotion).toBe(expectedEmotion)
      }
    })

    it('deve ajustar frame rate baseado na precisão', async () => {
      const precisions = [
        { precision: 'low' as const, expectedFrameRate: 24 },
        { precision: 'medium' as const, expectedFrameRate: 30 },
        { precision: 'high' as const, expectedFrameRate: 60 },
        { precision: 'ultra' as const, expectedFrameRate: 120 }
      ]

      for (const { precision, expectedFrameRate } of precisions) {
        const config = { ...mockConfig, precision, frameRate: expectedFrameRate }
        const result = await lipSyncService.generateAdvancedLipSync(
          mockAudioBuffer,
          mockPhonemes,
          mockText,
          config
        )
        
        expect(result.metadata.frameRate).toBe(expectedFrameRate)
        
        // Verificar densidade de keyframes
        const duration = mockPhonemes[mockPhonemes.length - 1].endTime
        const expectedFrames = Math.ceil(duration / 1000 * expectedFrameRate)
        expect(result.keyframes.length).toBeGreaterThanOrEqual(expectedFrames * 0.8)
      }
    })

    it('deve aplicar suavização aos keyframes', async () => {
      const smoothingLevels = [0.0, 0.3, 0.7, 1.0]

      for (const smoothing of smoothingLevels) {
        const config = { ...mockConfig, smoothing }
        const result = await lipSyncService.generateAdvancedLipSync(
          mockAudioBuffer,
          mockPhonemes,
          mockText,
          config
        )
        
        // Verificar se a suavização foi aplicada
        if (smoothing > 0 && result.keyframes.length > 2) {
          const variations = []
          for (let i = 1; i < result.keyframes.length - 1; i++) {
            const prev = result.keyframes[i - 1].blendShapes.jawOpen
            const curr = result.keyframes[i].blendShapes.jawOpen
            const next = result.keyframes[i + 1].blendShapes.jawOpen
            
            const variation = Math.abs(curr - (prev + next) / 2)
            variations.push(variation)
          }
          
          const avgVariation = variations.reduce((a, b) => a + b, 0) / variations.length
          
          // Maior suavização deve resultar em menor variação
          expect(avgVariation).toBeLessThan(0.5)
        }
      }
    })

    it('deve incluir respiração quando habilitada', async () => {
      const configWithBreathing = { ...mockConfig, enableBreathing: true }
      const result = await lipSyncService.generateAdvancedLipSync(
        mockAudioBuffer,
        mockPhonemes,
        mockText,
        configWithBreathing
      )
      
      // Verificar se há keyframes com estado de respiração
      const breathingFrames = result.keyframes.filter(frame => 
        frame.breathingState && frame.breathingState.intensity > 0
      )
      
      expect(breathingFrames.length).toBeGreaterThan(0)
      
      breathingFrames.forEach(frame => {
        expect(frame.breathingState).toHaveProperty('phase')
        expect(frame.breathingState).toHaveProperty('intensity')
        expect(frame.breathingState.intensity).toBeGreaterThan(0)
        expect(frame.breathingState.intensity).toBeLessThanOrEqual(1)
        expect(['inhale', 'exhale', 'hold']).toContain(frame.breathingState.phase)
      })
    })

    it('deve incluir micro-expressões quando habilitadas', async () => {
      const configWithMicroExpressions = { ...mockConfig, enableMicroExpressions: true }
      const result = await lipSyncService.generateAdvancedLipSync(
        mockAudioBuffer,
        mockPhonemes,
        mockText,
        configWithMicroExpressions
      )
      
      // Verificar se há keyframes com micro-expressões
      const microExpressionFrames = result.keyframes.filter(frame => 
        frame.microExpression && frame.microExpression.intensity > 0
      )
      
      expect(microExpressionFrames.length).toBeGreaterThan(0)
      
      microExpressionFrames.forEach(frame => {
        expect(frame.microExpression).toHaveProperty('type')
        expect(frame.microExpression).toHaveProperty('intensity')
        expect(frame.microExpression.intensity).toBeGreaterThan(0)
        expect(frame.microExpression.intensity).toBeLessThanOrEqual(1)
        expect(['blink', 'eyebrow_raise', 'slight_smile', 'nostril_flare']).toContain(frame.microExpression.type)
      })
    })
  })

  describe('analyzeAudio', () => {
    it('deve analisar áudio e extrair características', async () => {
      const audioBuffer = new ArrayBuffer(44100 * 2) // 1 segundo
      const analysis = await lipSyncService.analyzeAudio(audioBuffer)
      
      expect(analysis).toHaveProperty('formants')
      expect(analysis).toHaveProperty('pitch')
      expect(analysis).toHaveProperty('energy')
      expect(analysis).toHaveProperty('silences')
      
      expect(analysis.formants).toHaveLength(expect.any(Number))
      expect(analysis.pitch).toHaveLength(expect.any(Number))
      expect(analysis.energy).toHaveLength(expect.any(Number))
      expect(analysis.silences).toHaveLength(expect.any(Number))
    })

    it('deve detectar silêncios corretamente', async () => {
      // Simular áudio com silêncio no meio
      const audioBuffer = new ArrayBuffer(44100 * 3) // 3 segundos
      const analysis = await lipSyncService.analyzeAudio(audioBuffer)
      
      expect(analysis.silences).toBeDefined()
      analysis.silences.forEach(silence => {
        expect(silence).toHaveProperty('startTime')
        expect(silence).toHaveProperty('endTime')
        expect(silence.endTime).toBeGreaterThan(silence.startTime)
      })
    })
  })

  describe('processPhonemes', () => {
    const mockPhonemes = [
      { phoneme: 'p', startTime: 0, endTime: 100, confidence: 0.9 },
      { phoneme: 'a', startTime: 100, endTime: 300, confidence: 0.8 },
      { phoneme: 't', startTime: 300, endTime: 400, confidence: 0.9 }
    ]

    it('deve processar fonemas com coarticulação', () => {
      const processed = lipSyncService.processPhonemes(mockPhonemes, {
        precision: 'high',
        frameRate: 60,
        smoothing: 0.3,
        intensity: 0.8,
        enableEmotions: true,
        enableBreathing: true,
        enableMicroExpressions: false
      })
      
      expect(processed).toHaveLength(mockPhonemes.length)
      processed.forEach((phoneme, index) => {
        expect(phoneme).toHaveProperty('phoneme', mockPhonemes[index].phoneme)
        expect(phoneme).toHaveProperty('blendShapes')
        expect(phoneme).toHaveProperty('coarticulation')
        
        // Verificar blend shapes
        expect(phoneme.blendShapes).toHaveProperty('jawOpen')
        expect(phoneme.blendShapes).toHaveProperty('mouthClose')
        
        // Verificar coarticulação
        expect(phoneme.coarticulation).toHaveProperty('previous')
        expect(phoneme.coarticulation).toHaveProperty('next')
      })
    })

    it('deve mapear fonemas para blend shapes corretos', () => {
      const vowelPhonemes = [
        { phoneme: 'a', startTime: 0, endTime: 100, confidence: 0.9 },
        { phoneme: 'e', startTime: 100, endTime: 200, confidence: 0.9 },
        { phoneme: 'i', startTime: 200, endTime: 300, confidence: 0.9 },
        { phoneme: 'o', startTime: 300, endTime: 400, confidence: 0.9 },
        { phoneme: 'u', startTime: 400, endTime: 500, confidence: 0.9 }
      ]

      const processed = lipSyncService.processPhonemes(vowelPhonemes, {
        precision: 'medium',
        frameRate: 30,
        smoothing: 0.3,
        intensity: 0.8,
        enableEmotions: false,
        enableBreathing: false,
        enableMicroExpressions: false
      })

      // Verificar mapeamentos específicos
      expect(processed[0].blendShapes.jawOpen).toBeGreaterThan(0.5) // 'a' - boca aberta
      expect(processed[2].blendShapes.mouthClose).toBeGreaterThan(0.3) // 'i' - boca fechada
      expect(processed[3].blendShapes.mouthFunnel).toBeGreaterThan(0.3) // 'o' - boca arredondada
      expect(processed[4].blendShapes.mouthPucker).toBeGreaterThan(0.3) // 'u' - boca franzida
    })
  })

  describe('analyzeEmotions', () => {
    it('deve analisar emoções do texto', () => {
      const emotionalTexts = [
        'Estou muito feliz e animado!',
        'Que tristeza profunda sinto...',
        'Estou furioso com essa situação!',
        'Tenho medo do que pode acontecer.',
        'Que surpresa incrível!'
      ]

      emotionalTexts.forEach(text => {
        const emotions = lipSyncService.analyzeEmotions(text, new ArrayBuffer(1024))
        
        expect(emotions).toHaveLength(expect.any(Number))
        emotions.forEach(emotion => {
          expect(emotion).toHaveProperty('emotion')
          expect(emotion).toHaveProperty('intensity')
          expect(emotion).toHaveProperty('startTime')
          expect(emotion).toHaveProperty('endTime')
          expect(emotion.intensity).toBeGreaterThanOrEqual(0)
          expect(emotion.intensity).toBeLessThanOrEqual(1)
          expect(['happy', 'sad', 'angry', 'fear', 'surprise', 'neutral']).toContain(emotion.emotion)
        })
      })
    })

    it('deve combinar emoções de texto e áudio', () => {
      const text = 'Estou muito feliz!'
      const audioBuffer = new ArrayBuffer(44100) // 1 segundo
      
      const emotions = lipSyncService.analyzeEmotions(text, audioBuffer)
      
      expect(emotions).toHaveLength(expect.any(Number))
      
      // Deve haver pelo menos uma emoção detectada
      expect(emotions.length).toBeGreaterThan(0)
      
      // A emoção dominante deve ser 'happy' para este texto
      const dominantEmotion = emotions.reduce((prev, current) => 
        prev.intensity > current.intensity ? prev : current
      )
      expect(dominantEmotion.emotion).toBe('happy')
    })
  })

  describe('Configuration Management', () => {
    it('deve atualizar configuração corretamente', () => {
      const newConfig = {
        precision: 'ultra' as const,
        frameRate: 120,
        smoothing: 0.5,
        intensity: 0.9,
        enableEmotions: false,
        enableBreathing: false,
        enableMicroExpressions: true
      }

      lipSyncService.updateConfig(newConfig)
      const currentConfig = lipSyncService.getConfig()
      
      expect(currentConfig).toEqual(newConfig)
    })

    it('deve mesclar configuração parcial', () => {
      const originalConfig = lipSyncService.getConfig()
      const partialConfig = {
        frameRate: 90,
        enableEmotions: false
      }

      lipSyncService.updateConfig(partialConfig)
      const updatedConfig = lipSyncService.getConfig()
      
      expect(updatedConfig.frameRate).toBe(90)
      expect(updatedConfig.enableEmotions).toBe(false)
      expect(updatedConfig.precision).toBe(originalConfig.precision) // Mantido
      expect(updatedConfig.smoothing).toBe(originalConfig.smoothing) // Mantido
    })
  })

  describe('Performance Optimization', () => {
    it('deve processar áudio longo eficientemente', async () => {
      const longAudioBuffer = new ArrayBuffer(44100 * 10) // 10 segundos
      const manyPhonemes = Array.from({ length: 50 }, (_, i) => ({
        phoneme: ['a', 'e', 'i', 'o', 'u'][i % 5],
        startTime: i * 200,
        endTime: (i + 1) * 200,
        confidence: 0.8 + Math.random() * 0.2
      }))

      const startTime = Date.now()
      const result = await lipSyncService.generateAdvancedLipSync(
        longAudioBuffer,
        manyPhonemes,
        'Texto longo para teste de performance',
        {
          precision: 'high',
          frameRate: 60,
          smoothing: 0.3,
          intensity: 0.8,
          enableEmotions: true,
          enableBreathing: true,
          enableMicroExpressions: false
        }
      )
      const endTime = Date.now()

      expect(result).toBeDefined()
      expect(result.keyframes.length).toBeGreaterThan(0)
      expect(endTime - startTime).toBeLessThan(5000) // Deve processar em menos de 5 segundos
    })

    it('deve otimizar memória para precisão baixa', async () => {
      const audioBuffer = new ArrayBuffer(44100 * 2)
      const phonemes = [
        { phoneme: 'a', startTime: 0, endTime: 1000, confidence: 0.9 },
        { phoneme: 'e', startTime: 1000, endTime: 2000, confidence: 0.9 }
      ]

      const lowPrecisionResult = await lipSyncService.generateAdvancedLipSync(
        audioBuffer,
        phonemes,
        'ae',
        {
          precision: 'low',
          frameRate: 24,
          smoothing: 0.1,
          intensity: 0.8,
          enableEmotions: false,
          enableBreathing: false,
          enableMicroExpressions: false
        }
      )

      const highPrecisionResult = await lipSyncService.generateAdvancedLipSync(
        audioBuffer,
        phonemes,
        'ae',
        {
          precision: 'ultra',
          frameRate: 120,
          smoothing: 0.5,
          intensity: 0.8,
          enableEmotions: true,
          enableBreathing: true,
          enableMicroExpressions: true
        }
      )

      // Precisão baixa deve gerar menos keyframes
      expect(lowPrecisionResult.keyframes.length).toBeLessThan(highPrecisionResult.keyframes.length)
    })
  })

  describe('Error Handling', () => {
    it('deve tratar áudio inválido graciosamente', async () => {
      const invalidAudioBuffer = new ArrayBuffer(0) // Áudio vazio
      const phonemes = [{ phoneme: 'a', startTime: 0, endTime: 100, confidence: 0.9 }]

      await expect(lipSyncService.generateAdvancedLipSync(
        invalidAudioBuffer,
        phonemes,
        'a',
        {
          precision: 'medium',
          frameRate: 30,
          smoothing: 0.3,
          intensity: 0.8,
          enableEmotions: false,
          enableBreathing: false,
          enableMicroExpressions: false
        }
      )).rejects.toThrow()
    })

    it('deve tratar fonemas inválidos', async () => {
      const audioBuffer = new ArrayBuffer(44100)
      const invalidPhonemes = [
        { phoneme: '', startTime: 0, endTime: 100, confidence: 0.9 }, // Fonema vazio
        { phoneme: 'a', startTime: 200, endTime: 100, confidence: 0.9 } // Tempo inválido
      ]

      await expect(lipSyncService.generateAdvancedLipSync(
        audioBuffer,
        invalidPhonemes,
        'a',
        {
          precision: 'medium',
          frameRate: 30,
          smoothing: 0.3,
          intensity: 0.8,
          enableEmotions: false,
          enableBreathing: false,
          enableMicroExpressions: false
        }
      )).rejects.toThrow()
    })

    it('deve tratar configuração inválida', async () => {
      const audioBuffer = new ArrayBuffer(44100)
      const phonemes = [{ phoneme: 'a', startTime: 0, endTime: 100, confidence: 0.9 }]
      const invalidConfig = {
        precision: 'invalid' as any,
        frameRate: -1,
        smoothing: 2.0,
        intensity: -0.5,
        enableEmotions: 'yes' as any,
        enableBreathing: 'no' as any,
        enableMicroExpressions: 1 as any
      }

      await expect(lipSyncService.generateAdvancedLipSync(
        audioBuffer,
        phonemes,
        'a',
        invalidConfig
      )).rejects.toThrow()
    })
  })

  describe('Memory Management', () => {
    it('deve limpar recursos corretamente', () => {
      expect(() => {
        lipSyncService.dispose()
      }).not.toThrow()
    })

    it('deve funcionar após dispose e nova instância', () => {
      lipSyncService.dispose()
      
      // Reset singleton
      ;(AdvancedLipSyncService as any).instance = null
      const newInstance = AdvancedLipSyncService.getInstance()
      
      expect(newInstance).toBeDefined()
      expect(newInstance.getConfig()).toBeDefined()
    })
  })
})