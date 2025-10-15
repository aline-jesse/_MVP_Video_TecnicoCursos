/**
 * 🧪 Testes unitários para processamento PPTX real
 * FASE 1: PPTX Processing Real
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import fs from 'fs'
import path from 'path'
import { PPTXProcessor } from '../lib/pptx/pptx-processor'
import { PPTXTextParser } from '../lib/pptx/parsers/text-parser'
import { PPTXImageParser } from '../lib/pptx/parsers/image-parser'
import { PPTXLayoutParser } from '../lib/pptx/parsers/layout-parser'
import { S3StorageService } from '../lib/s3-storage'
import JSZip from 'jszip'

describe('PPTX Processing Real - Fase 1', () => {
  let testPptxBuffer: Buffer
  let testZip: JSZip

  beforeAll(async () => {
    // Carregar arquivo PPTX de teste
    const testPptxPath = path.join(__dirname, '..', '..', 'test-presentation.pptx')
    
    if (!fs.existsSync(testPptxPath)) {
      throw new Error(`Arquivo PPTX de teste não encontrado: ${testPptxPath}`)
    }

    testPptxBuffer = fs.readFileSync(testPptxPath)
    testZip = await JSZip.loadAsync(testPptxBuffer)
  })

  describe('PPTXProcessor', () => {
    it('deve validar arquivo PPTX corretamente', async () => {
      const validation = await PPTXProcessor.validatePPTXFile(testPptxBuffer)
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('deve rejeitar arquivo inválido', async () => {
      const invalidBuffer = Buffer.from('invalid content')
      const validation = await PPTXProcessor.validatePPTXFile(invalidBuffer)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    it('deve processar PPTX completo com sucesso', async () => {
      const result = await PPTXProcessor.processFile(
        testPptxBuffer,
        'test-project-123',
        {
          extractImages: false, // Desabilitar para teste rápido
          extractVideos: false,
          extractAudio: false,
          generateThumbnails: false,
          uploadToS3: false,
          preserveAnimations: false,
          extractNotes: true,
          detectLayouts: true,
          estimateDurations: true,
          extractHyperlinks: true
        }
      )

      expect(result.success).toBe(true)
      expect(result.metadata).toBeDefined()
      expect(result.metadata.totalSlides).toBe(5)
      expect(result.metadata.title).toBe('Apresentação de Teste - PPTX Processing')
      expect(result.metadata.author).toBe('Sistema de Teste')
      expect(result.slides).toHaveLength(5)
      expect(result.extractionStats).toBeDefined()
      expect(result.extractionStats.textBlocks).toBeGreaterThanOrEqual(0)
    })

    it('deve gerar timeline corretamente', async () => {
      const result = await PPTXProcessor.processFile(
        testPptxBuffer,
        'test-project-timeline',
        {
          extractImages: false,
          extractVideos: false,
          extractAudio: false,
          generateThumbnails: false,
          uploadToS3: false,
          preserveAnimations: false,
          extractNotes: true,
          detectLayouts: false,
          estimateDurations: true,
          extractHyperlinks: false
        }
      )

      expect(result.success).toBe(true)
      expect(result.timeline).toBeDefined()
      expect(result.timeline.scenes).toHaveLength(5)
      expect(result.timeline.totalDuration).toBeGreaterThan(0)
    })

    it('deve calcular estatísticas corretamente', async () => {
      const result = await PPTXProcessor.processFile(
        testPptxBuffer,
        'test-project-stats',
        {
          extractImages: false,
          extractVideos: false,
          extractAudio: false,
          generateThumbnails: false,
          uploadToS3: false,
          preserveAnimations: false,
          extractNotes: true,
          detectLayouts: true,
          estimateDurations: false,
          extractHyperlinks: false
        }
      )

      expect(result.success).toBe(true)
      expect(result.extractionStats.textBlocks).toBeGreaterThanOrEqual(0)
      expect(result.extractionStats.images).toBeGreaterThanOrEqual(0)
      expect(result.extractionStats.shapes).toBeGreaterThanOrEqual(0)
      expect(result.processingTime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('PPTXTextParser', () => {
    it('deve extrair texto do slide 1', async () => {
      const textResult = await PPTXTextParser.extractSlideText(testZip, 1)
      
      expect(textResult.success).toBe(true)
      expect(textResult.plainText).toContain('Apresentação de Teste')
      expect(textResult.wordCount).toBeGreaterThan(0)
      expect(textResult.characterCount).toBeGreaterThan(0)
    })

    it('deve extrair texto do slide 2 com bullets', async () => {
      const textResult = await PPTXTextParser.extractSlideText(testZip, 2)
      
      expect(textResult.success).toBe(true)
      expect(textResult.plainText).toBeDefined()
      expect(Array.isArray(textResult.bulletPoints)).toBe(true)
    })

    it('deve extrair texto de todos os slides', async () => {
      for (let i = 1; i <= 5; i++) {
        const textResult = await PPTXTextParser.extractSlideText(testZip, i)
        
        expect(textResult.success).toBe(true)
        expect(textResult.plainText.length).toBeGreaterThan(0)
      }
    })

    it('deve retornar erro para slide inexistente', async () => {
      const textResult = await PPTXTextParser.extractSlideText(testZip, 99)
      
      expect(textResult.success).toBe(false)
      expect(textResult.error).toContain('não encontrado')
    })

    it('deve extrair textboxes com formatação', async () => {
      const textResult = await PPTXTextParser.extractSlideText(testZip, 1)
      
      expect(textResult.success).toBe(true)
      expect(Array.isArray(textResult.textBoxes)).toBe(true)
      
      if (textResult.textBoxes.length > 0) {
        const firstTextBox = textResult.textBoxes[0]
        expect(firstTextBox.id).toBeDefined()
        expect(firstTextBox.text).toBeDefined()
        expect(firstTextBox.position).toBeDefined()
      }
    })
  })

  describe('PPTXImageParser', () => {
    it('deve processar extração de imagens sem erro', async () => {
      const imageResult = await PPTXImageParser.extractImages(
        testZip,
        'test-project-images',
        {
          uploadToS3: false,
          generateThumbnails: false
        }
      )

      expect(imageResult.success).toBe(true)
      expect(imageResult.totalImages).toBe(0) // PPTX de teste não tem imagens
      expect(imageResult.errors).toHaveLength(0)
    })

    it('deve gerar thumbnail corretamente', async () => {
      // Usar sharp para criar uma imagem válida para teste
      const sharp = require('sharp')
      const testImageBuffer = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 255, g: 0, b: 0 }
        }
      }).png().toBuffer()
      
      const thumbnail = await PPTXImageParser.generateThumbnail(testImageBuffer, 150, 150)
      
      expect(thumbnail).toBeDefined()
      expect(Buffer.isBuffer(thumbnail)).toBe(true)
    })
  })

  describe('PPTXLayoutParser', () => {
    it('deve detectar layout do slide 1', async () => {
      const layoutResult = await PPTXLayoutParser.detectSlideLayout(testZip, 1)
      
      expect(layoutResult.success).toBe(true)
      expect(layoutResult.layout).toBeDefined()
      expect(layoutResult.layout.name).toBeDefined()
      expect(layoutResult.layout.type).toBeDefined()
    })

    it('deve detectar layouts de todos os slides', async () => {
      for (let i = 1; i <= 5; i++) {
        const layoutResult = await PPTXLayoutParser.detectSlideLayout(testZip, i)
        
        expect(layoutResult.success).toBe(true)
        expect(layoutResult.layout.name).toBeDefined()
      }
    })

    it('deve extrair elementos do slide', async () => {
      const layoutResult = await PPTXLayoutParser.detectSlideLayout(testZip, 1)
      
      expect(layoutResult.success).toBe(true)
      expect(layoutResult.elements).toBeDefined()
      expect(Array.isArray(layoutResult.elements)).toBe(true)
    })

    it('deve retornar erro para slide inexistente', async () => {
      const layoutResult = await PPTXLayoutParser.detectSlideLayout(testZip, 99)
      
      expect(layoutResult.success).toBe(false)
      expect(layoutResult.error).toContain('não encontrado')
    })
  })

  describe('Integração completa', () => {
    it('deve processar PPTX com todas as opções habilitadas', async () => {
      const result = await PPTXProcessor.processFile(
        testPptxBuffer,
        'test-project-full',
        {
          extractImages: true,
          extractVideos: true,
          extractAudio: true,
          generateThumbnails: true,
          uploadToS3: false, // Desabilitar S3 para teste
          preserveAnimations: true,
          extractNotes: true,
          detectLayouts: true,
          estimateDurations: true,
          extractHyperlinks: true,
          maxImageSize: 1920,
          imageQuality: 85
        }
      )

      expect(result.success).toBe(true)
      expect(result.metadata.totalSlides).toBe(5)
      expect(result.slides).toHaveLength(5)
      expect(result.assets).toBeDefined()
      expect(result.timeline).toBeDefined()
      expect(result.extractionStats).toBeDefined()

      // Verificar que cada slide tem dados
      result.slides.forEach((slide, index) => {
        expect(slide.slideNumber).toBe(index + 1)
        expect(slide.layout).toBeDefined()
        expect(slide.content).toBeDefined()
      })
    })

    it('deve manter consistência entre metadados e slides', async () => {
      const result = await PPTXProcessor.processFile(
        testPptxBuffer,
        'test-project-consistency',
        {
          extractImages: false,
          extractVideos: false,
          extractAudio: false,
          generateThumbnails: false,
          uploadToS3: false,
          preserveAnimations: false,
          extractNotes: true,
          detectLayouts: true,
          estimateDurations: true,
          extractHyperlinks: false
        }
      )

      expect(result.success).toBe(true)
      expect(result.metadata.totalSlides).toBe(result.slides.length)
      expect(result.timeline.scenes.length).toBe(result.slides.length)
    })

    it('deve processar com callback de progresso', async () => {
      const progressUpdates: string[] = []
      
      const result = await PPTXProcessor.processFile(
        testPptxBuffer,
        'test-project-progress',
        {
          extractImages: false,
          extractVideos: false,
          extractAudio: false,
          generateThumbnails: false,
          uploadToS3: false,
          preserveAnimations: false,
          extractNotes: true,
          detectLayouts: true,
          estimateDurations: true,
          extractHyperlinks: false
        },
        (progress) => {
          progressUpdates.push(progress.stage)
        }
      )

      expect(result.success).toBe(true)
      expect(progressUpdates.length).toBeGreaterThan(0)
      expect(progressUpdates).toContain('initializing')
      expect(progressUpdates).toContain('extracting-metadata')
      expect(progressUpdates).toContain('processing-slides')
      expect(progressUpdates).toContain('finalizing')
    })
  })
})