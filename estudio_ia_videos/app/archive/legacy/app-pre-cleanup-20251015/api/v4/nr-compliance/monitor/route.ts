

/**
 * 🏗️ NR Compliance Monitor API
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    
    const checks = [
      {
        id: 'check-nr01-pgr',
        nr: 'NR-01',
        item: 'Programa de Gerenciamento de Riscos (PGR)',
        status: 'conforme',
        score: 97,
        detalhes: 'PGR atualizado e implementado conforme exigências',
        ultimaVerificacao: new Date().toISOString(),
        impacto: 'alto'
      },
      {
        id: 'check-nr06-epis',
        nr: 'NR-06',
        item: 'Gestão de EPIs e Treinamentos',
        status: 'conforme',
        score: 98,
        detalhes: 'Sistema de controle de EPIs operacional',
        ultimaVerificacao: new Date().toISOString(),
        impacto: 'medio'
      },
      {
        id: 'check-nr10-curso',
        nr: 'NR-10',
        item: 'Certificação de Instrutores',
        status: 'atencao',
        score: 85,
        detalhes: 'João Silva - Certificação vencendo em 15 dias',
        recomendacao: 'Agendar reciclagem imediatamente',
        prazoCorrecao: '2025-09-15',
        ultimaVerificacao: new Date().toISOString(),
        impacto: 'alto'
      },
      {
        id: 'check-nr12-documentacao',
        nr: 'NR-12',
        item: 'Documentação de Procedimentos',
        status: 'conforme',
        score: 95,
        detalhes: 'Todos os procedimentos documentados e atualizados',
        ultimaVerificacao: new Date().toISOString(),
        impacto: 'medio'
      },
      {
        id: 'check-nr35-permissoes',
        nr: 'NR-35',
        item: 'Sistema de Permissões de Trabalho',
        status: 'conforme',
        score: 97,
        detalhes: 'Sistema digital funcionando perfeitamente',
        ultimaVerificacao: new Date().toISOString(),
        impacto: 'alto'
      }
    ];

    const alerts = [
      {
        id: 'alert-nr10-update-2025',
        tipo: 'atualizacao_nr',
        titulo: 'NR-10 - Nova Interpretação Técnica',
        descricao: 'MTE publicou esclarecimentos sobre trabalhos em proximidade de instalações energizadas',
        urgencia: 'media',
        dataVencimento: '2025-09-30',
        acoes: ['Revisar procedimentos', 'Atualizar treinamentos', 'Comunicar equipes']
      },
      {
        id: 'alert-certificacao-vencimento',
        tipo: 'prazo_vencendo',
        titulo: 'Certificação de Instrutor - João Silva',
        descricao: 'Certificação NR-10 do instrutor João Silva vence em 15 dias',
        urgencia: 'alta',
        dataVencimento: '2025-09-15',
        acoes: ['Contatar instrutor', 'Agendar reciclagem', 'Preparar documentação']
      }
    ];

    // Calcular score geral
    const totalScore = checks.reduce((sum, check) => sum + check.score, 0);
    const complianceScore = Math.round(totalScore / checks.length);

    return NextResponse.json({
      success: true,
      checks,
      alerts,
      complianceScore,
      summary: {
        totalVerificacoes: checks.length,
        conforme: checks.filter(c => c.status === 'conforme').length,
        atencao: checks.filter(c => c.status === 'atencao').length,
        naoConforme: checks.filter(c => c.status === 'nao_conforme').length,
        proximasAcoes: alerts.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Compliance monitor error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch compliance data' },
      { status: 500 }
    );
  }
}

