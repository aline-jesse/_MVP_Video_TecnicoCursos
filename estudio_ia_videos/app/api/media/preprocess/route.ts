/**
 * API: Media Preprocessor
 * POST /api/media/preprocess
 */

import { NextRequest, NextResponse } from 'next/server';
import { mediaPreprocessor, PreprocessingOptions } from '@/lib/media-preprocessor-real';
import * as fs from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imagePath, options } = body as {
      imagePath: string;
      options?: PreprocessingOptions;
    };

    if (!imagePath) {
      return NextResponse.json(
        { error: 'Image path is required' },
        { status: 400 }
      );
    }

    // Verificar se arquivo existe
    try {
      await fs.access(imagePath);
    } catch {
      return NextResponse.json(
        { error: 'Image file not found' },
        { status: 404 }
      );
    }

    // Processar imagem
    const result = await mediaPreprocessor.processImage(imagePath, options);

    return NextResponse.json({
      success: true,
      data: result,
      stats: mediaPreprocessor.getStats(),
    });

  } catch (error) {
    console.error('Media preprocessing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to preprocess media',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const stats = mediaPreprocessor.getStats();

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error('Error fetching preprocessor stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
