
/**
 * API: Start Video Render
 * Background job with progress tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRenderAuth, RenderAuthContext } from '@/lib/auth/render-auth';
import { prisma, withDatabaseRetry } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return withRenderAuth(request, async (request: NextRequest, context: RenderAuthContext) => {
    try {

    const body = await request.json();
    const { projectId, config } = body;

    // Validate input
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // In test mode, create a mock project if database is unavailable
    let project;
    if (context.isTestMode) {
      try {
        project = await withDatabaseRetry(async () => {
          return await prisma.project.findUnique({
            where: { id: projectId },
            include: { slides: true }
          });
        });
      } catch (error) {
        console.log('[Render] Database unavailable in test mode, using mock project');
        // Create mock project for testing
        project = {
          id: projectId,
          userId: context.user?.id || 'test-user',
          slides: body.slides || [
            { id: 'slide1', title: 'Test Slide', content: 'Test content' }
          ]
        };
      }
    } else {
      project = await withDatabaseRetry(async () => {
        return await prisma.project.findUnique({
          where: { id: projectId },
          include: { slides: true }
        });
      });
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify ownership (skip in test mode)
    if (!context.isTestMode && project.userId !== context.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Validate slides
    if (!project.slides || project.slides.length === 0) {
      return NextResponse.json(
        { error: 'Project has no slides' },
        { status: 400 }
      );
    }

    console.log(`[Render] Starting render job for project ${projectId}`);
    console.log(`[Render] Slides: ${project.slides.length}`);
    console.log(`[Render] Config:`, config);

    // Create render job in database with retry (or mock in test mode)
    let renderJob;
    if (context.isTestMode) {
      try {
        renderJob = await withDatabaseRetry(async () => {
          return await prisma.renderJob.create({
            data: {
              userId: context.user?.id || 'anonymous',
              type: 'video_export',
              status: 'queued',
              progress: 0,
              inputData: {
                projectId,
                config: config || {},
                testMode: context.isTestMode
              }
            }
          });
        });
      } catch (error) {
        console.log('[Render] Database unavailable in test mode, using mock render job');
        // Create mock render job for testing
        renderJob = {
          id: `test-job-${Date.now()}`,
          userId: context.user?.id || 'anonymous',
          type: 'video_export',
          status: 'queued',
          progress: 0,
          inputData: {
            projectId,
            config: config || {},
            testMode: context.isTestMode
          }
        };
      }
    } else {
      renderJob = await withDatabaseRetry(async () => {
        return await prisma.renderJob.create({
          data: {
            userId: context.user?.id || 'anonymous',
            type: 'video_export',
            status: 'queued',
            progress: 0,
            inputData: {
              projectId,
              config: config || {},
              testMode: context.isTestMode
            }
          }
        });
      });
    }

    // Start render in background (no await)
    startRenderJob(renderJob.id, project, config).catch(error => {
      console.error(`[Render] Job ${renderJob.id} failed:`, error);
      
      // Update job status
      prisma.renderJob.update({
        where: { id: renderJob.id },
        data: {
          status: 'error',
          errorMessage: error.message
        }
      }).catch(console.error);
    });

    return NextResponse.json({
      success: true,
      jobId: renderJob.id,
      message: 'Render job started'
    });

    } catch (error: any) {
      console.error('[Render] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

/**
 * GET: Check render job status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // Test endpoint - no auth required
    if (action === 'test') {
      return NextResponse.json({
        success: true,
        message: 'Render Start API is working!',
        endpoint: '/api/render/start?action=test',
        timestamp: new Date().toISOString(),
        status: 'operational',
        requiresAuth: true,
        note: 'Use POST with valid session to start render jobs'
      });
    }

    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const job = await prisma.renderJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      videoUrl: job.outputData ? (job.outputData as any).videoUrl : null,
      error: job.errorMessage,
      createdAt: job.createdAt,
      completedAt: job.completedAt
    });

  } catch (error: any) {
    console.error('[Render] Error checking status:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Background render job
 */
async function startRenderJob(jobId: string, project: any, config: any) {
  const { getRenderService } = await import('@/lib/render/ffmpeg-render-service');
  const renderService = getRenderService();

  try {
    // Update status to rendering
    await prisma.renderJob.update({
      where: { id: jobId },
      data: { 
        status: 'processing',
        startedAt: new Date()
      }
    });

    // Setup progress callback
    renderService.setProgressCallback(async (progress) => {
      await prisma.renderJob.update({
        where: { id: jobId },
        data: {
          progress: progress.progress,
          currentStep: progress.message
        }
      });
    });

    // Prepare slides for rendering
    const slides = project.slides.map((slide: any) => ({
      id: slide.id,
      imageUrl: slide.backgroundImage || '/placeholder-slide.jpg',
      audioUrl: slide.audioUrl,
      duration: slide.duration || 5,
      transition: slide.transition || 'fade',
      transitionDuration: 0.5
    }));

    // Default config
    const renderConfig = {
      width: config?.width || 1920,
      height: config?.height || 1080,
      fps: config?.fps || 30,
      quality: config?.quality || 'high',
      format: config?.format || 'mp4',
      codec: config?.codec || 'h264',
      audioCodec: config?.audioCodec || 'aac',
      ...config
    };

    // Render video
    const { videoUrl, duration } = await renderService.renderVideo(slides, renderConfig);

    // Update job with success
    await prisma.renderJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        progress: 100,
        outputData: {
          videoUrl,
          duration
        },
        completedAt: new Date(),
        processingTime: Math.floor((Date.now() - (project.createdAt?.getTime() || Date.now())) / 1000)
      }
    });

    console.log(`✅ Render job ${jobId} completed successfully`);

  } catch (error: any) {
    console.error(`❌ Render job ${jobId} failed:`, error);
    
    await prisma.renderJob.update({
      where: { id: jobId },
      data: {
        status: 'error',
        errorMessage: error.message,
        completedAt: new Date()
      }
    });
    
    throw error;
  }
}
