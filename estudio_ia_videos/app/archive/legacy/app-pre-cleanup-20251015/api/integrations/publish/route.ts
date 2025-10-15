
// @ts-nocheck

/**
 * 📤 API de Publicação de Vídeos
 */

import { NextRequest, NextResponse } from 'next/server';
import { externalIntegrations } from '@/lib/integrations/external-integrations';

export async function POST(request: NextRequest) {
  try {
    const publicationRequest = await request.json();
    
    const results = await externalIntegrations.publishVideo(publicationRequest);
    
    return NextResponse.json({ 
      success: true, 
      results,
      published: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length
    });
  } catch (error) {
    console.error('Erro na publicação:', error);
    return NextResponse.json(
      { error: 'Erro interno na publicação' },
      { status: 500 }
    );
  }
}
