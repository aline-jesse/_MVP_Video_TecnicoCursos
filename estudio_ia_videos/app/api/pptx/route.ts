/**
 * 📄 API PPTX - Upload, Parse e Processamento
 * Sistema completo para gerenciamento de apresentações
 */

import { NextRequest, NextResponse } from 'next/server';
import { PPTXCoreParser } from '@/lib/pptx/pptx-core-parser';
import { PPTXGenerator } from '@/lib/pptx/pptx-generator';
import {
  PPTXDocument,
  PPTXProcessingJob,
  PPTXJobStatus,
  PPTXJobType,
  PPTXProcessingSettings
} from '@/types/pptx-types';

// Sistema de jobs em memória (pode ser substituído por Redis/Database)
const activeJobs = new Map<string, PPTXProcessingJob>();
const processedDocuments = new Map<string, PPTXDocument>();

/**
 * POST - Upload e parse de arquivo PPTX
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const settings = formData.get('settings') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo PPTX não fornecido' },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith('.pptx')) {
      return NextResponse.json(
        { error: 'Formato de arquivo inválido. Apenas PPTX é suportado.' },
        { status: 400 }
      );
    }

    // Converter arquivo para buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Criar job de processamento
    const jobId = generateJobId();
    const job: PPTXProcessingJob = {
      id: jobId,
      documentId: generateDocumentId(),
      type: 'parse',
      status: 'queued',
      progress: 0,
      startedAt: new Date(),
      settings: settings ? JSON.parse(settings) : {}
    };

    activeJobs.set(jobId, job);

    console.log(`[PPTX API] Starting parse job ${jobId} for file: ${file.name}`);

    // Processar arquivo assincronamente
    processFile(jobId, fileBuffer, file.name)
      .catch(error => {
        console.error(`[PPTX API] Error processing ${jobId}:`, error);
        const failedJob = activeJobs.get(jobId);
        if (failedJob) {
          failedJob.status = 'failed';
          failedJob.error = error.message;
          failedJob.completedAt = new Date();
          activeJobs.set(jobId, failedJob);
        }
      });

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Upload realizado com sucesso. Processamento iniciado.',
      estimatedTime: '30-60 segundos'
    });

  } catch (error) {
    console.error('[PPTX API] Upload error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET - Obter status de job ou listar jobs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const jobId = searchParams.get('jobId');
    const documentId = searchParams.get('documentId');

    // Obter status de job específico
    if (action === 'status' && jobId) {
      const job = activeJobs.get(jobId);
      if (!job) {
        return NextResponse.json(
          { error: 'Job não encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        job,
        document: job.status === 'completed' ? processedDocuments.get(job.documentId) : null
      });
    }

    // Obter documento processado
    if (action === 'document' && documentId) {
      const document = processedDocuments.get(documentId);
      if (!document) {
        return NextResponse.json(
          { error: 'Documento não encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json({ document });
    }

    // Listar todos os jobs
    if (action === 'list') {
      const status = searchParams.get('status') as PPTXJobStatus | null;
      let jobs = Array.from(activeJobs.values());

      if (status) {
        jobs = jobs.filter(job => job.status === status);
      }

      // Ordenar por data de criação (mais recentes primeiro)
      jobs.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

      const stats = {
        total: activeJobs.size,
        queued: jobs.filter(j => j.status === 'queued').length,
        processing: jobs.filter(j => j.status === 'processing').length,
        completed: jobs.filter(j => j.status === 'completed').length,
        failed: jobs.filter(j => j.status === 'failed').length
      };

      return NextResponse.json({ jobs, stats });
    }

    // Preview rápido
    if (action === 'preview' && jobId) {
      const job = activeJobs.get(jobId);
      if (!job || job.status !== 'completed') {
        return NextResponse.json(
          { error: 'Job não encontrado ou não completado' },
          { status: 404 }
        );
      }

      const document = processedDocuments.get(job.documentId);
      if (!document) {
        return NextResponse.json(
          { error: 'Documento não encontrado' },
          { status: 404 }
        );
      }

      // Retornar preview simplificado
      const preview = {
        id: document.id,
        title: document.title,
        slideCount: document.slides.length,
        author: document.author,
        createdAt: document.metadata.createdAt,
        slides: document.slides.slice(0, 5).map(slide => ({
          slideNumber: slide.slideNumber,
          title: slide.title,
          contentPreview: slide.content
            .filter(el => el.type === 'text')
            .map(el => typeof el.content === 'string' ? el.content.substring(0, 100) : '')
            .join(' ')
            .substring(0, 200) + '...'
        }))
      };

      return NextResponse.json({ preview });
    }

    return NextResponse.json(
      { error: 'Ação não especificada ou inválida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[PPTX API] GET error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Cancelar job ou remover documento
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const documentId = searchParams.get('documentId');

    if (jobId) {
      const job = activeJobs.get(jobId);
      if (!job) {
        return NextResponse.json(
          { error: 'Job não encontrado' },
          { status: 404 }
        );
      }

      if (job.status === 'processing') {
        job.status = 'cancelled';
        job.completedAt = new Date();
        activeJobs.set(jobId, job);
      } else {
        activeJobs.delete(jobId);
      }

      console.log(`[PPTX API] Job ${jobId} cancelled/removed`);
      return NextResponse.json({ success: true, message: 'Job removido' });
    }

    if (documentId) {
      const document = processedDocuments.get(documentId);
      if (!document) {
        return NextResponse.json(
          { error: 'Documento não encontrado' },
          { status: 404 }
        );
      }

      processedDocuments.delete(documentId);
      console.log(`[PPTX API] Document ${documentId} removed`);
      return NextResponse.json({ success: true, message: 'Documento removido' });
    }

    return NextResponse.json(
      { error: 'ID do job ou documento não fornecido' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[PPTX API] DELETE error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Processar arquivo PPTX
 */
async function processFile(
  jobId: string,
  fileBuffer: Buffer,
  filename: string
): Promise<void> {
  const job = activeJobs.get(jobId);
  if (!job) throw new Error('Job não encontrado');

  try {
    // Atualizar status para processamento
    job.status = 'processing';
    job.progress = 10;
    activeJobs.set(jobId, job);

    // Criar parser
    const parser = new PPTXCoreParser(jobId);
    
    // Processar arquivo com callback de progresso
    const document = await parser.parseFile(fileBuffer, filename, (progress) => {
      job.progress = Math.round(10 + (progress * 80)); // 10-90%
      activeJobs.set(jobId, job);
    });

    // Armazenar documento processado
    processedDocuments.set(job.documentId, document);

    // Finalizar job
    job.status = 'completed';
    job.progress = 100;
    job.completedAt = new Date();
    job.result = {
      outputUrl: `/api/pptx/document/${job.documentId}`,
      metadata: {
        slideCount: document.slides.length,
        title: document.title,
        author: document.author
      },
      stats: {
        slideCount: document.slides.length,
        elementCount: document.slides.reduce((acc, slide) => acc + slide.content.length, 0),
        imageCount: document.slides.reduce((acc, slide) => 
          acc + slide.content.filter(el => el.type === 'image').length, 0),
        animationCount: 0, // TODO: Implementar contagem de animações
        processingTime: Date.now() - job.startedAt.getTime(),
        outputSize: 0 // TODO: Calcular tamanho
      }
    };

    activeJobs.set(jobId, job);
    console.log(`[PPTX API] Job ${jobId} completed successfully`);

  } catch (error) {
    console.error(`[PPTX API] Processing error for job ${jobId}:`, error);
    
    job.status = 'failed';
    job.error = error.message;
    job.completedAt = new Date();
    activeJobs.set(jobId, job);
    
    throw error;
  }
}

/**
 * Utilitários
 */
function generateJobId(): string {
  return `pptx_job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateDocumentId(): string {
  return `pptx_doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}