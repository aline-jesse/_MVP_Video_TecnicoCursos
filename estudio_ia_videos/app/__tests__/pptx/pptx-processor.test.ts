/**
 * 🧪 Testes do Processador PPTX
 * Testes automatizados para validar todas as funcionalidades do processador PPTX
 */

import { PPTXProcessor } from '../../lib/pptx/pptx-processor';
import { PPTXValidator } from '../../lib/pptx/validation/pptx-validator';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

describe('PPTXProcessor - Testes Funcionais', () => {
  let processor: PPTXProcessor;
  let validator: PPTXValidator;

  beforeEach(() => {
    processor = new PPTXProcessor();
    validator = new PPTXValidator();
  });

  describe('Validação de Arquivo', () => {
    test('deve validar um arquivo PPTX válido', async () => {
      const buffer = readFileSync(join(__dirname, 'fixtures/valid.pptx'));
      const result = await validator.validatePPTX(buffer);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('deve rejeitar um arquivo PPTX inválido', async () => {
      const buffer = Buffer.from('arquivo inválido');
      const result = await validator.validatePPTX(buffer);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('INVALID_ZIP');
    });

    test('deve validar o tamanho máximo do arquivo', async () => {
      const largeBuffer = Buffer.alloc(51 * 1024 * 1024); // 51MB
      const result = await validator.validatePPTX(largeBuffer);
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('FILE_TOO_LARGE');
    });
  });

  describe('Extração de Metadados', () => {
    test('deve extrair metadados básicos do PPTX', async () => {
      const buffer = readFileSync(join(__dirname, 'fixtures/with-metadata.pptx'));
      const { metadata } = await processor.parse(buffer);
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.author).toBeDefined();
      expect(metadata.totalSlides).toBeGreaterThan(0);
    });

    test('deve lidar com metadados ausentes', async () => {
      const buffer = readFileSync(join(__dirname, 'fixtures/no-metadata.pptx'));
      const { metadata } = await processor.parse(buffer);
      
      expect(metadata).toBeDefined();
      expect(metadata.title).toBe('');
      expect(metadata.author).toBe('');
      expect(metadata.totalSlides).toBe(0);
    });
  });

  describe('Processamento de Slides', () => {
    test('deve processar todos os slides corretamente', async () => {
      const buffer = readFileSync(join(__dirname, 'fixtures/multi-slide.pptx'));
      const { slides } = await processor.parse(buffer);
      
      expect(slides).toHaveLength(3); // Arquivo de teste tem 3 slides
      expect(slides[0].elements).toBeDefined();
      expect(slides[0].background).toBeDefined();
    });

    test('deve extrair elementos de texto', async () => {
      const buffer = readFileSync(join(__dirname, 'fixtures/text-content.pptx'));
      const { slides } = await processor.parse(buffer);
      
      const textElements = slides[0].elements.filter(el => el.type === 'text');
      expect(textElements).toHaveLength(2);
      expect(textElements[0].content).toBeDefined();
      expect(textElements[0].style).toBeDefined();
    });

    test('deve processar imagens corretamente', async () => {
      const buffer = readFileSync(join(__dirname, 'fixtures/with-images.pptx'));
      const { slides } = await processor.parse(buffer);
      
      const imageElements = slides[0].elements.filter(el => el.type === 'image');
      expect(imageElements).toHaveLength(1);
      expect(imageElements[0].properties.src).toBeDefined();
    });
  });

  describe('Processamento de Layouts', () => {
    test('deve detectar layout do slide corretamente', async () => {
      const buffer = readFileSync(join(__dirname, 'fixtures/various-layouts.pptx'));
      const { slides } = await processor.parse(buffer);
      
      expect(slides[0].layout).toBe('title');
      expect(slides[1].layout).toBe('content');
      expect(slides[2].layout).toBe('two-content');
    });

    test('deve processar elementos de layout', async () => {
      const buffer = readFileSync(join(__dirname, 'fixtures/complex-layout.pptx'));
      const { slides } = await processor.parse(buffer);
      
      const layoutElements = slides[0].elements;
      expect(layoutElements).toHaveLength(4);
      expect(layoutElements[0].position).toBeDefined();
      expect(layoutElements[0].position.x).toBeDefined();
      expect(layoutElements[0].position.y).toBeDefined();
    });
  });

  describe('Processamento de Notas', () => {
    test('deve extrair notas do apresentador', async () => {
      const buffer = readFileSync(join(__dirname, 'fixtures/with-notes.pptx'));
      const { slides } = await processor.parse(buffer);
      
      expect(slides[0].notes).toBeDefined();
      expect(typeof slides[0].notes).toBe('string');
      expect(slides[0].notes.length).toBeGreaterThan(0);
    });

    test('deve lidar com slides sem notas', async () => {
      const buffer = readFileSync(join(__dirname, 'fixtures/no-notes.pptx'));
      const { slides } = await processor.parse(buffer);
      
      expect(slides[0].notes).toBe('');
    });
  });

  describe('Tratamento de Erros', () => {
    test('deve lidar com slides corrompidos', async () => {
      const buffer = readFileSync(join(__dirname, 'fixtures/corrupted-slide.pptx'));
      
      await expect(processor.parse(buffer)).rejects.toThrow();
    });

    test('deve lidar com imagens ausentes', async () => {
      const buffer = readFileSync(join(__dirname, 'fixtures/missing-images.pptx'));
      const { slides } = await processor.parse(buffer);
      
      const imageElements = slides[0].elements.filter(el => el.type === 'image');
      expect(imageElements[0].properties.src).toBe('');
    });

    test('deve lidar com XMLs malformados', async () => {
      const buffer = readFileSync(join(__dirname, 'fixtures/malformed-xml.pptx'));
      
      await expect(processor.parse(buffer)).rejects.toThrow('XML inválido');
    });
  });

  describe('Performance', () => {
    test('deve processar arquivos grandes em tempo razoável', async () => {
      const buffer = readFileSync(join(__dirname, 'fixtures/large-file.pptx'));
      const startTime = Date.now();
      
      await processor.parse(buffer);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(5000); // Menos de 5 segundos
    });

    test('deve otimizar uso de memória', async () => {
      const buffer = readFileSync(join(__dirname, 'fixtures/memory-test.pptx'));
      const initialMemory = process.memoryUsage().heapUsed;
      
      await processor.parse(buffer);
      const finalMemory = process.memoryUsage().heapUsed;
      
      // Não deve aumentar mais que 100MB
      expect(finalMemory - initialMemory).toBeLessThan(100 * 1024 * 1024);
    });
  });
});

describe('PPTXProcessor - Testes de Integração', () => {
  let processor: PPTXProcessor;

  beforeEach(() => {
    processor = new PPTXProcessor();
  });

  test('deve integrar com sistema de armazenamento', async () => {
    const buffer = readFileSync(join(__dirname, 'fixtures/integration-test.pptx'));
    const { slides } = await processor.parse(buffer);
    
    // Verificar se as imagens foram salvas
    const imageElements = slides[0].elements.filter(el => el.type === 'image');
    expect(imageElements[0].properties.src).toMatch(/^https:\/\//);
  });

  test('deve gerar IDs únicos para elementos', async () => {
    const buffer = readFileSync(join(__dirname, 'fixtures/element-ids.pptx'));
    const { slides } = await processor.parse(buffer);
    
    const ids = slides[0].elements.map(el => el.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('deve preservar ordem dos slides', async () => {
    const buffer = readFileSync(join(__dirname, 'fixtures/slide-order.pptx'));
    const { slides } = await processor.parse(buffer);
    
    expect(slides[0].number).toBe(1);
    expect(slides[1].number).toBe(2);
    expect(slides[2].number).toBe(3);
  });
});

describe('PPTXProcessor - Testes de Regressão', () => {
  let processor: PPTXProcessor;

  beforeEach(() => {
    processor = new PPTXProcessor();
  });

  test('deve manter compatibilidade com versões antigas do PPTX', async () => {
    const buffer = readFileSync(join(__dirname, 'fixtures/old-version.pptx'));
    await expect(processor.parse(buffer)).resolves.toBeDefined();
  });

  test('deve processar caracteres especiais corretamente', async () => {
    const buffer = readFileSync(join(__dirname, 'fixtures/special-chars.pptx'));
    const { slides } = await processor.parse(buffer);
    
    expect(slides[0].elements[0].content).toMatch(/[áéíóúçãõ]/);
  });
});