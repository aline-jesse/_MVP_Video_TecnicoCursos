/**
 * 📋 Spec Validator - Sistema de Validação de Especificações
 * Valida se as implementações estão em conformidade com as especificações
 */

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

export interface SpecValidationConfig {
  specFiles: string[];
  implementationDir: string;
  outputDir: string;
  validateTypes?: boolean;
  validateFunctions?: boolean;
  validateInterfaces?: boolean;
  validateComments?: boolean;
}

export interface SpecRequirement {
  id: string;
  description: string;
  type: 'function' | 'interface' | 'type' | 'constant' | 'class';
  required: boolean;
  implemented?: boolean;
  location?: string;
  notes?: string[];
}

export interface SpecValidationResult {
  timestamp: string;
  requirements: {
    total: number;
    implemented: number;
    missing: number;
    percentage: number;
  };
  details: {
    implemented: SpecRequirement[];
    missing: SpecRequirement[];
    extra: SpecRequirement[];
  };
  files: {
    [key: string]: {
      requirements: number;
      implemented: number;
      coverage: number;
    };
  };
}

export class SpecValidator {
  private config: SpecValidationConfig;
  private requirements: Map<string, SpecRequirement>;
  private implementations: Map<string, string[]>;

  constructor(config: SpecValidationConfig) {
    this.config = config;
    this.requirements = new Map();
    this.implementations = new Map();
  }

  /**
   * Executa a validação completa das especificações
   */
  async validate(): Promise<SpecValidationResult> {
    // Carregar especificações
    await this.loadSpecifications();

    // Analisar implementações
    await this.analyzeImplementations();

    // Gerar resultado
    const result = this.generateResult();

    // Salvar relatório
    await this.saveReport(result);

    return result;
  }

  /**
   * Carrega as especificações dos arquivos
   */
  private async loadSpecifications(): Promise<void> {
    for (const specFile of this.config.specFiles) {
      const content = await fs.promises.readFile(specFile, 'utf-8');
      const specs = this.parseSpecFile(content);
      
      for (const spec of specs) {
        this.requirements.set(spec.id, spec);
      }
    }
  }

  /**
   * Analisa os arquivos de implementação
   */
  private async analyzeImplementations(): Promise<void> {
    const files = await this.findImplementationFiles();

    for (const file of files) {
      const content = await fs.promises.readFile(file, 'utf-8');
      const implementations = this.analyzeImplementationFile(content);
      this.implementations.set(file, implementations);
    }
  }

  /**
   * Encontra todos os arquivos de implementação
   */
  private async findImplementationFiles(): Promise<string[]> {
    const files: string[] = [];
    
    async function scan(dir: string): Promise<void> {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile() && /\.(ts|js)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }

    await scan(this.config.implementationDir);
    return files;
  }

  /**
   * Analisa um arquivo de especificação
   */
  private parseSpecFile(content: string): SpecRequirement[] {
    const requirements: SpecRequirement[] = [];
    const lines = content.split('\n');
    let currentRequirement: Partial<SpecRequirement> | null = null;

    for (const line of lines) {
      if (line.startsWith('### Requirement:')) {
        if (currentRequirement && this.isValidRequirement(currentRequirement)) {
          requirements.push(currentRequirement as SpecRequirement);
        }
        currentRequirement = {
          id: this.generateRequirementId(),
          notes: []
        };
      } else if (currentRequirement) {
        if (line.startsWith('- Type:')) {
          currentRequirement.type = line.split(':')[1].trim() as any;
        } else if (line.startsWith('- Description:')) {
          currentRequirement.description = line.split(':')[1].trim();
        } else if (line.startsWith('- Required:')) {
          currentRequirement.required = line.includes('true');
        } else if (line.trim().startsWith('-')) {
          currentRequirement.notes = currentRequirement.notes || [];
          currentRequirement.notes.push(line.trim().slice(2));
        }
      }
    }

    if (currentRequirement && this.isValidRequirement(currentRequirement)) {
      requirements.push(currentRequirement as SpecRequirement);
    }

    return requirements;
  }

  /**
   * Analisa um arquivo de implementação
   */
  private analyzeImplementationFile(content: string): string[] {
    const implementations: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      // Funções
      if (this.config.validateFunctions) {
        const functionMatch = line.match(/function\s+(\w+)/);
        if (functionMatch) {
          implementations.push(functionMatch[1]);
        }
      }

      // Interfaces
      if (this.config.validateInterfaces) {
        const interfaceMatch = line.match(/interface\s+(\w+)/);
        if (interfaceMatch) {
          implementations.push(interfaceMatch[1]);
        }
      }

      // Types
      if (this.config.validateTypes) {
        const typeMatch = line.match(/type\s+(\w+)/);
        if (typeMatch) {
          implementations.push(typeMatch[1]);
        }
      }

      // Classes
      const classMatch = line.match(/class\s+(\w+)/);
      if (classMatch) {
        implementations.push(classMatch[1]);
      }
    }

    return implementations;
  }

  /**
   * Gera o resultado da validação
   */
  private generateResult(): SpecValidationResult {
    const result: SpecValidationResult = {
      timestamp: new Date().toISOString(),
      requirements: {
        total: this.requirements.size,
        implemented: 0,
        missing: 0,
        percentage: 0
      },
      details: {
        implemented: [],
        missing: [],
        extra: []
      },
      files: {}
    };

    // Verificar cada requisito
    for (const [id, requirement] of this.requirements) {
      let implemented = false;

      for (const [file, implementations] of this.implementations) {
        if (implementations.some(impl => this.matchesRequirement(impl, requirement))) {
          implemented = true;
          requirement.implemented = true;
          requirement.location = file;
          result.details.implemented.push(requirement);

          // Atualizar estatísticas do arquivo
          result.files[file] = result.files[file] || {
            requirements: 0,
            implemented: 0,
            coverage: 0
          };
          result.files[file].requirements++;
          result.files[file].implemented++;
          break;
        }
      }

      if (!implemented && requirement.required) {
        result.details.missing.push(requirement);
      }
    }

    // Encontrar implementações extras
    for (const [file, implementations] of this.implementations) {
      for (const impl of implementations) {
        if (!this.isImplementationRequired(impl)) {
          result.details.extra.push({
            id: this.generateRequirementId(),
            description: `Extra implementation: ${impl}`,
            type: this.guessImplementationType(impl),
            required: false,
            implemented: true,
            location: file
          });
        }
      }
    }

    // Calcular estatísticas
    result.requirements.implemented = result.details.implemented.length;
    result.requirements.missing = result.details.missing.length;
    result.requirements.percentage = this.calculatePercentage(
      result.requirements.implemented,
      result.requirements.total
    );

    // Calcular cobertura por arquivo
    for (const file in result.files) {
      result.files[file].coverage = this.calculatePercentage(
        result.files[file].implemented,
        result.files[file].requirements
      );
    }

    return result;
  }

  /**
   * Salva o relatório de validação
   */
  private async saveReport(result: SpecValidationResult): Promise<void> {
    const outputPath = path.join(this.config.outputDir, 'spec-validation-report.json');
    await fs.promises.writeFile(
      outputPath,
      JSON.stringify(result, null, 2)
    );

    // Gerar relatório Markdown
    const markdownPath = path.join(this.config.outputDir, 'spec-validation-report.md');
    await fs.promises.writeFile(
      markdownPath,
      this.generateMarkdownReport(result)
    );
  }

  /**
   * Gera relatório em formato Markdown
   */
  private generateMarkdownReport(result: SpecValidationResult): string {
    return `# Spec Validation Report

## Summary
- Total Requirements: ${result.requirements.total}
- Implemented: ${result.requirements.implemented}
- Missing: ${result.requirements.missing}
- Coverage: ${result.requirements.percentage.toFixed(2)}%

## Implemented Requirements
${result.details.implemented.map(req => `
### ${req.id}
- Type: ${req.type}
- Description: ${req.description}
- Location: ${req.location}
${req.notes?.length ? '- Notes:\n' + req.notes.map(note => `  - ${note}`).join('\n') : ''}`
).join('\n')}

## Missing Requirements
${result.details.missing.map(req => `
### ${req.id}
- Type: ${req.type}
- Description: ${req.description}
${req.notes?.length ? '- Notes:\n' + req.notes.map(note => `  - ${note}`).join('\n') : ''}`
).join('\n')}

## Extra Implementations
${result.details.extra.map(req => `
### ${req.id}
- Type: ${req.type}
- Description: ${req.description}
- Location: ${req.location}`
).join('\n')}

## File Coverage
${Object.entries(result.files).map(([file, stats]) => `
### ${file}
- Requirements: ${stats.requirements}
- Implemented: ${stats.implemented}
- Coverage: ${stats.coverage.toFixed(2)}%`
).join('\n')}

---
Generated on: ${result.timestamp}`;
  }

  /**
   * Verifica se um requisito é válido
   */
  private isValidRequirement(requirement: Partial<SpecRequirement>): boolean {
    return !!(
      requirement.id &&
      requirement.type &&
      requirement.description
    );
  }

  /**
   * Verifica se uma implementação corresponde a um requisito
   */
  private matchesRequirement(implementation: string, requirement: SpecRequirement): boolean {
    // Implementar lógica mais sofisticada de matching se necessário
    return implementation.toLowerCase().includes(requirement.id.toLowerCase());
  }

  /**
   * Verifica se uma implementação é requerida por alguma especificação
   */
  private isImplementationRequired(implementation: string): boolean {
    return Array.from(this.requirements.values()).some(req =>
      this.matchesRequirement(implementation, req)
    );
  }

  /**
   * Tenta adivinhar o tipo de uma implementação
   */
  private guessImplementationType(implementation: string): SpecRequirement['type'] {
    if (implementation.endsWith('Interface')) return 'interface';
    if (implementation.endsWith('Type')) return 'type';
    if (implementation[0].toUpperCase() === implementation[0]) return 'class';
    return 'function';
  }

  /**
   * Gera um ID único para um requisito
   */
  private generateRequirementId(): string {
    return createHash('md5')
      .update(Date.now().toString())
      .digest('hex')
      .substring(0, 8);
  }

  /**
   * Calcula porcentagem
   */
  private calculatePercentage(value: number, total: number): number {
    return total === 0 ? 0 : (value / total) * 100;
  }
}