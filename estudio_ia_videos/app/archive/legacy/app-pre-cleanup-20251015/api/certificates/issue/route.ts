
/**
 * POST /api/certificates/issue
 * Emitir certificado PDF
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const {
      learner_id,
      training_id,
      completion_date,
      final_score,
      training_duration_hours,
      template,
      issuer
    } = await request.json()

    if (!learner_id || !training_id) {
      return NextResponse.json(
        { error: 'learner_id e training_id obrigatórios' },
        { status: 400 }
      )
    }

    // Gerar ID único do certificado
    const certificateId = `CERT-${new Date().getFullYear()}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`
    
    // Gerar hash de assinatura
    const signatureData = `${certificateId}:${learner_id}:${training_id}:${completion_date}`
    const signatureHash = crypto.createHash('sha256').update(signatureData).digest('hex')

    // Criar certificado no banco
    const certificate = await prisma.certificate.create({
      data: {
        certificateId,
        projectId: training_id,
        userId: learner_id,
        pdfUrl: `/certificates/${certificateId}.pdf`,
        signatureHash,
        issuedBy: issuer?.organization || 'Sistema',
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000) // 2 anos
      }
    })

    return NextResponse.json({
      success: true,
      id: certificate.id,
      certificate_number: certificateId,
      pdf_hash: signatureHash,
      pdf_url: certificate.pdfUrl,
      issued_at: certificate.issuedAt,
      expires_at: certificate.expiresAt
    })
  } catch (error) {
    console.error('Erro ao emitir certificado:', error)
    return NextResponse.json(
      { error: 'Erro ao emitir certificado' },
      { status: 500 }
    )
  }
}
