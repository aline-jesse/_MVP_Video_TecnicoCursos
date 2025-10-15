/**
 * 🛡️ PPTX Validator - Sistema de validação de arquivos PPTX
 * Responsável por validar arquivos PPTX e garantir sua integridade
 */

import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';

export interface ValidationError {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationWarning {
  code: string;
  message: string;
  details?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationOptions {
  maxFileSize?: number;
  allowedImageTypes?: string[];
  maxSlides?: number;
  validateXML?: boolean;
  validateImages?: boolean;
  validateStructure?: boolean;
}

export class PPTXValidator {
  private static readonly DEFAULT_OPTIONS: ValidationOptions = {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedImageTypes: ['png', 'jpg', 'jpeg', 'gif', 'svg'],
    maxSlides: 100,
    validateXML: true,
    validateImages: true,
    validateStructure: true
  };

  private xmlParser: XMLParser;
  private options: ValidationOptions;

  constructor(options: Partial<ValidationOptions> = {}) {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: true
    });

    this.options = {
      ...PPTXValidator.DEFAULT_OPTIONS,
      ...options
    };
  }

  /**
   * Valida um arquivo PPTX completo
   */
  async validatePPTX(buffer: Buffer): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Validar tamanho do arquivo
      if (this.options.maxFileSize && buffer.length > this.options.maxFileSize) {
        errors.push({
          code: 'FILE_TOO_LARGE',
          message: `Arquivo excede o tamanho máximo permitido de ${this.options.maxFileSize / (1024 * 1024)}MB`,
          details: { size: buffer.length }
        });
      }

      // Validar estrutura ZIP
      const zip = await this.validateZipStructure(buffer);
      if (!zip) {
        errors.push({
          code: 'INVALID_ZIP',
          message: 'Arquivo PPTX inválido ou corrompido'
        });
        return { isValid: false, errors, warnings };
      }

      // Validar estrutura PPTX
      if (this.options.validateStructure) {
        const structureErrors = await this.validatePPTXStructure(zip);
        errors.push(...structureErrors);
      }

      // Validar XMLs
      if (this.options.validateXML) {
        const xmlErrors = await this.validateXMLFiles(zip);
        errors.push(...xmlErrors);
      }

      // Validar imagens
      if (this.options.validateImages) {
        const imageValidation = await this.validateImages(zip);
        errors.push(...imageValidation.errors);
        warnings.push(...imageValidation.warnings);
      }

      // Validar número de slides
      const slideCount = await this.countSlides(zip);
      if (this.options.maxSlides && slideCount > this.options.maxSlides) {
        errors.push({
          code: 'TOO_MANY_SLIDES',
          message: `Número de slides (${slideCount}) excede o máximo permitido (${this.options.maxSlides})`
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: `Erro durante validação: ${error.message}`
      });

      return {
        isValid: false,
        errors,
        warnings
      };
    }
  }

  /**
   * Valida a estrutura ZIP do arquivo
   */
  private async validateZipStructure(buffer: Buffer): Promise<JSZip | null> {
    try {
      return await JSZip.loadAsync(buffer);
    } catch (error) {
      return null;
    }
  }

  /**
   * Valida a estrutura básica do PPTX
   */
  private async validatePPTXStructure(zip: JSZip): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const requiredFiles = [
      'ppt/presentation.xml',
      'ppt/_rels/presentation.xml.rels',
      'ppt/slides/_rels/',
      'ppt/slides/',
      '[Content_Types].xml'
    ];

    for (const file of requiredFiles) {
      if (!zip.files[file]) {
        errors.push({
          code: 'MISSING_REQUIRED_FILE',
          message: `Arquivo obrigatório não encontrado: ${file}`
        });
      }
    }

    return errors;
  }

  /**
   * Valida os arquivos XML do PPTX
   */
  private async validateXMLFiles(zip: JSZip): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const xmlFiles = Object.keys(zip.files).filter(file => 
      file.endsWith('.xml') || file.endsWith('.rels')
    );

    for (const file of xmlFiles) {
      try {
        const content = await zip.file(file)?.async('text');
        if (content) {
          try {
            this.xmlParser.parse(content);
          } catch (error) {
            errors.push({
              code: 'INVALID_XML',
              message: `XML inválido em: ${file}`,
              details: { error: error.message }
            });
          }
        }
      } catch (error) {
        errors.push({
          code: 'XML_READ_ERROR',
          message: `Erro ao ler arquivo XML: ${file}`,
          details: { error: error.message }
        });
      }
    }

    return errors;
  }

  /**
   * Valida as imagens do PPTX
   */
  private async validateImages(zip: JSZip): Promise<{
    errors: ValidationError[];
    warnings: ValidationWarning[];
  }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const mediaFiles = Object.keys(zip.files).filter(file => 
      file.startsWith('ppt/media/')
    );

    for (const file of mediaFiles) {
      const extension = file.split('.').pop()?.toLowerCase();
      
      // Verificar tipo de arquivo
      if (extension && this.options.allowedImageTypes) {
        if (!this.options.allowedImageTypes.includes(extension)) {
          errors.push({
            code: 'INVALID_IMAGE_TYPE',
            message: `Tipo de imagem não suportado: ${extension}`,
            details: { file }
          });
          continue;
        }
      }

      // Verificar integridade da imagem
      try {
        const buffer = await zip.file(file)?.async('nodebuffer');
        if (buffer) {
          const imageInfo = await this.validateImageBuffer(buffer);
          if (!imageInfo.valid) {
            errors.push({
              code: 'CORRUPT_IMAGE',
              message: `Imagem corrompida: ${file}`,
              details: imageInfo.error
            });
          }
          if (imageInfo.warning) {
            warnings.push({
              code: 'IMAGE_WARNING',
              message: imageInfo.warning,
              details: { file }
            });
          }
        }
      } catch (error) {
        errors.push({
          code: 'IMAGE_READ_ERROR',
          message: `Erro ao ler imagem: ${file}`,
          details: { error: error.message }
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Valida um buffer de imagem
   */
  private async validateImageBuffer(buffer: Buffer): Promise<{
    valid: boolean;
    error?: string;
    warning?: string;
  }> {
    // Verificar assinaturas de arquivo comuns
    const signatures: Record<string, number[]> = {
      jpg: [0xFF, 0xD8, 0xFF],
      png: [0x89, 0x50, 0x4E, 0x47],
      gif: [0x47, 0x49, 0x46, 0x38]
    };

    for (const [format, signature] of Object.entries(signatures)) {
      if (this.checkSignature(buffer, signature)) {
        // Verificar tamanho mínimo
        if (buffer.length < 100) {
          return {
            valid: true,
            warning: `Imagem ${format} muito pequena, pode ter baixa qualidade`
          };
        }
        return { valid: true };
      }
    }

    return {
      valid: false,
      error: 'Formato de imagem não reconhecido ou arquivo corrompido'
    };
  }

  /**
   * Verifica a assinatura de um arquivo
   */
  private checkSignature(buffer: Buffer, signature: number[]): boolean {
    if (buffer.length < signature.length) return false;
    return signature.every((byte, i) => buffer[i] === byte);
  }

  /**
   * Conta o número de slides no PPTX
   */
  private async countSlides(zip: JSZip): Promise<number> {
    const slideFiles = Object.keys(zip.files).filter(file =>
      file.match(/ppt\/slides\/slide[0-9]+\.xml/)
    );
    return slideFiles.length;
  }
}