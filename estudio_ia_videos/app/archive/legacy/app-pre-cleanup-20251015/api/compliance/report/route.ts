
/**
 * POST /api/compliance/report
 * Gerar relatório PDF de compliance
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId obrigatório' },
        { status: 400 }
      )
    }

    // Buscar dados de compliance
    const complianceCheck = await prisma.nRComplianceRecord.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    })

    if (!complianceCheck) {
      return NextResponse.json(
        { error: 'Nenhuma verificação encontrada' },
        { status: 404 }
      )
    }

    // Mock PDF (em produção, usar PDFKit ou similar)
    const pdfContent = Buffer.from(`
      Relatório de Compliance
      ========================
      
      Projeto: ${projectId}
      Data: ${new Date().toLocaleString('pt-BR')}
      
      Score: ${complianceCheck.score}%
      Status: ${complianceCheck.status}
      
      Detalhes disponíveis no sistema.
    `)

    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compliance-${projectId}.pdf"`
      }
    })
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    )
  }
}
