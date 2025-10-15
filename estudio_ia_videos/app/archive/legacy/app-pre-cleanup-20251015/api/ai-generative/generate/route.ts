
// @ts-nocheck

/**
 * 🤖 API de Geração de Conteúdo com IA
 */

import { NextRequest, NextResponse } from 'next/server';
import { generativeAI } from '@/lib/ai-services/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await generativeAI.generateScript(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na geração:', error);
    return NextResponse.json(
      { error: 'Erro interno na geração de conteúdo' },
      { status: 500 }
    );
  }
}
