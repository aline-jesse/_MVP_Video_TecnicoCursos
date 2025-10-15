/**
 * API de Recomendações Inteligentes
 * 
 * Endpoints para recomendações personalizadas
 */

import { NextRequest, NextResponse } from 'next/server';
import { recommendationSystem, RecommendationType } from '@/app/lib/intelligent-recommendation-system';

/**
 * POST /api/recommendations/generate
 * Gera recomendações personalizadas
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, types } = body as {
      userId: string;
      types?: RecommendationType[];
    };

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    const recommendations = await recommendationSystem.generateRecommendations(
      userId,
      types
    );

    return NextResponse.json({
      success: true,
      recommendations: recommendations.map(rec => ({
        id: rec.id,
        type: rec.type,
        items: rec.items,
        reason: rec.reason,
        confidence: rec.confidence,
        createdAt: rec.createdAt,
        expiresAt: rec.expiresAt,
      })),
    });
  } catch (error) {
    console.error('Generate recommendations error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/recommendations/generate?userId=xxx
 * Obtém recomendações existentes
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const recommendations = recommendationSystem.getUserRecommendations(userId);

    return NextResponse.json({
      success: true,
      recommendations: recommendations.map(rec => ({
        id: rec.id,
        type: rec.type,
        items: rec.items,
        reason: rec.reason,
        confidence: rec.confidence,
        createdAt: rec.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
