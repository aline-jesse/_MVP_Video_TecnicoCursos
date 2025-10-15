
/**
 * ☁️ API Cloud Native Cluster Status - Sprint 9
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Simular status do cluster Kubernetes
    const clusterStatus = {
      nodes: [
        {
          name: 'node-master-001',
          status: 'Ready',
          roles: ['control-plane', 'master'],
          version: 'v1.28.3',
          cpu: '4 cores',
          memory: '16Gi',
          pods: '12/110',
          conditions: {
            ready: true,
            memoryPressure: false,
            diskPressure: false,
            pidPressure: false
          }
        },
        {
          name: 'node-worker-002',
          status: 'Ready',
          roles: ['worker'],
          version: 'v1.28.3',
          cpu: '4 cores',
          memory: '16Gi',
          pods: '15/110',
          conditions: {
            ready: true,
            memoryPressure: false,
            diskPressure: false,
            pidPressure: false
          }
        },
        {
          name: 'node-worker-003',
          status: 'Ready',
          roles: ['worker'],
          version: 'v1.28.3',
          cpu: '4 cores',
          memory: '16Gi',
          pods: '8/110',
          conditions: {
            ready: true,
            memoryPressure: false,
            diskPressure: false,
            pidPressure: false
          }
        }
      ],
      overall: {
        health: 'healthy',
        version: 'v1.28.3',
        uptime: '15d 4h 32m',
        totalNodes: 3,
        readyNodes: 3,
        totalPods: 35,
        runningPods: 35,
        failedPods: 0
      },
      resources: {
        cpu: {
          total: '12 cores',
          used: '8.5 cores',
          percentage: 70.8
        },
        memory: {
          total: '48Gi',
          used: '32Gi',
          percentage: 66.7
        },
        storage: {
          total: '1.5Ti',
          used: '680Gi',
          percentage: 45.3
        }
      },
      networking: {
        cni: 'Calico',
        serviceSubnet: '10.96.0.0/12',
        podSubnet: '192.168.0.0/16',
        dnsProvider: 'CoreDNS'
      }
    };

    return NextResponse.json(clusterStatus);
  } catch (error) {
    console.error('Erro ao buscar status do cluster:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
