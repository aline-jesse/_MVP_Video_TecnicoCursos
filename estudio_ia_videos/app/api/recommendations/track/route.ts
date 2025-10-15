/**
 * API de Tracking de Interações com Recomendações
 * 
 * Endpoint para registrar interações do usuário
 */

import { NextRequest, NextResponse } from 'next/server';
import { recommendationSystem } from '@/app/lib/intelligent-recommendation-system';

/**
 * POST /api/recommendations/track
 * Registra interação com recomendação
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, recommendationId, itemId, action } = body as {
      userId: string;
      recommendationId: string;
      itemId: string;
      action: 'view' | 'click' | 'dismiss' | 'apply';
    };

    if (!userId || !recommendationId || !itemId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, recommendationId, itemId, action' },
        { status: 400 }
      );
    }

    const validActions = ['view', 'click', 'dismiss', 'apply'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    await recommendationSystem.trackInteraction(
      userId,
      recommendationId,
      itemId,
      action
    );

    return NextResponse.json({
      success: true,
      message: 'Interaction tracked successfully',
    });
  } catch (error) {
    console.error('Track interaction error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to track interaction' },
      { status: 500 }
    );
  }
}
