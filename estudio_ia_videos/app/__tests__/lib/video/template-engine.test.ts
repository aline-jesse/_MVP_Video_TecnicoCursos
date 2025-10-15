/**
 * Testes do Video Template Engine
 * 
 * Cobertura completa:
 * - Template management
 * - Placeholder management
 * - Validation
 * - Rendering
 * - Batch rendering
 * - Export/Import
 * - Cache management
 * - Statistics
 * - Factory functions
 * - Edge cases
 */

import {
  VideoTemplateEngine,
  VideoTemplate,
  TemplatePlaceholder,
  TemplateData,
  ValidationResult,
  RenderConfig,
  RenderResult,
  createBasicTemplateEngine,
  createHighPerformanceEngine,
  createDevelopmentEngine,
} from '../../../lib/video/template-engine';

describe('VideoTemplateEngine', () => {
  let engine: VideoTemplateEngine;

  beforeEach(() => {
    engine = new VideoTemplateEngine();
  });

  afterEach(() => {
    engine.reset();
  });

  // ===========================================================================
  // TEMPLATE MANAGEMENT
  // ===========================================================================

  describe('Template Management', () => {
    it('should create template', () => {
      const id = engine.createTemplate('Test Template', 1920, 1080);

      expect(id).toBeDefined();
      expect(id).toMatch(/^template-/);

      const template = engine.getTemplate(id);
      expect(template).toBeDefined();
      expect(template!.name).toBe('Test Template');
      expect(template!.width).toBe(1920);
      expect(template!.height).toBe(1080);
    });

    it('should create template with options', () => {
      const id = engine.createTemplate('Test', 1920, 1080, {
        description: 'Test description',
        fps: 60,
        duration: 30,
        backgroundColor: '#FF0000',
      });

      const template = engine.getTemplate(id);
      expect(template!.description).toBe('Test description');
      expect(template!.fps).toBe(60);
      expect(template!.duration).toBe(30);
      expect(template!.backgroundColor).toBe('#FF0000');
    });

    it('should get all templates', () => {
      engine.createTemplate('Template 1', 1920, 1080);
      engine.createTemplate('Template 2', 1280, 720);

      const templates = engine.getAllTemplates();
      expect(templates).toHaveLength(2);
    });

    it('should get templates by status', () => {
      const id1 = engine.createTemplate('Valid', 1920, 1080);
      const id2 = engine.createTemplate('Invalid', 1920, 1080);

      // Modificar status manualmente para teste
      const t2 = engine.getTemplate(id2)!;
      t2.status = 'invalid';

      const valid = engine.getTemplatesByStatus('valid');
      const invalid = engine.getTemplatesByStatus('invalid');

      expect(valid.length).toBeGreaterThanOrEqual(1);
      expect(invalid).toHaveLength(1);
    });

    it('should update template', () => {
      const id = engine.createTemplate('Test', 1920, 1080);

      const updated = engine.updateTemplate(id, {
        name: 'Updated',
        description: 'New description',
      });

      expect(updated).toBe(true);

      const template = engine.getTemplate(id);
      expect(template!.name).toBe('Updated');
      expect(template!.description).toBe('New description');
    });

    it('should not update non-existent template', () => {
      const updated = engine.updateTemplate('invalid-id', { name: 'Test' });
      expect(updated).toBe(false);
    });

    it('should delete template', () => {
      const id = engine.createTemplate('Test', 1920, 1080);

      const deleted = engine.deleteTemplate(id);
      expect(deleted).toBe(true);

      const template = engine.getTemplate(id);
      expect(template).toBeUndefined();
    });

    it('should duplicate template', () => {
      const id = engine.createTemplate('Original', 1920, 1080);
      engine.addPlaceholder(id, {
        name: 'Text',
        type: 'text',
        required: true,
        x: 100,
        y: 100,
        width: 200,
        height: 50,
        startTime: 0,
        duration: 5,
      });

      const newId = engine.duplicateTemplate(id, 'Copy');
      expect(newId).toBeDefined();

      const original = engine.getTemplate(id);
      const copy = engine.getTemplate(newId!);

      expect(copy).toBeDefined();
      expect(copy!.name).toBe('Copy');
      expect(copy!.placeholders).toHaveLength(original!.placeholders.length);
    });
  });

  // ===========================================================================
  // PLACEHOLDER MANAGEMENT
  // ===========================================================================

  describe('Placeholder Management', () => {
    let templateId: string;

    beforeEach(() => {
      templateId = engine.createTemplate('Test', 1920, 1080);
    });

    it('should add placeholder', () => {
      const placeholderId = engine.addPlaceholder(templateId, {
        name: 'Title',
        type: 'text',
        required: true,
        x: 100,
        y: 100,
        width: 500,
        height: 100,
        startTime: 0,
        duration: 5,
      });

      expect(placeholderId).toBeDefined();

      const placeholders = engine.getPlaceholders(templateId);
      expect(placeholders).toHaveLength(1);
      expect(placeholders[0].name).toBe('Title');
    });

    it('should add placeholder with style', () => {
      const placeholderId = engine.addPlaceholder(templateId, {
        name: 'Styled Text',
        type: 'text',
        required: false,
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        startTime: 0,
        duration: 3,
        style: {
          fontSize: 24,
          fontFamily: 'Arial',
          color: '#FFFFFF',
          backgroundColor: '#000000',
        },
      });

      const placeholders = engine.getPlaceholders(templateId);
      const placeholder = placeholders.find((p) => p.id === placeholderId);

      expect(placeholder).toBeDefined();
      expect(placeholder!.style).toBeDefined();
      expect(placeholder!.style!.fontSize).toBe(24);
    });

    it('should update placeholder', () => {
      const placeholderId = engine.addPlaceholder(templateId, {
        name: 'Text',
        type: 'text',
        required: true,
        x: 100,
        y: 100,
        width: 200,
        height: 50,
        startTime: 0,
        duration: 5,
      });

      const updated = engine.updatePlaceholder(templateId, placeholderId!, {
        name: 'Updated Text',
        width: 300,
      });

      expect(updated).toBe(true);

      const placeholders = engine.getPlaceholders(templateId);
      const placeholder = placeholders[0];

      expect(placeholder.name).toBe('Updated Text');
      expect(placeholder.width).toBe(300);
    });

    it('should remove placeholder', () => {
      const placeholderId = engine.addPlaceholder(templateId, {
        name: 'Text',
        type: 'text',
        required: true,
        x: 100,
        y: 100,
        width: 200,
        height: 50,
        startTime: 0,
        duration: 5,
      });

      const removed = engine.removePlaceholder(templateId, placeholderId!);
      expect(removed).toBe(true);

      const placeholders = engine.getPlaceholders(templateId);
      expect(placeholders).toHaveLength(0);
    });

    it('should get placeholders by type', () => {
      engine.addPlaceholder(templateId, {
        name: 'Text 1',
        type: 'text',
        required: true,
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        startTime: 0,
        duration: 5,
      });

      engine.addPlaceholder(templateId, {
        name: 'Image 1',
        type: 'image',
        required: false,
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        startTime: 0,
        duration: 5,
      });

      const textPlaceholders = engine.getPlaceholdersByType(templateId, 'text');
      const imagePlaceholders = engine.getPlaceholdersByType(templateId, 'image');

      expect(textPlaceholders).toHaveLength(1);
      expect(imagePlaceholders).toHaveLength(1);
    });

    it('should not exceed max placeholders', () => {
      const testEngine = new VideoTemplateEngine({ maxPlaceholders: 2 });
      const id = testEngine.createTemplate('Test', 1920, 1080);

      // Escutar evento de erro para evitar "unhandled error"
      const errorSpy = jest.fn();
      testEngine.on('error', errorSpy);

      testEngine.addPlaceholder(id, {
        name: 'P1',
        type: 'text',
        required: false,
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        startTime: 0,
        duration: 5,
      });

      testEngine.addPlaceholder(id, {
        name: 'P2',
        type: 'text',
        required: false,
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        startTime: 0,
        duration: 5,
      });

      const p3 = testEngine.addPlaceholder(id, {
        name: 'P3',
        type: 'text',
        required: false,
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        startTime: 0,
        duration: 5,
      });

      expect(p3).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'max-placeholders',
        })
      );
    });
  });

  // ===========================================================================
  // VALIDATION
  // ===========================================================================

  describe('Validation', () => {
    it('should validate valid template', () => {
      const id = engine.createTemplate('Test', 1920, 1080);
      engine.addPlaceholder(id, {
        name: 'Title',
        type: 'text',
        required: false,
        x: 100,
        y: 100,
        width: 500,
        height: 100,
        startTime: 0,
        duration: 5,
      });

      const validation = engine.validateTemplate(id);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing required placeholder', () => {
      const id = engine.createTemplate('Test', 1920, 1080);
      engine.addPlaceholder(id, {
        name: 'Required',
        type: 'text',
        required: true,
        x: 100,
        y: 100,
        width: 500,
        height: 100,
        startTime: 0,
        duration: 5,
      });

      const validation = engine.validateTemplate(id, {});
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should use default value for missing placeholder', () => {
      const id = engine.createTemplate('Test', 1920, 1080);
      const placeholderId = engine.addPlaceholder(id, {
        name: 'Optional',
        type: 'text',
        required: true,
        defaultValue: 'Default Text',
        x: 100,
        y: 100,
        width: 500,
        height: 100,
        startTime: 0,
        duration: 5,
      });

      const validation = engine.validateTemplate(id, {});
      expect(validation.valid).toBe(true);
      expect(validation.warnings.length).toBeGreaterThan(0);
    });

    it('should detect out of bounds placeholder', () => {
      const id = engine.createTemplate('Test', 1920, 1080);
      engine.addPlaceholder(id, {
        name: 'OutOfBounds',
        type: 'text',
        required: false,
        x: 2000, // Fora dos limites
        y: 100,
        width: 500,
        height: 100,
        startTime: 0,
        duration: 5,
      });

      const validation = engine.validateTemplate(id);
      expect(validation.valid).toBe(false);
    });

    it('should detect invalid timing', () => {
      const id = engine.createTemplate('Test', 1920, 1080, { duration: 10 });
      engine.addPlaceholder(id, {
        name: 'LongDuration',
        type: 'text',
        required: false,
        x: 100,
        y: 100,
        width: 500,
        height: 100,
        startTime: 8,
        duration: 5, // Excede duração do template
      });

      const validation = engine.validateTemplate(id);
      expect(validation.valid).toBe(false);
    });
  });

  // ===========================================================================
  // RENDERING
  // ===========================================================================

  describe('Rendering', () => {
    it('should render template successfully', async () => {
      const id = engine.createTemplate('Test', 1920, 1080);
      const placeholderId = engine.addPlaceholder(id, {
        name: 'Title',
        type: 'text',
        required: true,
        x: 100,
        y: 100,
        width: 500,
        height: 100,
        startTime: 0,
        duration: 5,
      });

      const data: TemplateData = {
        [placeholderId!]: 'Hello World',
      };

      const config: RenderConfig = {
        format: 'mp4',
        quality: 'high',
        outputPath: './output.mp4',
      };

      const result = await engine.renderTemplate(id, data, config);

      expect(result.success).toBe(true);
      expect(result.outputPath).toBe('./output.mp4');
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should fail render with invalid data', async () => {
      const id = engine.createTemplate('Test', 1920, 1080);
      engine.addPlaceholder(id, {
        name: 'Required',
        type: 'text',
        required: true,
        x: 100,
        y: 100,
        width: 500,
        height: 100,
        startTime: 0,
        duration: 5,
      });

      const config: RenderConfig = {
        format: 'mp4',
        quality: 'high',
        outputPath: './output.mp4',
      };

      const result = await engine.renderTemplate(id, {}, config);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should render with default values', async () => {
      const id = engine.createTemplate('Test', 1920, 1080);
      const placeholderId = engine.addPlaceholder(id, {
        name: 'Optional',
        type: 'text',
        required: false,
        defaultValue: 'Default',
        x: 100,
        y: 100,
        width: 500,
        height: 100,
        startTime: 0,
        duration: 5,
      });

      const config: RenderConfig = {
        format: 'mp4',
        quality: 'medium',
        outputPath: './output.mp4',
      };

      const result = await engine.renderTemplate(id, {}, config);

      expect(result.success).toBe(true);
    });
  });

  // ===========================================================================
  // BATCH RENDERING
  // ===========================================================================

  describe('Batch Rendering', () => {
    it('should render multiple templates', async () => {
      const id1 = engine.createTemplate('Template 1', 1920, 1080);
      const id2 = engine.createTemplate('Template 2', 1280, 720);

      const renders = [
        {
          templateId: id1,
          data: {},
          config: {
            format: 'mp4' as const,
            quality: 'high' as const,
            outputPath: './output1.mp4',
          },
        },
        {
          templateId: id2,
          data: {},
          config: {
            format: 'webm' as const,
            quality: 'medium' as const,
            outputPath: './output2.webm',
          },
        },
      ];

      const results = await engine.renderBatch(renders);

      expect(results).toHaveLength(2);
      expect(results.filter((r) => r.success)).toHaveLength(2);
    });

    it('should handle mixed success/failure in batch', async () => {
      const id1 = engine.createTemplate('Valid', 1920, 1080);
      const id2 = engine.createTemplate('Invalid', 1920, 1080);

      engine.addPlaceholder(id2, {
        name: 'Required',
        type: 'text',
        required: true,
        x: 100,
        y: 100,
        width: 500,
        height: 100,
        startTime: 0,
        duration: 5,
      });

      const renders = [
        {
          templateId: id1,
          data: {},
          config: {
            format: 'mp4' as const,
            quality: 'high' as const,
            outputPath: './output1.mp4',
          },
        },
        {
          templateId: id2,
          data: {}, // Faltando dados obrigatórios
          config: {
            format: 'mp4' as const,
            quality: 'high' as const,
            outputPath: './output2.mp4',
          },
        },
      ];

      const results = await engine.renderBatch(renders);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });
  });

  // ===========================================================================
  // EXPORT/IMPORT
  // ===========================================================================

  describe('Export/Import', () => {
    it('should export template', () => {
      const id = engine.createTemplate('Test', 1920, 1080, {
        description: 'Test template',
      });

      const json = engine.exportTemplate(id);
      expect(json).toBeDefined();

      const parsed = JSON.parse(json!);
      expect(parsed.name).toBe('Test');
      expect(parsed.description).toBe('Test template');
    });

    it('should import template', () => {
      const template = {
        id: 'old-id',
        name: 'Imported',
        description: 'Imported template',
        width: 1920,
        height: 1080,
        fps: 30,
        duration: 10,
        backgroundColor: '#000000',
        placeholders: [],
        variables: {},
        status: 'valid',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const json = JSON.stringify(template);
      const newId = engine.importTemplate(json);

      expect(newId).toBeDefined();
      expect(newId).not.toBe('old-id'); // Deve gerar novo ID

      const imported = engine.getTemplate(newId!);
      expect(imported).toBeDefined();
      expect(imported!.name).toBe('Imported');
    });

    it('should export all templates', () => {
      engine.createTemplate('Template 1', 1920, 1080);
      engine.createTemplate('Template 2', 1280, 720);

      const json = engine.exportAllTemplates();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
    });
  });

  // ===========================================================================
  // CACHE MANAGEMENT
  // ===========================================================================

  describe('Cache Management', () => {
    it('should set and get cache', () => {
      const testEngine = new VideoTemplateEngine({ cacheTemplates: true });

      testEngine.cacheSet('test-key', { value: 'test' });
      const cached = testEngine.cacheGet('test-key');

      expect(cached).toEqual({ value: 'test' });
    });

    it('should track cache hits and misses', () => {
      const testEngine = new VideoTemplateEngine({ cacheTemplates: true });

      testEngine.cacheSet('key1', 'value1');
      testEngine.cacheGet('key1'); // Hit
      testEngine.cacheGet('key2'); // Miss

      const stats = testEngine.getStatistics();
      expect(stats.cacheHits).toBe(1);
      expect(stats.cacheMisses).toBe(1);
    });

    it('should clear cache', () => {
      const testEngine = new VideoTemplateEngine({ cacheTemplates: true });

      testEngine.cacheSet('key1', 'value1');
      testEngine.cacheSet('key2', 'value2');

      expect(testEngine.cacheSize()).toBe(2);

      testEngine.cacheClear();

      expect(testEngine.cacheSize()).toBe(0);
    });

    it('should not cache when disabled', () => {
      const testEngine = new VideoTemplateEngine({ cacheTemplates: false });

      testEngine.cacheSet('key', 'value');
      const cached = testEngine.cacheGet('key');

      expect(cached).toBeUndefined();
    });
  });

  // ===========================================================================
  // STATISTICS
  // ===========================================================================

  describe('Statistics', () => {
    it('should track template counts', () => {
      engine.createTemplate('T1', 1920, 1080);
      engine.createTemplate('T2', 1920, 1080);

      const stats = engine.getStatistics();
      expect(stats.totalTemplates).toBe(2);
    });

    it('should track render statistics', async () => {
      const id = engine.createTemplate('Test', 1920, 1080);

      const config: RenderConfig = {
        format: 'mp4',
        quality: 'high',
        outputPath: './output.mp4',
      };

      await engine.renderTemplate(id, {}, config);
      await engine.renderTemplate(id, {}, config);

      const stats = engine.getStatistics();
      expect(stats.totalRenders).toBe(2);
      expect(stats.averageRenderTime).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // CONFIGURATION
  // ===========================================================================

  describe('Configuration', () => {
    it('should get config', () => {
      const config = engine.getConfig();
      expect(config).toHaveProperty('maxTemplateSize');
      expect(config).toHaveProperty('maxPlaceholders');
    });

    it('should update config', () => {
      engine.updateConfig({
        maxPlaceholders: 100,
        validateOnCreate: false,
      });

      const config = engine.getConfig();
      expect(config.maxPlaceholders).toBe(100);
      expect(config.validateOnCreate).toBe(false);
    });
  });

  // ===========================================================================
  // FACTORY FUNCTIONS
  // ===========================================================================

  describe('Factory Functions', () => {
    it('should create basic engine', () => {
      const basic = createBasicTemplateEngine();
      expect(basic).toBeInstanceOf(VideoTemplateEngine);

      const config = basic.getConfig();
      expect(config.maxTemplateSize).toBe(1920 * 1080);
      expect(config.cacheTemplates).toBe(false);
    });

    it('should create high performance engine', () => {
      const highPerf = createHighPerformanceEngine();
      expect(highPerf).toBeInstanceOf(VideoTemplateEngine);

      const config = highPerf.getConfig();
      expect(config.maxTemplateSize).toBe(4096 * 4096);
      expect(config.cacheTemplates).toBe(true);
    });

    it('should create development engine', () => {
      const dev = createDevelopmentEngine();
      expect(dev).toBeInstanceOf(VideoTemplateEngine);

      const config = dev.getConfig();
      expect(config.maxTemplateSize).toBe(1280 * 720);
      expect(config.validateOnCreate).toBe(false);
    });
  });

  // ===========================================================================
  // EDGE CASES
  // ===========================================================================

  describe('Edge Cases', () => {
    it('should handle non-existent template', () => {
      const template = engine.getTemplate('invalid-id');
      expect(template).toBeUndefined();
    });

    it('should handle empty template list', () => {
      const templates = engine.getAllTemplates();
      expect(templates).toHaveLength(0);
    });

    it('should handle invalid JSON import', () => {
      // Escutar evento de erro para evitar "unhandled error"
      const errorSpy = jest.fn();
      engine.on('error', errorSpy);

      const newId = engine.importTemplate('invalid json');
      expect(newId).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'import-failed',
        })
      );
    });

    it('should reset engine', () => {
      engine.createTemplate('T1', 1920, 1080);
      engine.createTemplate('T2', 1920, 1080);

      engine.reset();

      const templates = engine.getAllTemplates();
      const stats = engine.getStatistics();

      expect(templates).toHaveLength(0);
      expect(stats.totalTemplates).toBe(0);
    });
  });
});
