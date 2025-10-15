import { NextRequest, NextResponse } from 'next/server';

// Mock data para renderização - em um sistema real, conectaria com Remotion/FFmpeg
const renderJobs = new Map();

export async function POST(request: NextRequest) {
  try {
    const { project } = await request.json();
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project data is required' },
        { status: 400 }
      );
    }

    // Validação básica do projeto
    if (!project.tracks || project.tracks.length === 0) {
      return NextResponse.json(
        { error: 'Project must have at least one track' },
        { status: 400 }
      );
    }

    // Gerar ID único para o job de renderização
    const jobId = `render-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Mock render job
    const renderJob = {
      id: jobId,
      projectId: project.id,
      projectName: project.name,
      status: 'queued',
      progress: 0,
      totalFrames: Math.ceil(project.duration * project.fps),
      processedFrames: 0,
      startTime: new Date().toISOString(),
      estimatedDuration: project.duration * 2, // Mock: 2 segundos de processamento por segundo de vídeo
      outputFormat: 'mp4',
      resolution: `${project.width}x${project.height}`,
      fps: project.fps,
      settings: {
        quality: 'high',
        codec: 'h264',
        bitrate: '5000k'
      }
    };

    renderJobs.set(jobId, renderJob);

    // Simular processamento assíncrono
    setTimeout(() => {
      const job = renderJobs.get(jobId);
      if (job) {
        job.status = 'processing';
        renderJobs.set(jobId, job);
        
        // Simular progresso
        const progressInterval = setInterval(() => {
          const currentJob = renderJobs.get(jobId);
          if (currentJob && currentJob.status === 'processing') {
            currentJob.progress += Math.random() * 10;
            currentJob.processedFrames = Math.floor((currentJob.progress / 100) * currentJob.totalFrames);
            
            if (currentJob.progress >= 100) {
              currentJob.progress = 100;
              currentJob.status = 'completed';
              currentJob.endTime = new Date().toISOString();
              currentJob.outputUrl = `/api/render/download/${jobId}`;
              clearInterval(progressInterval);
            }
            
            renderJobs.set(jobId, currentJob);
          } else {
            clearInterval(progressInterval);
          }
        }, 1000);
      }
    }, 2000);

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Render job queued successfully',
      estimatedTime: renderJob.estimatedDuration
    });
  } catch (error) {
    console.error('Error starting render:', error);
    return NextResponse.json(
      { error: 'Failed to start render process' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');
    
    if (jobId) {
      // Retornar status de um job específico
      const job = renderJobs.get(jobId);
      
      if (!job) {
        return NextResponse.json(
          { error: 'Render job not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(job);
    } else {
      // Retornar lista de todos os jobs
      const allJobs = Array.from(renderJobs.values()).sort(
        (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      
      return NextResponse.json({
        jobs: allJobs,
        total: allJobs.length,
        active: allJobs.filter(job => job.status === 'processing' || job.status === 'queued').length,
        completed: allJobs.filter(job => job.status === 'completed').length,
        failed: allJobs.filter(job => job.status === 'failed').length
      });
    }
  } catch (error) {
    console.error('Error getting render status:', error);
    return NextResponse.json(
      { error: 'Failed to get render status' },
      { status: 500 }
    );
  }
}