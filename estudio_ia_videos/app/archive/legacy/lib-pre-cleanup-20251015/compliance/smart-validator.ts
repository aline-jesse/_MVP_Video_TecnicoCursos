/**
 * Smart Compliance Validator
 * Validador inteligente que combina análise estrutural + semântica com GPT-4
 */

import { GPT4ComplianceAnalyzer } from '@/lib/ai/gpt4-client';
import { NR11_TEMPLATE } from './templates/nr-11';
import { getNRTemplate, type NRCode } from './templates';
import { prisma } from '@/lib/db';

export class SmartComplianceValidator {
  private gpt4Analyzer: GPT4ComplianceAnalyzer;
  private templates: Map<string, any>;

  constructor() {
    this.gpt4Analyzer = new GPT4ComplianceAnalyzer();
    this.templates = new Map();
    
    // Registrar templates
    this.templates.set('NR-11', NR11_TEMPLATE);
    // Adicionar outros templates conforme necessário
  }

  async validate(
    projectId: string,
    nrType: string
  ): Promise<ValidationResult> {
    console.log(`🔍 [Compliance] Validating project ${projectId} against ${nrType}`);

    // 1. Buscar conteúdo do projeto
    const content = await this.fetchProjectContent(projectId);

    // 2. Buscar template NR
    const template = this.templates.get(nrType) || getNRTemplate(nrType as NRCode);
    if (!template) {
      throw new Error(`Template not found for ${nrType}`);
    }

    // 3. Validação estrutural (keywords, ordem, duração)
    const structuralValidation = this.validateStructure(content, template);

    // 4. Validação semântica com GPT-4
    const semanticValidation = await this.gpt4Analyzer.analyzeCompliance(
      content.fullText,
      nrType
    );

    // 5. Calcular score final
    const finalScore = this.calculateFinalScore(
      structuralValidation,
      semanticValidation,
      template
    );

    // 6. Gerar relatório
    const report = this.generateReport(
      structuralValidation,
      semanticValidation,
      finalScore,
      template
    );

    console.log(`✅ [Compliance] Validation complete. Score: ${finalScore}`);

    return {
      projectId,
      nrType,
      score: finalScore,
      passed: finalScore >= template.minimumScore,
      report,
      timestamp: new Date()
    };
  }

  private async fetchProjectContent(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { 
        slides: { 
          orderBy: { slideNumber: 'asc' } 
        } 
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const fullText = project.slides
      .map(slide => `${slide.title}\n${slide.content}\n${slide.notes || ''}`)
      .join('\n\n');

    return {
      project,
      fullText,
      slideCount: project.slides.length,
      totalDuration: project.slides.reduce((sum: number, s: any) => sum + (s.duration || 5), 0)
    };
  }

  private validateStructure(content: any, template: any): StructuralValidation {
    const foundTopics: string[] = [];
    const missingTopics: string[] = [];
    let keywordScore = 0;

    // Verificar tópicos obrigatórios
    for (const topic of template.requiredTopics) {
      const hasKeywords = topic.keywords.some((kw: string) =>
        content.fullText.toLowerCase().includes(kw.toLowerCase())
      );

      if (hasKeywords) {
        foundTopics.push(topic.id);
        keywordScore += topic.weight;
      } else {
        missingTopics.push(topic.title);
      }
    }

    // Verificar estrutura
    const structureValid = 
      content.slideCount >= template.structureRules.minSlides &&
      content.slideCount <= template.structureRules.maxSlides &&
      content.totalDuration >= template.structureRules.minDuration;

    return {
      keywordScore,
      foundTopics,
      missingTopics,
      structureValid,
      slideCount: content.slideCount,
      duration: content.totalDuration
    };
  }

  private calculateFinalScore(
    structural: StructuralValidation,
    semantic: any,
    template: any
  ): number {
    // Score ponderado:
    // - 40% keywords/estrutura
    // - 60% análise semântica GPT-4

    const structuralWeight = 0.4;
    const semanticWeight = 0.6;

    const structuralScore = structural.keywordScore;
    const semanticScore = semantic.score;

    const finalScore = 
      (structuralScore * structuralWeight) +
      (semanticScore * semanticWeight);

    return Math.round(Math.min(100, finalScore));
  }

  private generateReport(
    structural: StructuralValidation,
    semantic: any,
    finalScore: number,
    template: any
  ): ComplianceReport {
    return {
      score: finalScore,
      passed: finalScore >= template.minimumScore,
      structural: {
        keywordScore: structural.keywordScore,
        foundTopics: structural.foundTopics,
        missingTopics: structural.missingTopics,
        structureValid: structural.structureValid
      },
      semantic: {
        clarity: semantic.semanticAnalysis.clarity,
        completeness: semantic.semanticAnalysis.completeness,
        technicalAccuracy: semantic.semanticAnalysis.technicalAccuracy,
        suggestions: semantic.suggestions
      },
      recommendations: [
        ...structural.missingTopics.map(t => `Adicionar tópico: ${t}`),
        ...semantic.suggestions
      ]
    };
  }

  /**
   * Validação rápida para feedback em tempo real
   */
  async quickValidate(
    content: string,
    nrType: string
  ): Promise<QuickValidationResult> {
    try {
      const template = this.templates.get(nrType) || getNRTemplate(nrType as NRCode);
      if (!template) {
        throw new Error(`Template not found for ${nrType}`);
      }

      // Análise rápida com GPT-3.5
      const quickAnalysis = await this.gpt4Analyzer.quickAnalysis(content, nrType);

      // Verificação básica de keywords
      let keywordMatches = 0;
      for (const topic of template.requiredTopics) {
        const hasKeywords = topic.keywords.some((kw: string) =>
          content.toLowerCase().includes(kw.toLowerCase())
        );
        if (hasKeywords) keywordMatches++;
      }

      const keywordScore = (keywordMatches / template.requiredTopics.length) * 100;
      const combinedScore = Math.round((keywordScore * 0.3) + (quickAnalysis.score * 0.7));

      return {
        score: combinedScore,
        suggestions: quickAnalysis.suggestions,
        keywordMatches,
        totalKeywords: template.requiredTopics.length
      };
    } catch (error) {
      console.error('Erro na validação rápida:', error);
      return {
        score: 0,
        suggestions: ['Erro na validação. Tente novamente.'],
        keywordMatches: 0,
        totalKeywords: 0
      };
    }
  }
}

interface StructuralValidation {
  keywordScore: number;
  foundTopics: string[];
  missingTopics: string[];
  structureValid: boolean;
  slideCount: number;
  duration: number;
}

interface ValidationResult {
  projectId: string;
  nrType: string;
  score: number;
  passed: boolean;
  report: ComplianceReport;
  timestamp: Date;
}

interface ComplianceReport {
  score: number;
  passed: boolean;
  structural: {
    keywordScore: number;
    foundTopics: string[];
    missingTopics: string[];
    structureValid: boolean;
  };
  semantic: {
    clarity: number;
    completeness: number;
    technicalAccuracy: number;
    suggestions: string[];
  };
  recommendations: string[];
}

interface QuickValidationResult {
  score: number;
  suggestions: string[];
  keywordMatches: number;
  totalKeywords: number;
}