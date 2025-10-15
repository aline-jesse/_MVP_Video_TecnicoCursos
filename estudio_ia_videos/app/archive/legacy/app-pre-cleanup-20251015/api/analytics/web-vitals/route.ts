
import { NextRequest, NextResponse } from 'next/server';


import { WebVitalsTracker } from '@/lib/performance/web-vitals-tracker';




// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value, id, delta, navigationType, deviceType, url, userAgent } = body;

    // Processar vital
    const vital = WebVitalsTracker.processVital(name, value, id, delta, navigationType);

    // Criar relatório
    const report = {
      url: url || request.url,
      deviceType: deviceType || 'desktop',
      vitals: [vital],
      timestamp: new Date(),
      userAgent: userAgent || request.headers.get('user-agent') || 'unknown',
    };

    // Analisar relatório
    const analysis = WebVitalsTracker.analyzeReport(report);

    // Salvar no banco (em produção)
    // await prisma.webVitals.create({ data: { ...report, analysis } });

    return NextResponse.json({
      success: true,
      vital,
      analysis,
    });
  } catch (error) {
    console.error('Error tracking web vital:', error);
    return NextResponse.json(
      { error: 'Failed to track web vital' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const deviceType = (searchParams.get('deviceType') as 'mobile' | 'desktop') || 'desktop';

    if (action === 'analyze') {
      // Mock vitals para demonstração
      const mockVitals = [
        WebVitalsTracker.processVital('LCP', 2300, 'lcp-1'),
        WebVitalsTracker.processVital('CLS', 0.08, 'cls-1'),
        WebVitalsTracker.processVital('INP', 180, 'inp-1'),
      ];

      const report = {
        url: request.url,
        deviceType,
        vitals: mockVitals,
        timestamp: new Date(),
        userAgent: request.headers.get('user-agent') || 'unknown',
      };

      const analysis = WebVitalsTracker.analyzeReport(report);
      const score = WebVitalsTracker.calculateOverallScore(mockVitals);
      const comparison = WebVitalsTracker.compareWithTargets(mockVitals, deviceType);

      return NextResponse.json({
        report,
        analysis,
        score,
        comparison,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in web-vitals API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch web vitals data' },
      { status: 500 }
    );
  }
}
