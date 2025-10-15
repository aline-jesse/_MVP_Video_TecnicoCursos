
// @ts-nocheck

/**
 * 🔍 API de Análise de Conteúdo
 */

import { NextRequest, NextResponse } from 'next/server';
import { generativeAI } from '@/lib/ai-services/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { content, context } = await request.json();
    
    const analysis = await generativeAI.analyzeContent(content, context);
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Erro na análise:', error);
    return NextResponse.json(
      { error: 'Erro interno na análise de conteúdo' },
      { status: 500 }
    );
  }
}
