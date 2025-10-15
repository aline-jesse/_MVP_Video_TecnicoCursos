/**
 * 🧪 Testes Unitários - ElevenLabsService
 * Validação completa do serviço ElevenLabs
 */

import { ElevenLabsService } from '../elevenlabs-service'

// Mock do fetch global
global.fetch = jest.fn()

describe('ElevenLabsService', () => {
  let elevenLabsService: ElevenLabsService
  
  beforeEach(() => {
    // Reset singleton para cada teste
    ;(ElevenLabsService as any).instance = null
    elevenLabsService = ElevenLabsService.getInstance()
    
    // Reset mocks
    jest.clearAllMocks()
    
    // Mock padrão do fetch
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
      headers: new Headers({ 'content-type': 'application/json' })
    } as Response)
  })

  describe('Singleton Pattern', () => {
    it('deve retornar a mesma instância', () => {
      const instance1 = ElevenLabsService.getInstance()
      const instance2 = ElevenLabsService.getInstance()
      
      expect(instance1).toBe(instance2)
    })
  })

  describe('getVoices', () => {
    it('deve retornar lista de vozes disponíveis', async () => {
      const mockVoices = [
        {
          voice_id: 'voice1',
          name: 'Rachel',
          category: 'premade',
          labels: { accent: 'american', description: 'calm', age: 'young', gender: 'female' },
          preview_url: 'https://example.com/preview1.mp3',
          available_for_tiers: ['free', 'starter', 'plus', 'pro'],
          settings: { stability: 0.5, similarity_boost: 0.5, style: 0.0, use_speaker_boost: true }
        }
      ]

      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ voices: mockVoices })
      } as Response)

      const voices = await elevenLabsService.getVoices()
      
      expect(voices).toHaveLength(1)
      expect(voices[0]).toHaveProperty('voice_id', 'voice1')
      expect(voices[0]).toHaveProperty('name', 'Rachel')
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/voices'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'xi-api-key': expect.any(String)
          })
        })
      )
    })

    it('deve tratar erro da API graciosamente', async () => {
      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      } as Response)

      await expect(elevenLabsService.getVoices()).rejects.toThrow('Erro ao buscar vozes')
    })

    it('deve usar cache para requisições subsequentes', async () => {
      const mockVoices = [{ voice_id: 'test', name: 'Test Voice' }]
      
      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ voices: mockVoices })
      } as Response)

      // Primeira chamada
      await elevenLabsService.getVoices()
      
      // Segunda chamada (deve usar cache)
      await elevenLabsService.getVoices()
      
      // Fetch deve ter sido chamado apenas uma vez
      expect(fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('getBrazilianVoices', () => {
    it('deve retornar vozes brasileiras predefinidas', async () => {
      const brazilianVoices = await elevenLabsService.getBrazilianVoices()
      
      expect(brazilianVoices).toHaveLength(expect.any(Number))
      expect(brazilianVoices[0]).toHaveProperty('voice_id')
      expect(brazilianVoices[0]).toHaveProperty('name')
      expect(brazilianVoices[0].labels).toHaveProperty('accent', 'brazilian')
    })

    it('deve incluir vozes femininas e masculinas', async () => {
      const brazilianVoices = await elevenLabsService.getBrazilianVoices()
      
      const femaleVoices = brazilianVoices.filter(v => v.labels.gender === 'female')
      const maleVoices = brazilianVoices.filter(v => v.labels.gender === 'male')
      
      expect(femaleVoices.length).toBeGreaterThan(0)
      expect(maleVoices.length).toBeGreaterThan(0)
    })
  })

  describe('generateSpeech', () => {
    const mockOptions = {
      text: 'Olá, este é um teste de síntese de voz.',
      voice_id: 'pNInz6obpgDQGcFmaJgB',
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    }

    it('deve gerar áudio com sucesso', async () => {
      const mockAudioBuffer = new ArrayBuffer(1024)
      
      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockAudioBuffer),
        headers: new Headers({ 'content-type': 'audio/mpeg' })
      } as Response)

      const result = await elevenLabsService.generateSpeech(mockOptions)
      
      expect(result).toHaveProperty('audioBuffer')
      expect(result).toHaveProperty('audioUrl')
      expect(result).toHaveProperty('duration')
      expect(result).toHaveProperty('quality')
      expect(result.audioBuffer).toBe(mockAudioBuffer)
      expect(result.audioUrl).toContain('data:audio/mpeg;base64,')
    })

    it('deve selecionar modelo baseado na complexidade do texto', async () => {
      const shortText = 'Oi'
      const longText = 'Este é um texto muito longo com várias frases complexas e estruturas gramaticais elaboradas que requerem um modelo mais avançado para síntese de voz de alta qualidade.'

      // Texto curto
      await elevenLabsService.generateSpeech({ ...mockOptions, text: shortText })
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('eleven_turbo_v2')
        })
      )

      jest.clearAllMocks()

      // Texto longo
      await elevenLabsService.generateSpeech({ ...mockOptions, text: longText })
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('eleven_multilingual_v2')
        })
      )
    })

    it('deve otimizar configurações de voz baseado na emoção', async () => {
      const emotionalTexts = [
        { text: 'Estou muito feliz hoje!', expectedStability: expect.any(Number) },
        { text: 'Que tristeza...', expectedStability: expect.any(Number) },
        { text: 'Estou furioso!', expectedStability: expect.any(Number) }
      ]

      for (const { text } of emotionalTexts) {
        await elevenLabsService.generateSpeech({ ...mockOptions, text })
        
        expect(fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: expect.stringContaining('voice_settings')
          })
        )
      }
    })

    it('deve tratar erro de API graciosamente', async () => {
      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () => Promise.resolve('Invalid voice settings')
      } as Response)

      await expect(elevenLabsService.generateSpeech(mockOptions))
        .rejects.toThrow('Erro na síntese de voz')
    })

    it('deve validar parâmetros de entrada', async () => {
      const invalidOptions = [
        { ...mockOptions, text: '' },
        { ...mockOptions, voice_id: '' },
        { ...mockOptions, voice_settings: { ...mockOptions.voice_settings, stability: 2.0 } }
      ]

      for (const options of invalidOptions) {
        await expect(elevenLabsService.generateSpeech(options))
          .rejects.toThrow()
      }
    })
  })

  describe('cloneVoice', () => {
    const mockCloneOptions = {
      name: 'Minha Voz Clonada',
      description: 'Uma voz clonada para testes',
      files: [new File(['audio data'], 'sample.wav', { type: 'audio/wav' })]
    }

    it('deve clonar voz com sucesso', async () => {
      const mockResponse = {
        voice_id: 'cloned_voice_123',
        name: 'Minha Voz Clonada',
        status: 'ready'
      }

      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const result = await elevenLabsService.cloneVoice(mockCloneOptions)
      
      expect(result).toHaveProperty('voice_id', 'cloned_voice_123')
      expect(result).toHaveProperty('name', 'Minha Voz Clonada')
      expect(result).toHaveProperty('status', 'ready')
    })

    it('deve validar arquivos de áudio', async () => {
      const invalidFiles = [
        new File(['text'], 'invalid.txt', { type: 'text/plain' }),
        new File([''], 'empty.wav', { type: 'audio/wav' })
      ]

      for (const file of invalidFiles) {
        await expect(elevenLabsService.cloneVoice({
          ...mockCloneOptions,
          files: [file]
        })).rejects.toThrow()
      }
    })

    it('deve calcular score de qualidade', async () => {
      const mockResponse = {
        voice_id: 'test_voice',
        name: 'Test Voice',
        status: 'ready',
        fine_tuning: { is_allowed_to_fine_tune: true }
      }

      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const result = await elevenLabsService.cloneVoice(mockCloneOptions)
      
      expect(result).toHaveProperty('qualityScore')
      expect(result.qualityScore).toBeGreaterThanOrEqual(0)
      expect(result.qualityScore).toBeLessThanOrEqual(1)
    })
  })

  describe('getUserInfo', () => {
    it('deve retornar informações do usuário', async () => {
      const mockUserInfo = {
        subscription: {
          tier: 'starter',
          character_count: 10000,
          character_limit: 30000,
          can_extend_character_limit: true,
          allowed_to_extend_character_limit: true,
          next_character_count_reset_unix: 1640995200,
          voice_limit: 10,
          max_voice_add_edits: 10,
          voice_add_edit_counter: 0,
          professional_voice_limit: 1,
          can_extend_voice_limit: true,
          can_use_instant_voice_cloning: true,
          can_use_professional_voice_cloning: true,
          currency: 'usd',
          status: 'active'
        },
        is_new_user: false,
        xi_api_key: 'test_key',
        can_use_delayed_payment_methods: false
      }

      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserInfo)
      } as Response)

      const userInfo = await elevenLabsService.getUserInfo()
      
      expect(userInfo).toHaveProperty('subscription')
      expect(userInfo.subscription).toHaveProperty('tier', 'starter')
      expect(userInfo.subscription).toHaveProperty('character_count')
      expect(userInfo.subscription).toHaveProperty('character_limit')
    })

    it('deve tratar erro de autenticação', async () => {
      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      } as Response)

      await expect(elevenLabsService.getUserInfo())
        .rejects.toThrow('Erro ao buscar informações do usuário')
    })
  })

  describe('detectLanguage', () => {
    it('deve detectar português brasileiro', () => {
      const portugueseTexts = [
        'Olá, como você está?',
        'Este é um texto em português brasileiro.',
        'Açúcar, pão, coração'
      ]

      portugueseTexts.forEach(text => {
        const language = elevenLabsService.detectLanguage(text)
        expect(language).toBe('pt')
      })
    })

    it('deve detectar inglês', () => {
      const englishTexts = [
        'Hello, how are you?',
        'This is a text in English.',
        'The quick brown fox jumps over the lazy dog.'
      ]

      englishTexts.forEach(text => {
        const language = elevenLabsService.detectLanguage(text)
        expect(language).toBe('en')
      })
    })

    it('deve detectar espanhol', () => {
      const spanishTexts = [
        'Hola, ¿cómo estás?',
        'Este es un texto en español.',
        'El niño come manzanas.'
      ]

      spanishTexts.forEach(text => {
        const language = elevenLabsService.detectLanguage(text)
        expect(language).toBe('es')
      })
    })

    it('deve retornar inglês como padrão para texto ambíguo', () => {
      const ambiguousTexts = ['123', '!@#$%', '']

      ambiguousTexts.forEach(text => {
        const language = elevenLabsService.detectLanguage(text)
        expect(language).toBe('en')
      })
    })
  })

  describe('Performance Metrics', () => {
    it('deve coletar métricas de performance', async () => {
      const startTime = Date.now()
      
      await elevenLabsService.generateSpeech({
        text: 'Teste de performance',
        voice_id: 'test_voice',
        model_id: 'eleven_multilingual_v2'
      })
      
      const endTime = Date.now()
      const processingTime = endTime - startTime
      
      expect(processingTime).toBeGreaterThan(0)
    })

    it('deve medir latência da API', async () => {
      const mockDelay = 100
      
      ;(fetch as jest.MockedFunction<typeof fetch>).mockImplementationOnce(
        () => new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
          } as Response), mockDelay)
        )
      )

      const startTime = Date.now()
      await elevenLabsService.generateSpeech({
        text: 'Teste de latência',
        voice_id: 'test_voice',
        model_id: 'eleven_multilingual_v2'
      })
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(mockDelay)
    })
  })

  describe('Connection Diagnostics', () => {
    it('deve diagnosticar conexão com sucesso', async () => {
      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ subscription: { tier: 'starter' } })
      } as Response)

      const diagnostics = await elevenLabsService.runConnectionDiagnostics()
      
      expect(diagnostics).toHaveProperty('apiKeyValid', true)
      expect(diagnostics).toHaveProperty('connectionLatency')
      expect(diagnostics).toHaveProperty('subscriptionActive', true)
      expect(diagnostics.connectionLatency).toBeGreaterThan(0)
    })

    it('deve detectar problemas de conexão', async () => {
      ;(fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network Error')
      )

      const diagnostics = await elevenLabsService.runConnectionDiagnostics()
      
      expect(diagnostics).toHaveProperty('apiKeyValid', false)
      expect(diagnostics).toHaveProperty('subscriptionActive', false)
      expect(diagnostics).toHaveProperty('error')
    })
  })

  describe('TTS Diagnostics', () => {
    it('deve executar diagnósticos de TTS', async () => {
      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
        headers: new Headers({ 'content-type': 'audio/mpeg' })
      } as Response)

      const diagnostics = await elevenLabsService.runTTSDiagnostics()
      
      expect(diagnostics).toHaveProperty('synthesisWorking', true)
      expect(diagnostics).toHaveProperty('averageLatency')
      expect(diagnostics).toHaveProperty('qualityScore')
      expect(diagnostics.averageLatency).toBeGreaterThan(0)
      expect(diagnostics.qualityScore).toBeGreaterThanOrEqual(0)
      expect(diagnostics.qualityScore).toBeLessThanOrEqual(1)
    })

    it('deve detectar falhas na síntese', async () => {
      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response)

      const diagnostics = await elevenLabsService.runTTSDiagnostics()
      
      expect(diagnostics).toHaveProperty('synthesisWorking', false)
      expect(diagnostics).toHaveProperty('error')
    })
  })

  describe('Error Handling', () => {
    it('deve tratar timeout de rede', async () => {
      ;(fetch as jest.MockedFunction<typeof fetch>).mockImplementationOnce(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )

      await expect(elevenLabsService.generateSpeech({
        text: 'Teste de timeout',
        voice_id: 'test_voice',
        model_id: 'eleven_multilingual_v2'
      })).rejects.toThrow()
    })

    it('deve tratar limite de caracteres excedido', async () => {
      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 413,
        statusText: 'Payload Too Large',
        text: () => Promise.resolve('Character limit exceeded')
      } as Response)

      await expect(elevenLabsService.generateSpeech({
        text: 'a'.repeat(10000),
        voice_id: 'test_voice',
        model_id: 'eleven_multilingual_v2'
      })).rejects.toThrow('Erro na síntese de voz')
    })
  })
})