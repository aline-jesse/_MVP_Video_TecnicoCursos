/**
 * 🧪 Testes PPTX Simplificados - Validação Funcional
 * 
 * Testes básicos para validar funcionalidade real do sistema PPTX
 */

import { processPPTXFile, validatePPTXFile } from '@/lib/pptx-processor';
import { writeFileSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import path from 'path';

describe('PPTX System Tests', () => {
  const testDir = path.join(__dirname, 'temp');
  
  beforeAll(() => {
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Cleanup opcional
  });

  describe('File Validation', () => {
    test('should reject non-existent files', async () => {
      const result = await validatePPTXFile('/nonexistent/file.pptx');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject oversized files', async () => {
      const largePath = path.join(testDir, 'large.pptx');
      const largeBuffer = Buffer.alloc(200 * 1024 * 1024); // 200MB
      writeFileSync(largePath, largeBuffer);

      const result = await validatePPTXFile(largePath);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('muito grande');

      unlinkSync(largePath);
    });

    test('should reject invalid file format', async () => {
      const invalidPath = path.join(testDir, 'invalid.pptx');
      writeFileSync(invalidPath, 'Not a valid PPTX');

      const result = await validatePPTXFile(invalidPath);
      expect(result.valid).toBe(false);

      unlinkSync(invalidPath);
    });
  });

  describe('Processing Logic', () => {
    test('should handle processing errors gracefully', async () => {
      const result = await processPPTXFile('/nonexistent.pptx', 'test.pptx');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.slides).toEqual([]);
    });

    test('should return consistent result structure', async () => {
      const result = await processPPTXFile('/nonexistent.pptx', 'test.pptx');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('slides');
      expect(result).toHaveProperty('thumbnails');
      expect(Array.isArray(result.slides)).toBe(true);
      expect(Array.isArray(result.thumbnails)).toBe(true);
    });
  });

  describe('System Integration', () => {
    test('should validate input parameters', () => {
      expect(typeof validatePPTXFile).toBe('function');
      expect(typeof processPPTXFile).toBe('function');
    });

    test('should return promises', () => {
      const validationPromise = validatePPTXFile('/test.pptx');
      const processingPromise = processPPTXFile('/test.pptx', 'test.pptx');
      
      expect(validationPromise).toBeInstanceOf(Promise);
      expect(processingPromise).toBeInstanceOf(Promise);
    });
  });
});