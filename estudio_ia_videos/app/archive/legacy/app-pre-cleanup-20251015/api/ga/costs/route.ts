

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

import { CostMonitor } from '@/lib/ga/cost-monitor';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Simular dados de métricas (em produção, buscar do banco/métricas reais)
    const mockMetrics = {
      workers: {
        totalJobs: 1500,
        totalMinutes: 8400,
        avgConcurrency: 12,
      },
      tts: {
        elevenlabs_characters: 250000,
        azure_characters: 180000,
        google_characters: 0,
      },
      storage: {
        totalGB: 450,
        bandwidth_GB: 1200,
        requests: 850000,
      },
      cdn: {
        bandwidth_GB: 2500,
        requests: 1200000,
      },
    };

    if (action === 'dashboard') {
      const costs = [
        CostMonitor.calculateWorkerCosts(mockMetrics.workers),
        ...CostMonitor.calculateTTSCosts(mockMetrics.tts),
        CostMonitor.calculateStorageCosts(mockMetrics.storage),
        CostMonitor.calculateCDNCosts(mockMetrics.cdn),
      ];

      const dashboard = CostMonitor.generateCostDashboard(costs);
      return NextResponse.json(dashboard);
    }

    if (action === 'projection') {
      const costs = [
        CostMonitor.calculateWorkerCosts(mockMetrics.workers),
        ...CostMonitor.calculateTTSCosts(mockMetrics.tts),
        CostMonitor.calculateStorageCosts(mockMetrics.storage),
        CostMonitor.calculateCDNCosts(mockMetrics.cdn),
      ];

      const projection = CostMonitor.projectMonthlyCosts(costs);
      return NextResponse.json(projection);
    }

    if (action === 'alerts') {
      const costs = [
        CostMonitor.calculateWorkerCosts(mockMetrics.workers),
        ...CostMonitor.calculateTTSCosts(mockMetrics.tts),
        CostMonitor.calculateStorageCosts(mockMetrics.storage),
        CostMonitor.calculateCDNCosts(mockMetrics.cdn),
      ];

      const alerts = CostMonitor.checkCostAlerts(costs);
      return NextResponse.json({ alerts });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in costs API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cost data' },
      { status: 500 }
    );
  }
}
