
// @ts-nocheck

/**
 * 📊 API de Estatísticas de Integrações
 */

import { NextRequest, NextResponse } from 'next/server';
import { externalIntegrations } from '@/lib/integrations/external-integrations';

export async function GET() {
  try {
    const stats = externalIntegrations.getPublicationStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
