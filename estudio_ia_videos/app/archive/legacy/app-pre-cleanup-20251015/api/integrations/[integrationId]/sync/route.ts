
// @ts-nocheck

/**
 * 🔄 API de Sincronização de Integração
 */

import { NextRequest, NextResponse } from 'next/server';
import { externalIntegrations } from '@/lib/integrations/external-integrations';

export async function POST(
  request: NextRequest,
  { params }: { params: { integrationId: string } }
) {
  try {
    const { integrationId } = params;
    
    const success = await externalIntegrations.syncMetadata(integrationId);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Falha na sincronização' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
