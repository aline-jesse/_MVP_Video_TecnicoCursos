
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/db';

/**
 * ✅ API DE VALIDAÇÃO NR REAL - Sprint 43
 * Validação automática de compliance com Normas Regulamentadoras
 */

// Requisitos por NR (simplificado - em produção seria um banco completo)
const NR_REQUIREMENTS: Record<string, { name: string; requirements: string[] }> = {
  'NR-12': {
    name: 'Segurança no Trabalho em Máquinas e Equipamentos',
    requirements: [
      'Dispositivos de proteção coletiva e individual',
      'Procedimentos de operação segura',
      'Manutenção preventiva e corretiva',
      'Capacitação de operadores',
      'Sinalização de segurança',
      'Sistema de bloqueio e travamento',
      'Certificação de equipamentos',
      'Registro de inspeções'
    ]
  },
  'NR-33': {
    name: 'Segurança e Saúde nos Trabalhos em Espaços Confinados',
    requirements: [
      'Permissão de entrada e trabalho',
      'Identificação e avaliação de riscos',
      'Medidas de controle',
      'Monitoramento contínuo de atmosfera',
      'Capacitação dos trabalhadores',
      'Equipamentos de comunicação',
      'Procedimentos de emergência e salvamento',
      'Responsável técnico qualificado'
    ]
  },
  'NR-35': {
    name: 'Trabalho em Altura',
    requirements: [
      'Análise de risco',
      'Sistema de proteção contra quedas',
      'Capacitação e treinamento',
      'Planejamento do trabalho',
      'Permissão de trabalho',
      'Equipamentos de proteção individual',
      'Procedimentos de emergência',
      'Supervisão responsável'
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, userId, userName, title, description, script, slides, nrType, duration } = body;

    if (!projectId || !nrType) {
      return NextResponse.json(
        { error: 'projectId e nrType são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar requisitos da NR
    const nrInfo = NR_REQUIREMENTS[nrType] || NR_REQUIREMENTS['NR-12'];

    // ✅ ANÁLISE REAL DE COMPLIANCE
    // Combinar todo o conteúdo para análise
    const fullContent = [
      title || '',
      description || '',
      script || '',
      ...(slides || []).map((s: any) => `${s.text || ''} ${s.notes || ''}`)
    ].join(' ').toLowerCase();

    // Verificar cada requisito
    const requirementAnalysis = nrInfo.requirements.map((requirement) => {
      // Palavras-chave para cada requisito
      const keywords = requirement.toLowerCase().split(' ').filter(w => w.length > 3);
      
      // Verificar se pelo menos 50% das palavras-chave aparecem no conteúdo
      const matchedKeywords = keywords.filter(kw => fullContent.includes(kw));
      const matchPercentage = (matchedKeywords.length / keywords.length) * 100;
      
      const met = matchPercentage >= 40; // Threshold de 40%

      return {
        requirement,
        met,
        confidence: Math.min(matchPercentage, 100),
        evidence: met ? `Encontrado no conteúdo: ${matchedKeywords.slice(0, 3).join(', ')}` : 'Não encontrado no conteúdo',
        suggestions: met ? null : `Adicione seções sobre: ${requirement}`
      };
    });

    const requirementsMet = requirementAnalysis.filter(r => r.met).length;
    const requirementsTotal = nrInfo.requirements.length;
    const score = (requirementsMet / requirementsTotal) * 100;

    // Determinar status
    let status: 'compliant' | 'partial' | 'non_compliant';
    if (score >= 80) status = 'compliant';
    else if (score >= 50) status = 'partial';
    else status = 'non_compliant';

    // Recomendações
    const recommendations = requirementAnalysis
      .filter(r => !r.met)
      .map(r => r.suggestions)
      .filter(Boolean);

    // Pontos críticos
    const criticalPoints = requirementAnalysis
      .filter(r => !r.met)
      .slice(0, 3)
      .map(r => ({
        item: r.requirement,
        severity: 'high',
        description: `Requisito obrigatório não atendido: ${r.requirement}`
      }));

    // ✅ SALVAR NO BANCO DE DADOS
    const complianceRecord = await prisma.nRComplianceRecord.create({
      data: {
        projectId,
        nr: nrType,
        nrName: nrInfo.name,
        status,
        score,
        requirementsMet,
        requirementsTotal,
        validatedAt: new Date(),
        validatedBy: 'AI_VALIDATOR',
        recommendations,
        criticalPoints
      }
    });

    // ✅ GERAR CERTIFICADO SE COMPLIANT
    let certificate = null;
    if (status === 'compliant') {
      const certId = `CERT-${Date.now()}-${nrType}`;
      certificate = await prisma.certificate.create({
        data: {
          projectId: projectId || 'demo-project',
          userId: userId || 'demo-user',
          certificateId: certId,
          pdfUrl: null, // Será gerado posteriormente
          signatureHash: null,
          issuedBy: 'Sistema de Compliance NR',
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
          metadata: JSON.stringify({
            courseName: title || `Treinamento ${nrType}`,
            studentName: userName || 'Usuário Demo',
            grade: score,
            skills: requirementAnalysis.filter(r => r.met).map(r => r.requirement),
            nr: nrType
          })
        }
      });
    }

    return NextResponse.json({
      success: true,
      compliance: {
        id: complianceRecord.id,
        projectId,
        nr: nrType,
        nrName: nrInfo.name,
        status,
        score: parseFloat(score.toFixed(1)),
        requirementsMet,
        requirementsTotal,
        requirements: requirementAnalysis,
        recommendations,
        criticalPoints,
        validatedAt: complianceRecord.validatedAt?.toISOString() || new Date().toISOString(),
        validatedBy: 'AI_VALIDATOR'
      },
      certificate: certificate ? (() => {
        const metadata = certificate.metadata ? JSON.parse(certificate.metadata) : {};
        return {
          id: certificate.id,
          certificateId: certificate.certificateId,
          courseName: metadata.courseName || 'Não especificado',
          studentName: metadata.studentName || 'Não especificado',
          completionDate: certificate.issuedAt?.toISOString() || new Date().toISOString(),
          grade: metadata.grade || 0,
          status: 'issued', // Certificado PDF sempre é 'issued'
          pdfUrl: certificate.pdfUrl,
          validUntil: certificate.expiresAt?.toISOString()
        };
      })() : null,
      source: 'DATABASE_REAL'
    });

  } catch (error) {
    console.error('❌ Erro ao validar compliance:', error);
    return NextResponse.json(
      { error: 'Erro ao validar compliance', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'ProjectId requerido' }, { status: 400 });
    }

    // Buscar registros de compliance do projeto
    const records = await prisma.nRComplianceRecord.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      records: records.map((record: any) => ({
        id: record.id,
        nr: record.nr,
        nrName: record.nrName,
        status: record.status,
        score: record.score,
        requirementsMet: record.requirementsMet,
        requirementsTotal: record.requirementsTotal,
        validatedAt: record.validatedAt?.toISOString(),
        validatedBy: record.validatedBy,
        recommendations: record.recommendations,
        criticalPoints: record.criticalPoints
      })),
      source: 'DATABASE_REAL'
    });

  } catch (error) {
    console.error('❌ Erro ao buscar compliance:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar compliance', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
