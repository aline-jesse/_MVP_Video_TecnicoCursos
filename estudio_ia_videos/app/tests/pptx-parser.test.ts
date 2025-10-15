/**
 * Testes Funcionais para PPTXParser
 * Implementação completa de testes unitários e de integração
 */

import { PPTXParser } from '@/lib/pptx/parser'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

describe('PPTXParser', () => {
  let parser: PPTXParser

  beforeEach(() => {
    parser = new PPTXParser()
  })

  describe('Validação de Arquivo', () => {
    test('deve validar arquivo PPTX válido', async () => {
      // Criar um buffer de teste simulando um PPTX válido
      const mockValidPPTX = Buffer.from('PK\x03\x04') // Assinatura ZIP
      
      // Mock JSZip para simular estrutura válida
      const mockZip = {
        file: jest.fn((filename: string) => {
          const requiredFiles = ['[Content_Types].xml', 'ppt/presentation.xml']
          return requiredFiles.includes(filename) ? {} : null
        })
      }

      // Mock JSZip.loadAsync
      const JSZip = require('jszip')
      jest.spyOn(JSZip, 'loadAsync').mockResolvedValue(mockZip)

      const isValid = await PPTXParser.validatePPTX(mockValidPPTX)
      expect(isValid).toBe(true)
    })

    test('deve rejeitar arquivo PPTX inválido', async () => {
      const mockInvalidPPTX = Buffer.from('invalid data')
      
      const mockZip = {
        file: jest.fn(() => null)
      }

      const JSZip = require('jszip')
      jest.spyOn(JSZip, 'loadAsync').mockResolvedValue(mockZip)

      const isValid = await PPTXParser.validatePPTX(mockInvalidPPTX)
      expect(isValid).toBe(false)
    })

    test('deve rejeitar buffer corrompido', async () => {
      const corruptedBuffer = Buffer.from('corrupted')
      
      const JSZip = require('jszip')
      jest.spyOn(JSZip, 'loadAsync').mockRejectedValue(new Error('Invalid ZIP'))

      const isValid = await PPTXParser.validatePPTX(corruptedBuffer)
      expect(isValid).toBe(false)
    })
  })

  describe('Extração de Metadados', () => {
    test('deve extrair metadados básicos', async () => {
      const mockCorePropsXml = `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties">
          <dc:title>Apresentação de Teste</dc:title>
          <dc:creator>João Silva</dc:creator>
          <dc:subject>Teste de Parser</dc:subject>
          <dcterms:created>2024-01-15T10:30:00Z</dcterms:created>
          <dcterms:modified>2024-01-15T15:45:00Z</dcterms:modified>
        </cp:coreProperties>
      `

      const mockAppPropsXml = `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
          <Slides>5</Slides>
        </Properties>
      `

      const mockZip = {
        file: jest.fn((filename: string) => {
          if (filename === 'docProps/core.xml') {
            return { async: jest.fn().mockResolvedValue(mockCorePropsXml) }
          }
          if (filename === 'docProps/app.xml') {
            return { async: jest.fn().mockResolvedValue(mockAppPropsXml) }
          }
          if (filename === '[Content_Types].xml' || filename === 'ppt/presentation.xml') {
            return {}
          }
          return null
        }),
        files: {}
      }

      const JSZip = require('jszip')
      jest.spyOn(JSZip, 'loadAsync').mockResolvedValue(mockZip)

      const mockBuffer = Buffer.from('mock pptx data')
      const result = await parser.parsePPTX(mockBuffer)

      expect(result.metadata.title).toBe('Apresentação de Teste')
      expect(result.metadata.author).toBe('João Silva')
      expect(result.metadata.subject).toBe('Teste de Parser')
      expect(result.metadata.slideCount).toBe(5)
      expect(result.metadata.created).toBeInstanceOf(Date)
      expect(result.metadata.modified).toBeInstanceOf(Date)
    })

    test('deve usar valores padrão quando metadados estão ausentes', async () => {
      const mockZip = {
        file: jest.fn((filename: string) => {
          if (filename === '[Content_Types].xml' || filename === 'ppt/presentation.xml') {
            return {}
          }
          return null
        }),
        files: {}
      }

      const JSZip = require('jszip')
      jest.spyOn(JSZip, 'loadAsync').mockResolvedValue(mockZip)

      const mockBuffer = Buffer.from('mock pptx data')
      const result = await parser.parsePPTX(mockBuffer)

      expect(result.metadata.title).toBe('Untitled Presentation')
      expect(result.metadata.author).toBe('Unknown')
      expect(result.metadata.subject).toBe('')
      expect(result.metadata.slideCount).toBe(0)
    })
  })

  describe('Extração de Slides', () => {
    test('deve extrair conteúdo de slides corretamente', async () => {
      const mockSlideXml = `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
          <p:cSld>
            <p:spTree>
              <p:sp>
                <p:txBody>
                  <a:p>
                    <a:r>
                      <a:t>Título do Slide</a:t>
                    </a:r>
                  </a:p>
                </p:txBody>
              </p:sp>
              <p:sp>
                <p:txBody>
                  <a:p>
                    <a:r>
                      <a:t>Conteúdo do slide</a:t>
                    </a:r>
                  </a:p>
                  <a:p>
                    <a:r>
                      <a:t>Segunda linha</a:t>
                    </a:r>
                  </a:p>
                </p:txBody>
              </p:sp>
            </p:spTree>
          </p:cSld>
        </p:sld>
      `

      const mockZip = {
        file: jest.fn((filename: string) => {
          if (filename === '[Content_Types].xml' || filename === 'ppt/presentation.xml') {
            return {}
          }
          if (filename === 'ppt/slides/slide1.xml') {
            return { async: jest.fn().mockResolvedValue(mockSlideXml) }
          }
          return null
        }),
        files: {
          'ppt/slides/slide1.xml': {}
        }
      }

      const JSZip = require('jszip')
      jest.spyOn(JSZip, 'loadAsync').mockResolvedValue(mockZip)

      const mockBuffer = Buffer.from('mock pptx data')
      const result = await parser.parsePPTX(mockBuffer)

      expect(result.slides).toHaveLength(1)
      expect(result.slides[0].title).toBe('Título do Slide')
      expect(result.slides[0].content).toContain('Conteúdo do slide Segunda linha')
      expect(result.slides[0].order).toBe(1)
    })

    test('deve extrair múltiplos slides em ordem correta', async () => {
      const createMockSlideXml = (title: string) => `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
          <p:cSld>
            <p:spTree>
              <p:sp>
                <p:txBody>
                  <a:p>
                    <a:r>
                      <a:t>${title}</a:t>
                    </a:r>
                  </a:p>
                </p:txBody>
              </p:sp>
            </p:spTree>
          </p:cSld>
        </p:sld>
      `

      const mockZip = {
        file: jest.fn((filename: string) => {
          if (filename === '[Content_Types].xml' || filename === 'ppt/presentation.xml') {
            return {}
          }
          if (filename === 'ppt/slides/slide1.xml') {
            return { async: jest.fn().mockResolvedValue(createMockSlideXml('Slide 1')) }
          }
          if (filename === 'ppt/slides/slide3.xml') {
            return { async: jest.fn().mockResolvedValue(createMockSlideXml('Slide 3')) }
          }
          if (filename === 'ppt/slides/slide2.xml') {
            return { async: jest.fn().mockResolvedValue(createMockSlideXml('Slide 2')) }
          }
          return null
        }),
        files: {
          'ppt/slides/slide3.xml': {},
          'ppt/slides/slide1.xml': {},
          'ppt/slides/slide2.xml': {}
        }
      }

      const JSZip = require('jszip')
      jest.spyOn(JSZip, 'loadAsync').mockResolvedValue(mockZip)

      const mockBuffer = Buffer.from('mock pptx data')
      const result = await parser.parsePPTX(mockBuffer)

      expect(result.slides).toHaveLength(3)
      expect(result.slides[0].title).toBe('Slide 1')
      expect(result.slides[1].title).toBe('Slide 2')
      expect(result.slides[2].title).toBe('Slide 3')
    })
  })

  describe('Extração de Imagens', () => {
    test('deve extrair imagens dos slides', async () => {
      const mockSlideXml = `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
          <p:cSld>
            <p:spTree>
              <p:pic>
                <p:blipFill>
                  <a:blip r:embed="rId2"/>
                </p:blipFill>
              </p:pic>
            </p:spTree>
          </p:cSld>
        </p:sld>
      `

      const mockRelsXml = `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/>
        </Relationships>
      `

      const mockImageBuffer = Buffer.from('fake image data')

      const mockZip = {
        file: jest.fn((filename: string) => {
          if (filename === '[Content_Types].xml' || filename === 'ppt/presentation.xml') {
            return {}
          }
          if (filename === 'ppt/slides/slide1.xml') {
            return { async: jest.fn().mockResolvedValue(mockSlideXml) }
          }
          if (filename.includes('_rels') && filename.endsWith('.xml.rels')) {
            return { async: jest.fn().mockResolvedValue(mockRelsXml) }
          }
          if (filename === 'ppt/media/image1.png') {
            return { async: jest.fn().mockResolvedValue(mockImageBuffer) }
          }
          return null
        }),
        files: {
          'ppt/slides/slide1.xml': {},
          'ppt/slides/_rels/slide1.xml.rels': {}
        }
      }

      const JSZip = require('jszip')
      jest.spyOn(JSZip, 'loadAsync').mockResolvedValue(mockZip)

      const mockBuffer = Buffer.from('mock pptx data')
      const result = await parser.parsePPTX(mockBuffer)

      expect(result.slides).toHaveLength(1)
      expect(result.slides[0].images).toHaveLength(1)
      expect(result.slides[0].images[0].id).toBe('rId2')
      expect(result.slides[0].images[0].name).toBe('image1.png')
      expect(result.slides[0].images[0].extension).toBe('png')
      expect(result.slides[0].images[0].data).toEqual(mockImageBuffer)
    })
  })

  describe('Extração de Notas', () => {
    test('deve extrair notas do apresentador', async () => {
      const mockSlideXml = `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
          <p:cSld>
            <p:spTree>
              <p:sp>
                <p:txBody>
                  <a:p>
                    <a:r>
                      <a:t>Título</a:t>
                    </a:r>
                  </a:p>
                </p:txBody>
              </p:sp>
            </p:spTree>
          </p:cSld>
        </p:sld>
      `

      const mockNotesXml = `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <p:notes xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
          <p:cSld>
            <p:spTree>
              <p:sp>
                <p:txBody>
                  <a:p>
                    <a:r>
                      <a:t>Estas são as notas do apresentador para este slide.</a:t>
                    </a:r>
                  </a:p>
                </p:txBody>
              </p:sp>
            </p:spTree>
          </p:cSld>
        </p:notes>
      `

      const mockZip = {
        file: jest.fn((filename: string) => {
          if (filename === '[Content_Types].xml' || filename === 'ppt/presentation.xml') {
            return {}
          }
          if (filename === 'ppt/slides/slide1.xml') {
            return { async: jest.fn().mockResolvedValue(mockSlideXml) }
          }
          if (filename === 'ppt/notesSlides/notesSlide1.xml') {
            return { async: jest.fn().mockResolvedValue(mockNotesXml) }
          }
          return null
        }),
        files: {
          'ppt/slides/slide1.xml': {}
        }
      }

      const JSZip = require('jszip')
      jest.spyOn(JSZip, 'loadAsync').mockResolvedValue(mockZip)

      const mockBuffer = Buffer.from('mock pptx data')
      const result = await parser.parsePPTX(mockBuffer)

      expect(result.slides).toHaveLength(1)
      expect(result.slides[0].notes).toBe('Estas são as notas do apresentador para este slide.')
    })
  })

  describe('Tratamento de Erros', () => {
    test('deve lançar erro para arquivo inválido', async () => {
      const JSZip = require('jszip')
      jest.spyOn(JSZip, 'loadAsync').mockRejectedValue(new Error('Invalid ZIP'))

      const invalidBuffer = Buffer.from('invalid data')
      
      await expect(parser.parsePPTX(invalidBuffer)).rejects.toThrow('Failed to parse PPTX')
    })

    test('deve continuar processamento mesmo com slides corrompidos', async () => {
      const mockZip = {
        file: jest.fn((filename: string) => {
          if (filename === '[Content_Types].xml' || filename === 'ppt/presentation.xml') {
            return {}
          }
          if (filename === 'ppt/slides/slide1.xml') {
            return { async: jest.fn().mockRejectedValue(new Error('Corrupted slide')) }
          }
          return null
        }),
        files: {
          'ppt/slides/slide1.xml': {}
        }
      }

      const JSZip = require('jszip')
      jest.spyOn(JSZip, 'loadAsync').mockResolvedValue(mockZip)

      const mockBuffer = Buffer.from('mock pptx data')
      
      // Deve processar sem falhar, mesmo com slide corrompido
      const result = await parser.parsePPTX(mockBuffer)
      expect(result.slides).toHaveLength(0) // Slide corrompido é ignorado
    })
  })

  describe('Performance', () => {
    test('deve processar arquivo grande em tempo razoável', async () => {
      const startTime = Date.now()
      
      // Simular arquivo com muitos slides
      const mockZip = {
        file: jest.fn((filename: string) => {
          if (filename === '[Content_Types].xml' || filename === 'ppt/presentation.xml') {
            return {}
          }
          return null
        }),
        files: {}
      }

      // Adicionar 100 slides simulados
      for (let i = 1; i <= 100; i++) {
        mockZip.files[`ppt/slides/slide${i}.xml`] = {}
        mockZip.file = jest.fn((filename: string) => {
          if (filename === '[Content_Types].xml' || filename === 'ppt/presentation.xml') {
            return {}
          }
          if (filename.startsWith('ppt/slides/slide') && filename.endsWith('.xml')) {
            return { 
              async: jest.fn().mockResolvedValue(`
                <p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
                  <p:cSld>
                    <p:spTree>
                      <p:sp>
                        <p:txBody>
                          <a:p>
                            <a:r>
                              <a:t>Slide ${filename.match(/slide(\d+)\.xml/)?.[1]}</a:t>
                            </a:r>
                          </a:p>
                        </p:txBody>
                      </p:sp>
                    </p:spTree>
                  </p:cSld>
                </p:sld>
              `)
            }
          }
          return null
        })
      }

      const JSZip = require('jszip')
      jest.spyOn(JSZip, 'loadAsync').mockResolvedValue(mockZip)

      const mockBuffer = Buffer.from('mock large pptx data')
      const result = await parser.parsePPTX(mockBuffer)

      const endTime = Date.now()
      const processingTime = endTime - startTime

      expect(result.slides).toHaveLength(100)
      expect(processingTime).toBeLessThan(5000) // Deve processar em menos de 5 segundos
    })
  })
})

// Testes de integração com arquivos reais (se disponíveis)
describe('PPTXParser - Testes de Integração', () => {
  test('deve processar arquivo PPTX real se disponível', async () => {
    const testFilePath = join(process.cwd(), 'test-files', 'sample.pptx')
    
    if (existsSync(testFilePath)) {
      const parser = new PPTXParser()
      const buffer = readFileSync(testFilePath)
      
      const result = await parser.parsePPTX(buffer)
      
      expect(result.metadata).toBeDefined()
      expect(result.slides).toBeDefined()
      expect(Array.isArray(result.slides)).toBe(true)
      
      if (result.slides.length > 0) {
        expect(result.slides[0]).toHaveProperty('id')
        expect(result.slides[0]).toHaveProperty('title')
        expect(result.slides[0]).toHaveProperty('content')
        expect(result.slides[0]).toHaveProperty('order')
      }
    } else {
      console.log('Arquivo de teste sample.pptx não encontrado, pulando teste de integração')
    }
  })
})