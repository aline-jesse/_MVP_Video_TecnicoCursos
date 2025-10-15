

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

import { SLOManager } from '@/lib/ga/slo-manager';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'violations') {
      const violations = SLOManager.checkViolations();
      return NextResponse.json({ violations });
    }

    if (action === 'report') {
      const report = SLOManager.generateReport();
      return NextResponse.json(report);
    }

    if (action === 'should-rollback') {
      const shouldRollback = SLOManager.shouldTriggerRollback();
      return NextResponse.json({ shouldRollback });
    }

    // Default: retornar todos os SLOs
    const slos = SLOManager.getSLOs();
    return NextResponse.json({ slos });
  } catch (error) {
    console.error('Error fetching SLOs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SLOs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value } = body;

    await SLOManager.updateSLO(name, value);

    return NextResponse.json({
      success: true,
      message: 'SLO updated successfully',
    });
  } catch (error) {
    console.error('Error updating SLO:', error);
    return NextResponse.json(
      { error: 'Failed to update SLO' },
      { status: 500 }
    );
  }
}
