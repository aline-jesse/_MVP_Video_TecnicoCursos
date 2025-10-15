

import { NextRequest, NextResponse } from 'next/server'
import { SCORMEngine } from '../../../../../lib/lms/scorm-engine'

export async function POST(request: NextRequest) {
  try {
    const { 
      project_id, 
      scorm_version, 
      mastery_score, 
      completion_threshold,
      lms_type
    } = await request.json()

    // Simular dados do projeto
    const project_data = {
      id: project_id,
      title: 'NR-12: Segurança em Máquinas',
      description: 'Treinamento completo sobre segurança em máquinas industriais',
      duration_minutes: 25,
      scenes: [
        { id: 'scene-1', title: 'Introdução' },
        { id: 'scene-2', title: 'Tipos de Máquinas' },
        { id: 'scene-3', title: 'Riscos e Perigos' },
        { id: 'scene-4', title: 'Equipamentos de Proteção' },
        { id: 'scene-5', title: 'Procedimentos de Segurança' }
      ],
      quiz_questions: [
        {
          question: 'Qual é o principal objetivo da NR-12?',
          options: [
            'Aumentar produtividade',
            'Garantir segurança de máquinas',
            'Reduzir custos',
            'Melhorar ergonomia'
          ],
          correct_answer: 1
        },
        {
          question: 'Quais EPIs são obrigatórios para operação de máquinas?',
          options: [
            'Apenas capacete',
            'Capacete e luvas',
            'Capacete, luvas e óculos',
            'Todos os EPIs necessários conforme análise de risco'
          ],
          correct_answer: 3
        }
      ],
      completion_criteria: {
        min_score: mastery_score,
        min_time_spent: 15, // minutes
        required_interactions: ['scene-completion', 'quiz-completion']
      }
    }

    const lms_config = {
      version: scorm_version,
      mastery_score,
      completion_threshold,
      max_time_allowed: 60 // minutes
    }

    // Gerar pacote SCORM
    const scorm_package = await SCORMEngine.generateSCORMPackage(project_data, lms_config)

    return NextResponse.json({
      success: true,
      package: {
        id: scorm_package.package.identifier,
        download_url: `/api/download/scorm/${scorm_package.package.identifier}`,
        manifest_preview: scorm_package.manifest_xml.substring(0, 500) + '...',
        file_count: scorm_package.content_files.length,
        estimated_size: '2.5 MB',
        compatibility: {
          moodle: true,
          canvas: true,
          blackboard: scorm_version === '1.2',
          brightspace: true
        }
      }
    })

  } catch (error) {
    console.error('Erro na exportação LMS:', error)
    return NextResponse.json(
      { success: false, error: 'Falha na exportação SCORM' },
      { status: 500 }
    )
  }
}

