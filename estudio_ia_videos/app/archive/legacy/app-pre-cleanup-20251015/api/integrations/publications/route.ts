
// @ts-nocheck

/**
 * 📤 API de Histórico de Publicações
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data para demonstração
    const publications = [
      {
        id: 'pub_001',
        metadata: {
          title: 'Treinamento NR-10 - Segurança Elétrica',
          description: 'Curso completo sobre segurança em instalações elétricas'
        },
        targets: ['youtube-corporate', 'moodle-lms'],
        status: 'completed',
        results: [
          {
            integrationId: 'youtube-corporate',
            status: 'success',
            url: 'https://youtube.com/watch?v=demo123',
            publishedAt: new Date(Date.now() - 86400000)
          },
          {
            integrationId: 'moodle-lms',
            status: 'success',
            url: 'https://lms.empresa.com/course/123',
            publishedAt: new Date(Date.now() - 86400000)
          }
        ]
      },
      {
        id: 'pub_002',
        metadata: {
          title: 'Procedimentos de Emergência',
          description: 'Como agir em situações de emergência no trabalho'
        },
        targets: ['vimeo-business'],
        status: 'completed',
        results: [
          {
            integrationId: 'vimeo-business',
            status: 'success',
            url: 'https://vimeo.com/demo456',
            publishedAt: new Date(Date.now() - 172800000)
          }
        ]
      }
    ];

    return NextResponse.json({ publications });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
