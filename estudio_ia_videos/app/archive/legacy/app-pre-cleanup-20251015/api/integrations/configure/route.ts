
// @ts-nocheck

/**
 * ⚙️ API de Configuração de Integrações
 */

import { NextRequest, NextResponse } from 'next/server';
import { externalIntegrations } from '@/lib/integrations/external-integrations';

export async function POST(request: NextRequest) {
  try {
    const { integrationId, credentials, settings } = await request.json();
    
    const success = await externalIntegrations.configureIntegration(
      integrationId,
      credentials,
      settings
    );
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Falha na configuração' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Erro na configuração:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}
