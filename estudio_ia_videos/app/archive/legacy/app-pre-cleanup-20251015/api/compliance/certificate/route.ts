
/**
 * API: Geração de Certificado de Conformidade
 * POST /api/compliance/certificate
 * 
 * Gera certificado PDF de conformidade com NR
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { getComplianceEngine } from '@/lib/nr-compliance-engine';

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // 2. Parse do body
    const body = await request.json();
    const { projectId, validationResult, expiresInDays } = body;

    // 3. Validações
    if (!projectId || !validationResult) {
      return NextResponse.json(
        { error: 'projectId e validationResult são obrigatórios' },
        { status: 400 }
      );
    }

    // 4. Gerar certificado
    const engine = getComplianceEngine();
    const certificate = await engine.generateCertificate({
      projectId,
      userId: session.user.email,
      validationResult,
      expiresInDays,
    });

    console.log(`[Compliance API] Certificate generated:`, certificate.id);

    // 5. Retornar certificado
    return NextResponse.json({
      success: true,
      certificate,
    });

  } catch (error: any) {
    console.error('[Compliance API] Error generating certificate:', error);
    
    return NextResponse.json(
      {
        error: 'Erro ao gerar certificado',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
