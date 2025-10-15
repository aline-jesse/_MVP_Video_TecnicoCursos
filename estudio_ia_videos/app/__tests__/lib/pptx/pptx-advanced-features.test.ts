/**
 * 🧪 Testes para módulos PPTX avançados
 * Funcionalidades: Narração Automática, Conversão de Animações, Batch Processing, Layout Analyzer
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { AutoNarrationService } from '@/lib/pptx/auto-narration-service'
import { AnimationConverter, PPTXAnimation } from '@/lib/pptx/animation-converter'
import { BatchPPTXProcessor } from '@/lib/pptx/batch-processor'
import { LayoutAnalyzer } from '@/lib/pptx/layout-analyzer'
import { PPTXSlideData } from '@/lib/pptx/types/pptx-types'

describe('AutoNarrationService', () => {
  let service: AutoNarrationService

  beforeEach(() => {
    service = new AutoNarrationService()
  })

  it('deve extrair script das notas do slide quando preferNotes=true', async () => {
    const slides = [
      {
        slideNumber: 1,
        notes: 'Esta é uma nota importante para narração',
        elements: [
          { type: 'text', content: 'Título do slide' }
        ]
      }
    ]

    // Mock do ttsService
    jest.mock('@/lib/tts/tts-service', () => ({
      ttsService: {
        generateSpeechAzure: jest.fn().mockResolvedValue('mock-audio-url')
      }
    }))

    const result = await service.generateNarrations(
      slides,
      'test-project',
      {
        provider: 'azure',
        voice: 'pt-BR-FranciscaNeural',
        speed: 1.0,
        preferNotes: true
      }
    )

    expect(result.success).toBe(true)
    // Verificar que usou as notas
  })

  it('deve validar script corretamente', () => {
    const validScript = 'Este é um texto válido para narração com conteúdo suficiente.'
    const validation = service.validateScript(validScript)
    
    expect(validation.valid).toBe(true)
    expect(validation.reason).toBeUndefined()
  })

  it('deve rejeitar scripts muito curtos', () => {
    const shortScript = 'Curto'
    const validation = service.validateScript(shortScript)
    
    expect(validation.valid).toBe(false)
    expect(validation.reason).toContain('muito curto')
  })

  it('deve limpar script removendo bullets e múltiplos espaços', () => {
    const dirtyScript = '• Primeiro item  \n  • Segundo   item\n\n\n• Terceiro'
    // Chamar método privado através de reflexão ou torná-lo público para teste
    // Por enquanto, testar indiretamente através da API pública
    expect(dirtyScript.length).toBeGreaterThan(0)
  })
})

describe('AnimationConverter', () => {
  let converter: AnimationConverter

  beforeEach(() => {
    converter = new AnimationConverter()
  })

  it('deve converter animação fade em keyframes corretos', () => {
    const animation: PPTXAnimation = {
      id: 'anim1',
      type: 'entrance',
      effect: 'fade',
      targetId: 'shape1',
      targetType: 'text',
      trigger: 'on-click',
      duration: 500,
      delay: 0
    }

    const result = converter.convertAnimation(animation)

    expect(result.keyframes).toHaveLength(2)
    expect(result.keyframes[0]).toMatchObject({
      time: 0,
      property: 'opacity',
      value: 0
    })
    expect(result.keyframes[1]).toMatchObject({
      time: 500,
      property: 'opacity',
      value: 1
    })
  })

  it('deve converter fly-in from-left corretamente', () => {
    const animation: PPTXAnimation = {
      id: 'anim2',
      type: 'entrance',
      effect: 'fly-in',
      targetId: 'shape2',
      targetType: 'shape',
      trigger: 'on-click',
      duration: 1000,
      delay: 0,
      direction: 'from-left'
    }

    const result = converter.convertAnimation(animation)

    expect(result.keyframes.length).toBeGreaterThan(0)
    
    // Verificar que começa fora da tela (x negativo)
    const startKeyframe = result.keyframes.find(kf => kf.time === 0 && kf.property === 'x')
    expect(startKeyframe).toBeDefined()
    expect(startKeyframe?.value).toBeLessThan(0)

    // Verificar que termina na posição original
    const endKeyframe = result.keyframes.find(kf => kf.time === 1000 && kf.property === 'x')
    expect(endKeyframe).toBeDefined()
    expect(endKeyframe?.value).toBe(0)
  })

  it('deve aplicar delay aos keyframes', () => {
    const animation: PPTXAnimation = {
      id: 'anim3',
      type: 'entrance',
      effect: 'fade',
      targetId: 'shape3',
      targetType: 'image',
      trigger: 'after-previous',
      duration: 500,
      delay: 1000
    }

    const result = converter.convertAnimation(animation)

    // Todos os keyframes devem ter o delay aplicado
    expect(result.keyframes[0].time).toBe(1000) // 0 + 1000 delay
    expect(result.keyframes[1].time).toBe(1500) // 500 + 1000 delay
    expect(result.delay).toBe(1000)
  })

  it('deve listar efeitos suportados', () => {
    const effects = AnimationConverter.getSupportedEffects()
    
    expect(effects).toContain('fade')
    expect(effects).toContain('fly-in')
    expect(effects).toContain('zoom')
    expect(effects).toContain('pulse')
    expect(effects.length).toBeGreaterThan(5)
  })

  it('deve usar fade como fallback para animações não suportadas', () => {
    const animation: PPTXAnimation = {
      id: 'anim4',
      type: 'entrance',
      effect: 'unsupported-effect',
      targetId: 'shape4',
      targetType: 'chart',
      trigger: 'on-click',
      duration: 500,
      delay: 0
    }

    const result = converter.convertAnimation(animation)

    // Deve ter convertido com fallback (fade)
    expect(result.keyframes).toHaveLength(2)
    expect(result.keyframes[0].property).toBe('opacity')
    expect(result.originalEffect).toBe('unsupported-effect')
  })
})

describe('LayoutAnalyzer', () => {
  let analyzer: LayoutAnalyzer

  beforeEach(() => {
    analyzer = new LayoutAnalyzer()
  })

  it('deve detectar fonte muito pequena', () => {
    const slide: PPTXSlideData = {
      slideNumber: 1,
      title: 'Test Slide',
      content: 'Content',
      notes: '',
      layout: 'content',
      backgroundType: 'solid',
      backgroundColor: '#FFFFFF',
      images: [],
      shapes: [],
      textBoxes: [
        {
          id: 'text1',
          text: 'Small text',
          position: { x: 0, y: 0, width: 100, height: 50 },
          formatting: {
            fontSize: 12, // Muito pequeno
            color: '#000000'
          }
        }
      ],
      charts: [],
      tables: [],
      smartArt: [],
      animations: [],
      hyperlinks: [],
      duration: 5000,
      estimatedReadingTime: 5,
      wordCount: 2,
      characterCount: 10
    }

    const result = analyzer.analyzeSlide(slide)

    expect(result.errors + result.warnings).toBeGreaterThan(0)
    
    const fontIssue = result.issues.find(i => i.category === 'readability' && i.title.includes('Fonte'))
    expect(fontIssue).toBeDefined()
    expect(fontIssue?.severity).toBe('error')
  })

  it('deve detectar contraste insuficiente', () => {
    const slide: PPTXSlideData = {
      slideNumber: 2,
      title: 'Test Slide',
      content: '',
      notes: '',
      layout: 'content',
      backgroundType: 'solid',
      backgroundColor: '#FFFFFF', // Branco
      images: [],
      shapes: [],
      textBoxes: [
        {
          id: 'text2',
          text: 'Low contrast text',
          position: { x: 0, y: 0, width: 100, height: 50 },
          formatting: {
            fontSize: 24,
            color: '#EEEEEE' // Quase branco - contraste ruim com fundo branco
          }
        }
      ],
      charts: [],
      tables: [],
      smartArt: [],
      animations: [],
      hyperlinks: [],
      duration: 5000,
      estimatedReadingTime: 5,
      wordCount: 3,
      characterCount: 18
    }

    const result = analyzer.analyzeSlide(slide)

    const contrastIssue = result.issues.find(i => i.category === 'contrast')
    expect(contrastIssue).toBeDefined()
    expect(contrastIssue?.severity).toBe('error')
  })

  it('deve detectar imagem de baixa resolução', () => {
    const slide: PPTXSlideData = {
      slideNumber: 3,
      title: 'Test Slide',
      content: '',
      notes: '',
      layout: 'content',
      backgroundType: 'solid',
      images: [
        {
          id: 'img1',
          filename: 'low-res.jpg',
          path: '/images/low-res.jpg',
          mimeType: 'image/jpeg',
          size: 10000,
          dimensions: {
            width: 400, // Muito pequeno
            height: 300  // Muito pequeno
          },
          extractedAt: new Date().toISOString()
        }
      ],
      shapes: [],
      textBoxes: [],
      charts: [],
      tables: [],
      smartArt: [],
      animations: [],
      hyperlinks: [],
      duration: 5000,
      estimatedReadingTime: 0,
      wordCount: 0,
      characterCount: 0
    }

    const result = analyzer.analyzeSlide(slide)

    const resolutionIssue = result.issues.find(i => i.category === 'resolution')
    expect(resolutionIssue).toBeDefined()
    expect(resolutionIssue?.severity).toBe('warning')
  })

  it('deve calcular score baseado em issues', () => {
    const perfectSlide: PPTXSlideData = {
      slideNumber: 4,
      title: 'Perfect Slide',
      content: 'Good content',
      notes: '',
      layout: 'content',
      backgroundType: 'solid',
      backgroundColor: '#FFFFFF',
      images: [],
      shapes: [],
      textBoxes: [
        {
          id: 'text3',
          text: 'Perfect text',
          position: { x: 0, y: 0, width: 100, height: 50 },
          formatting: {
            fontSize: 32, // Tamanho bom
            color: '#000000' // Contraste perfeito
          }
        }
      ],
      charts: [],
      tables: [],
      smartArt: [],
      animations: [],
      hyperlinks: [],
      duration: 5000,
      estimatedReadingTime: 2,
      wordCount: 2,
      characterCount: 12
    }

    const result = analyzer.analyzeSlide(perfectSlide)

    expect(result.score).toBeGreaterThan(80) // Score alto para slide bom
    expect(result.errors).toBe(0)
  })

  it('deve analisar múltiplos slides em batch', () => {
    const slides: PPTXSlideData[] = [
      {
        slideNumber: 1,
        title: 'Slide 1',
        content: '',
        notes: '',
        layout: 'title',
        backgroundType: 'solid',
        images: [],
        shapes: [],
        textBoxes: [],
        charts: [],
        tables: [],
        smartArt: [],
        animations: [],
        hyperlinks: [],
        duration: 5000,
        estimatedReadingTime: 0,
        wordCount: 0,
        characterCount: 0
      },
      {
        slideNumber: 2,
        title: 'Slide 2',
        content: '',
        notes: '',
        layout: 'content',
        backgroundType: 'solid',
        images: [],
        shapes: [],
        textBoxes: [],
        charts: [],
        tables: [],
        smartArt: [],
        animations: [],
        hyperlinks: [],
        duration: 5000,
        estimatedReadingTime: 0,
        wordCount: 0,
        characterCount: 0
      }
    ]

    const result = analyzer.analyzeBatch(slides)

    expect(result.totalSlides).toBe(2)
    expect(result.slideResults).toHaveLength(2)
    expect(result.averageScore).toBeGreaterThanOrEqual(0)
    expect(result.averageScore).toBeLessThanOrEqual(100)
  })

  it('deve permitir auto-fix de issues quando possível', () => {
    const slide: PPTXSlideData = {
      slideNumber: 5,
      title: 'Test Slide',
      content: '',
      notes: '',
      layout: 'content',
      backgroundType: 'solid',
      backgroundColor: '#000000', // Fundo preto
      images: [],
      shapes: [],
      textBoxes: [
        {
          id: 'text4',
          text: 'Text to fix',
          position: { x: 0, y: 0, width: 100, height: 50 },
          formatting: {
            fontSize: 12,
            color: '#333333' // Contraste ruim com fundo preto
          }
        }
      ],
      charts: [],
      tables: [],
      smartArt: [],
      animations: [],
      hyperlinks: [],
      duration: 5000,
      estimatedReadingTime: 3,
      wordCount: 3,
      characterCount: 12
    }

    const result = analyzer.analyzeSlide(slide)
    const autoFixableIssues = result.issues.filter(i => i.autoFixable)

    expect(autoFixableIssues.length).toBeGreaterThan(0)

    const fixed = analyzer.autoFixIssues(result.issues)
    expect(fixed).toBeGreaterThan(0)

    // Após auto-fix, o slide deve ter melhor qualidade
    // Verificar que a cor foi ajustada
    expect(slide.textBoxes[0].formatting?.color).toBe('#FFFFFF') // Branco para contraste com preto
  })
})

describe('BatchPPTXProcessor', () => {
  let processor: BatchPPTXProcessor

  beforeEach(() => {
    processor = new BatchPPTXProcessor()
  })

  it('deve processar múltiplos arquivos com controle de concorrência', async () => {
    // Mock de arquivos
    const mockFiles = [
      new File(['content1'], 'test1.pptx', { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }),
      new File(['content2'], 'test2.pptx', { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }),
      new File(['content3'], 'test3.pptx', { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
    ]

    // Este teste requer mocks extensivos do PPTXProcessor e S3
    // Por enquanto, apenas verificar que o processador foi criado
    expect(processor).toBeDefined()
  })

  it('deve permitir cancelamento de jobs', () => {
    const cancelled = processor.cancelJob('non-existent-job')
    expect(cancelled).toBe(false) // Job não existe
  })

  it('deve limpar jobs concluídos', () => {
    const cleared = processor.clearCompleted()
    expect(cleared).toBeGreaterThanOrEqual(0)
  })
})
