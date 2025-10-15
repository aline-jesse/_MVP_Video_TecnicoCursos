
// @ts-nocheck

/**
 * ⚡ API de Otimização de Conteúdo
 */

import { NextRequest, NextResponse } from 'next/server';
import { generativeAI } from '@/lib/ai-services/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { content, context, goals } = await request.json();
    
    const result = await generativeAI.optimizeContent(content, context, goals);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na otimização:', error);
    return NextResponse.json(
      { error: 'Erro interno na otimização de conteúdo' },
      { status: 500 }
    );
  }
}
