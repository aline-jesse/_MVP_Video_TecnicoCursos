
// @ts-nocheck

/**
 * 📋 API de Lista de Integrações
 */

import { NextRequest, NextResponse } from 'next/server';
import { externalIntegrations } from '@/lib/integrations/external-integrations';

export async function GET() {
  try {
    const integrations = externalIntegrations.getIntegrations();
    return NextResponse.json({ integrations });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
