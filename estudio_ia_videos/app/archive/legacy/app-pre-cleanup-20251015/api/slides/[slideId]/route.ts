
/**
 * API: Slide Operations
 * DELETE /api/slides/[slideId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { prisma as db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slideId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { slideId } = params;

    // Delete slide
    await db.slide.delete({
      where: { id: slideId },
    });

    return NextResponse.json({
      success: true,
      message: 'Slide deleted successfully',
    });

  } catch (error) {
    console.error('[Delete Slide] Error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to delete slide',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
