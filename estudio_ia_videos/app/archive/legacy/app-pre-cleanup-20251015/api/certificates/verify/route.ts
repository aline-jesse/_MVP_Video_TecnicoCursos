
/**
 * POST /api/certificates/verify
 * Verificar certificado PDF
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { certificateId } = await request.json()

    if (!certificateId) {
      return NextResponse.json(
        { error: 'certificateId obrigatório' },
        { status: 400 }
      )
    }

    // Buscar certificado no banco
    const certificate = await prisma.certificate.findUnique({
      where: { certificateId }
    })

    if (!certificate) {
      return NextResponse.json({
        is_valid: false,
        error: 'Certificado não encontrado'
      })
    }

    // Verificar se não está expirado
    const now = new Date()
    const isExpired = certificate.expiresAt && new Date(certificate.expiresAt) < now

    return NextResponse.json({
      is_valid: !isExpired,
      certificate: {
        id: certificate.id,
        certificate_number: certificate.certificateId,
        pdf_hash: certificate.signatureHash || 'N/A',
        pdf_url: certificate.pdfUrl,
        created_at: certificate.issuedAt?.toISOString() || certificate.createdAt.toISOString(),
        expires_at: certificate.expiresAt?.toISOString(),
        issued_by: certificate.issuedBy || 'Sistema'
      },
      expiration_status: isExpired ? 'expired' : 'valid'
    })
  } catch (error) {
    console.error('Erro ao verificar certificado:', error)
    return NextResponse.json(
      { is_valid: false, error: 'Erro ao verificar certificado' },
      { status: 500 }
    )
  }
}
