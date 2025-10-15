/**
 * Intelligent Compliance Report Generator
 * Gerador de relatórios inteligentes de compliance com IA
 */

import PDFDocument from 'pdfkit'
import { NRComplianceRecord, Project, Slide } from '@prisma/client'

interface ComplianceRecordWithProject extends NRComplianceRecord {
  project: Project & {
    slides: Slide[]
  }
}

export async function generateComplianceReport(
  record: ComplianceRecordWithProject
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 })
      const buffers: Buffer[] = []

      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers)
        resolve(pdfBuffer)
      })

      // Header
      doc.fontSize(20).text('RELATÓRIO DE COMPLIANCE NR', { align: 'center' })
      doc.moveDown()

      // Project Info
      doc.fontSize(16).text('INFORMAÇÕES DO PROJETO', { underline: true })
      doc.fontSize(12)
      doc.text(`Projeto: ${record.project.title}`)
      doc.text(`Norma: ${record.nr} - ${record.nrName}`)
      doc.text(`Data de Validação: ${record.validatedAt?.toLocaleDateString('pt-BR') || 'N/A'}`)
      doc.text(`Validado por: ${record.validatedBy || 'Sistema IA'}`)
      doc.moveDown()

      // Compliance Status
      doc.fontSize(16).text('STATUS DE CONFORMIDADE', { underline: true })
      doc.fontSize(12)
      
      const statusText = {
        'compliant': 'CONFORME',
        'partial': 'PARCIALMENTE CONFORME',
        'non_compliant': 'NÃO CONFORME'
      }[record.status] || record.status.toUpperCase()

      doc.text(`Status: ${statusText}`)
      doc.text(`Score Tradicional: ${record.score.toFixed(1)}%`)
      
      if (record.aiScore) {
        doc.text(`Score IA: ${record.aiScore.toFixed(1)}%`)
      }
      
      if (record.finalScore) {
        doc.text(`Score Final: ${record.finalScore.toFixed(1)}%`)
      }
      
      if (record.confidence) {
        doc.text(`Confiança da IA: ${(record.confidence * 100).toFixed(1)}%`)
      }

      doc.text(`Requisitos Atendidos: ${record.requirementsMet}/${record.requirementsTotal}`)
      doc.moveDown()

      // AI Analysis Section
      if (record.aiAnalysis) {
        doc.fontSize(16).text('ANÁLISE INTELIGENTE', { underline: true })
        doc.fontSize(12)
        
        const aiAnalysis = record.aiAnalysis as any
        
        if (aiAnalysis.semanticAnalysis) {
          doc.text('Análise Semântica:', { underline: true })
          doc.text(`Score: ${aiAnalysis.semanticAnalysis.score}%`)
          doc.text(`Conceitos Identificados: ${aiAnalysis.semanticAnalysis.conceptsFound?.join(', ') || 'N/A'}`)
          doc.moveDown(0.5)
        }

        if (aiAnalysis.imageAnalysis) {
          doc.text('Análise de Imagens:', { underline: true })
          doc.text(`Score: ${aiAnalysis.imageAnalysis.score}%`)
          doc.text(`EPIs Detectados: ${aiAnalysis.imageAnalysis.episDetected?.join(', ') || 'Nenhum'}`)
          doc.text(`Equipamentos: ${aiAnalysis.imageAnalysis.equipmentDetected?.join(', ') || 'Nenhum'}`)
          doc.text(`Violações: ${aiAnalysis.imageAnalysis.safetyViolations?.join(', ') || 'Nenhuma'}`)
          doc.moveDown(0.5)
        }

        if (aiAnalysis.audioAnalysis) {
          doc.text('Análise de Áudio:', { underline: true })
          doc.text(`Score: ${aiAnalysis.audioAnalysis.score}%`)
          doc.text(`Qualidade da Explicação: ${aiAnalysis.audioAnalysis.explanationQuality || 'N/A'}`)
          doc.text(`Emoção Detectada: ${aiAnalysis.audioAnalysis.emotionDetected || 'N/A'}`)
          doc.moveDown(0.5)
        }

        if (aiAnalysis.sequenceAnalysis) {
          doc.text('Análise de Sequência:', { underline: true })
          doc.text(`Score: ${aiAnalysis.sequenceAnalysis.score}%`)
          doc.text(`Fluxo Lógico: ${aiAnalysis.sequenceAnalysis.logicalFlow ? 'Adequado' : 'Inadequado'}`)
          doc.moveDown(0.5)
        }

        doc.moveDown()
      }

      // Recommendations
      if (record.recommendations && Array.isArray(record.recommendations)) {
        doc.fontSize(16).text('RECOMENDAÇÕES', { underline: true })
        doc.fontSize(12)
        
        record.recommendations.forEach((rec: string, index: number) => {
          doc.text(`${index + 1}. ${rec}`)
        })
        doc.moveDown()
      }

      // Critical Points
      if (record.criticalPoints && Array.isArray(record.criticalPoints)) {
        doc.fontSize(16).text('PONTOS CRÍTICOS', { underline: true })
        doc.fontSize(12)
        
        record.criticalPoints.forEach((point: any, index: number) => {
          const status = point.covered ? '✓' : '✗'
          doc.text(`${status} ${point.point}`)
          if (point.evidence && point.evidence.length > 0) {
            doc.text(`   Evidências: ${point.evidence.join(', ')}`, { indent: 20 })
          }
        })
        doc.moveDown()
      }

      // Project Content Summary
      doc.fontSize(16).text('RESUMO DO CONTEÚDO', { underline: true })
      doc.fontSize(12)
      doc.text(`Total de Slides: ${record.project.slides.length}`)
      doc.text(`Duração Total: ${Math.round((record.project.duration || 0) / 60)} minutos`)
      doc.moveDown()

      // Slides Overview
      doc.fontSize(14).text('Slides do Projeto:', { underline: true })
      doc.fontSize(10)
      
      record.project.slides.forEach((slide, index) => {
        if (index < 10) { // Limit to first 10 slides to avoid too long reports
          doc.text(`${slide.slideNumber}. ${slide.title}`)
          if (slide.content && slide.content.length > 100) {
            doc.text(`   ${slide.content.substring(0, 100)}...`)
          } else {
            doc.text(`   ${slide.content || 'Sem conteúdo'}`)
          }
          doc.moveDown(0.3)
        }
      })

      if (record.project.slides.length > 10) {
        doc.text(`... e mais ${record.project.slides.length - 10} slides`)
      }

      // Footer
      doc.moveDown()
      doc.fontSize(8)
      doc.text(`Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}`, { align: 'center' })
      doc.text('Sistema de Compliance Inteligente - Estúdio IA', { align: 'center' })

      doc.end()

    } catch (error) {
      reject(error)
    }
  })
}
  