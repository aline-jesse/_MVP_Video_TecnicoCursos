/**
 * API: Intelligent Watermark
 * POST /api/media/watermark
 */

import { NextRequest, NextResponse } from 'next/server';
import { watermarkSystem, WatermarkConfig } from '@/lib/watermark-intelligent-real';
import * as fs from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imagePath, config } = body as {
      imagePath: string;
      config: WatermarkConfig;
    };

    if (!imagePath) {
      return NextResponse.json(
        { error: 'Image path is required' },
        { status: 400 }
      );
    }

    if (!config.logoPath) {
      return NextResponse.json(
        { error: 'Watermark logo path is required' },
        { status: 400 }
      );
    }

    // Verificar se arquivos existem
    try {
      await fs.access(imagePath);
      await fs.access(config.logoPath);
    } catch {
      return NextResponse.json(
        { error: 'Image or logo file not found' },
        { status: 404 }
      );
    }

    // Aplicar watermark
    const result = await watermarkSystem.applyWatermark(imagePath, config);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Watermark error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to apply watermark',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
