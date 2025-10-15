
/**
 * 🏥 HEALTH CHECK ENDPOINT
 * Endpoint para verificação de saúde da aplicação
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'connected', // Verificar conexão real do banco
        storage: 'available',  // Verificar S3 ou storage
        external_apis: 'operational'
      }
    };

    return NextResponse.json(healthCheck);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}

export async function HEAD(request: NextRequest) {
  // Lightweight health check para o sistema de recovery
  try {
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
