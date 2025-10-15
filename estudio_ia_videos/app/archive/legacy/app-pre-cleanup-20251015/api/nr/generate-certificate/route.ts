
/**
 * 📜 CERTIFICATE GENERATION API
 * API para gerar certificados NR em PDF
 */

import { NextRequest, NextResponse } from 'next/server'
import { getComplianceEngine } from '@/lib/nr-compliance-engine'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authConfig)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const { validationResult, projectId, expiresInDays } = body

    if (!validationResult || !projectId) {
      return NextResponse.json({ 
        error: 'validationResult e projectId são obrigatórios' 
      }, { status: 400 })
    }

    if (!validationResult.isCompliant) {
      return NextResponse.json({ 
        error: 'Projeto não elegível para certificação',
        reason: 'Conteúdo não conforme com a norma'
      }, { status: 400 })
    }

    console.log('📜 Gerando certificado NR para projeto:', projectId)

    const engine = getComplianceEngine()
    const certificate = await engine.generateCertificate({
      projectId,
      userId: session.user.email,
      validationResult,
      expiresInDays,
    })

    // TODO: Gerar PDF real com QR Code
    // const pdfUrl = await generatePDFCertificate(certificate)

    return NextResponse.json({
      success: true,
      certificate,
      message: 'Certificado gerado com sucesso!'
    })

  } catch (error) {
    console.error('❌ Erro na geração de certificado:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

/**
 * Gera PDF do certificado (simulado por enquanto)
 */
async function generatePDFCertificate(certificate: any): Promise<string> {
  // Simular geração de PDF
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Retornar URL simulada (em produção, seria URL real do S3)
  return `/certificates/${certificate.id}.pdf`
}
