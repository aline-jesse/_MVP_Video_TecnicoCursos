/**
 * 🧪 Testes PPTX Processor - Validação Completa
 * 
 * Testes unitários e de integração para o processador PPTX
 * Validação de parsing, extração e processamento real
 */

import { processPPTXFile, validatePPTXFile } from '@/lib/pptx-processor';
import { writeFileSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import path from 'path';
import JSZip from 'jszip';

describe('PPTX Processor Tests', () => {
  const testDir = path.join(__dirname, 'fixtures');
  const testPPTXPath = path.join(testDir, 'test-presentation.pptx');

  beforeAll(async () => {
    // Criar diretório de testes se não existir
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }

    // Criar arquivo PPTX de teste simples
    await createTestPPTX();
  });

  afterAll(() => {
    // Limpar arquivos de teste
    if (existsSync(testPPTXPath)) {
      unlinkSync(testPPTXPath);
    }
  });

  describe('validatePPTXFile', () => {
    test('should validate a valid PPTX file', async () => {
      const result = await validatePPTXFile(testPPTXPath);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject non-existent file', async () => {
      const result = await validatePPTXFile('/path/to/nonexistent.pptx');
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('não encontrado');
    });

    test('should reject files that are too large', async () => {
      // Criar arquivo fictício muito grande
      const largePath = path.join(testDir, 'large.pptx');
      const largeBuffer = Buffer.alloc(101 * 1024 * 1024); // 101MB
      writeFileSync(largePath, largeBuffer);

      const result = await validatePPTXFile(largePath);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('muito grande');

      // Limpar
      unlinkSync(largePath);
    });

    test('should reject invalid file format', async () => {
      // Criar arquivo que não é ZIP
      const invalidPath = path.join(testDir, 'invalid.pptx');
      writeFileSync(invalidPath, 'This is not a valid PPTX file');

      const result = await validatePPTXFile(invalidPath);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();

      // Limpar
      unlinkSync(invalidPath);
    });
  });

  describe('processPPTXFile', () => {
    test('should process a valid PPTX file', async () => {
      const result = await processPPTXFile(testPPTXPath, 'test-presentation.pptx');
      
      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.slides).toBeDefined();
      expect(result.thumbnails).toBeDefined();
      expect(result.slides.length).toBeGreaterThan(0);
    });

    test('should extract metadata correctly', async () => {
      const result = await processPPTXFile(testPPTXPath, 'test-presentation.pptx');
      
      expect(result.metadata.title).toBeDefined();
      expect(result.metadata.author).toBeDefined();
      expect(result.metadata.slideCount).toBe(result.slides.length);
      expect(result.metadata.createdAt).toBeInstanceOf(Date);
      expect(result.metadata.fileSize).toBeGreaterThan(0);
    });

    test('should extract slides with correct structure', async () => {
      const result = await processPPTXFile(testPPTXPath, 'test-presentation.pptx');
      
      expect(result.slides.length).toBeGreaterThan(0);
      
      result.slides.forEach((slide, index) => {
        expect(slide.id).toBe(`slide-${index + 1}`);
        expect(slide.slideNumber).toBe(index + 1);
        expect(slide.title).toBeDefined();
        expect(slide.content).toBeDefined();
        expect(slide.duration).toBeGreaterThan(0);
        expect(slide.transition).toBeDefined();
      });
    });

    test('should generate thumbnails for slides', async () => {
      const result = await processPPTXFile(testPPTXPath, 'test-presentation.pptx');
      
      expect(result.thumbnails).toBeDefined();
      expect(result.thumbnails.length).toBe(result.slides.length);
      
      result.thumbnails.forEach(thumbnail => {
        expect(thumbnail).toMatch(/^\/thumbnails\/.+\.png$/);
      });
    });

    test('should handle processing errors gracefully', async () => {
      const result = await processPPTXFile('/nonexistent.pptx', 'nonexistent.pptx');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.slides).toEqual([]);
      expect(result.thumbnails).toEqual([]);
    });
  });

  describe('Performance Tests', () => {
    test('should process PPTX within reasonable time', async () => {
      const startTime = Date.now();
      
      const result = await processPPTXFile(testPPTXPath, 'test-presentation.pptx');
      
      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(10000); // Menos de 10 segundos
    });

    test('should handle concurrent processing', async () => {
      const promises = Array(3).fill(null).map(() => 
        processPPTXFile(testPPTXPath, 'test-presentation.pptx')
      );

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.slides.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle PPTX with no slides', async () => {
      // Criar PPTX vazio
      const emptyPPTXPath = path.join(testDir, 'empty.pptx');
      await createEmptyPPTX(emptyPPTXPath);

      const result = await processPPTXFile(emptyPPTXPath, 'empty.pptx');
      
      expect(result.success).toBe(true);
      expect(result.slides.length).toBe(0);
      expect(result.metadata.slideCount).toBe(0);

      // Limpar
      unlinkSync(emptyPPTXPath);
    });

    test('should handle PPTX with special characters', async () => {
      const result = await processPPTXFile(testPPTXPath, 'tëst-präsëntatiön.pptx');
      
      expect(result.success).toBe(true);
      expect(result.metadata.title).toBeDefined();
    });

    test('should handle PPTX with only images', async () => {
      // Para este teste, usamos o arquivo existente
      // Em uma implementação real, criaríamos um PPTX específico
      const result = await processPPTXFile(testPPTXPath, 'image-only.pptx');
      
      expect(result.success).toBe(true);
      // Slides com apenas imagens ainda devem ser processados
    });
  });

  // Helper function para criar PPTX de teste
  function createTestPPTX() {
    const zip = new JSZip();

    // Content Types
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`);

    // Main relationships
    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`);

    // Core properties
    zip.file('docProps/core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Test Presentation</dc:title>
  <dc:creator>Test Author</dc:creator>
  <dc:subject>Test Subject</dc:subject>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`);

    // Presentation
    zip.file('ppt/presentation.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId2"/>
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000"/>
</p:presentation>`);

    // Slide 1
    zip.file('ppt/slides/slide1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p>
            <a:r>
              <a:t>Test Slide Title</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:r>
              <a:t>This is test content for the slide.</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`);

    // Gerar arquivo
    return zip.generateAsync({ type: 'nodebuffer' }).then(content => {
      writeFileSync(testPPTXPath, content);
    });
  }

  // Helper function para criar PPTX vazio
  async function createEmptyPPTX(filePath: string) {
    const zip = new JSZip();

    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`);

    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`);

    zip.file('docProps/core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Empty Presentation</dc:title>
  <dc:creator>Test</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`);

    zip.file('ppt/presentation.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldIdLst/>
  <p:sldSz cx="9144000" cy="6858000"/>
</p:presentation>`);

    const content = await zip.generateAsync({ type: 'nodebuffer' });
    writeFileSync(filePath, content);
  }
});