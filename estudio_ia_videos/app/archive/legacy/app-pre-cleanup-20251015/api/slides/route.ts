
/**
 * API: Create Slide
 * POST /api/slides
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { prisma as db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      projectId,
      title,
      content,
      slideNumber,
      duration,
      transition,
      backgroundType,
      backgroundColor,
      backgroundImage,
      audioText,
      elements,
    } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Create slide
    const slide = await db.slide.create({
      data: {
        projectId,
        title: title || 'Novo Slide',
        content: content || '',
        slideNumber: slideNumber || 1,
        duration: duration || 5,
        transition: transition || 'fade',
        backgroundType: backgroundType || 'solid',
        backgroundColor: backgroundColor || '#FFFFFF',
        backgroundImage,
        audioText,
        elements: elements || {},
      },
    });

    return NextResponse.json({
      success: true,
      slide,
    });

  } catch (error) {
    console.error('[Create Slide] Error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to create slide',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
