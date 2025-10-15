
// @ts-nocheck

/**
 * 🔄 API de Geração de Variações
 */

import { NextRequest, NextResponse } from 'next/server';
import { generativeAI } from '@/lib/ai-services/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { baseContent, context, variationType } = await request.json();
    
    const variations = await generativeAI.generateVariations(
      baseContent,
      context,
      variationType
    );
    
    return NextResponse.json({ variations });
  } catch (error) {
    console.error('Erro na geração de variações:', error);
    return NextResponse.json(
      { error: 'Erro interno na geração de variações' },
      { status: 500 }
    );
  }
}
