

/**
 * 🎬 Render Status API - Job Status Tracking
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { jobId } = params;
    
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Simular status baseado no ID
    const jobNumber = parseInt(jobId.split('_')[1] || '0');
    const isCompleted = Date.now() - jobNumber > 10000; // Completa após 10s
    
    const job = {
      id: jobId,
      status: isCompleted ? 'completed' : 'processing',
      progress: isCompleted ? 100 : Math.min(90, Math.floor((Date.now() - jobNumber) / 100)),
      outputUrl: isCompleted ? `/videos/rendered/${jobId}.mp4` : undefined,
      error: null,
      startedAt: new Date(jobNumber).toISOString(),
      estimatedCompletion: new Date(jobNumber + 15000).toISOString()
    };

    return NextResponse.json({
      success: true,
      job
    });

  } catch (error) {
    console.error('Render status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch render status' },
      { status: 500 }
    );
  }
}

