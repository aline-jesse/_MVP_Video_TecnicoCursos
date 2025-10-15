/**
 * 🔔 Sistema de Notificações de Render
 * Integração entre render queue e notificações em tempo real
 */

import { supabase } from '@/lib/supabase/client';

export interface RenderNotificationData {
  jobId: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  errorMessage?: string;
  outputVideoUrl?: string;
  metadata?: any;
}

/**
 * Atualiza status do render job e envia notificação
 */
export async function updateRenderJobStatus(data: RenderNotificationData): Promise<void> {
  try {
    const { jobId, userId, status, progress, errorMessage, outputVideoUrl, metadata } = data;

    // Preparar dados de atualização
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (progress !== undefined) {
      updateData.progress_percentage = progress;
    }

    if (status === 'processing') {
      updateData.started_at = new Date().toISOString();
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      if (outputVideoUrl) {
        updateData.output_video_url = outputVideoUrl;
      }
    }

    if (status === 'failed' && errorMessage) {
      updateData.error_message = errorMessage;
    }

    if (metadata) {
      updateData.output_metadata = metadata;
    }

    // Atualizar no Supabase
    const { data: updatedJob, error } = await supabase
      .from('render_jobs')
      .update(updateData)
      .eq('id', jobId)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao atualizar render job:', error);
      return;
    }

    // Enviar notificação em tempo real
    await sendRenderNotification({
      type: 'render_status_update',
      jobId,
      userId,
      status,
      progress,
      timestamp: new Date().toISOString(),
      data: {
        job: updatedJob,
        errorMessage,
        outputVideoUrl,
        metadata
      }
    });

    console.log(`✅ [RenderNotifications] Status atualizado: ${jobId} -> ${status}`);

  } catch (error) {
    console.error('❌ [RenderNotifications] Erro ao atualizar status:', error);
  }
}

/**
 * Envia notificação em tempo real via Supabase
 */
export async function sendRenderNotification(notification: any): Promise<void> {
  try {
    // Enviar via broadcast para o canal do usuário
    const { error } = await supabase
      .channel(`user_${notification.userId}`)
      .send({
        type: 'broadcast',
        event: 'render_notification',
        payload: notification
      });

    if (error) {
      console.error('Erro ao enviar broadcast:', error);
    }

    // Também enviar via API para conexões SSE ativas
    try {
      await fetch('/api/render/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: notification.userId,
          notification
        })
      });
    } catch (apiError) {
      console.error('Erro ao enviar via API SSE:', apiError);
    }

  } catch (error) {
    console.error('❌ [RenderNotifications] Erro ao enviar notificação:', error);
  }
}

/**
 * Cria um novo render job no Supabase
 */
export async function createRenderJob(data: {
  userId: string;
  avatarModelId?: string;
  voiceProfileId?: string;
  scriptText: string;
  quality?: 'standard' | 'high' | 'ultra';
  resolution?: '720p' | '1080p' | '4k';
  enableAudio2face?: boolean;
  enableRealTimeLipsync?: boolean;
  metadata?: any;
}): Promise<string | null> {
  try {
    const { data: newJob, error } = await supabase
      .from('render_jobs')
      .insert({
        user_id: data.userId,
        avatar_model_id: data.avatarModelId,
        voice_profile_id: data.voiceProfileId,
        script_text: data.scriptText,
        quality: data.quality || 'standard',
        resolution: data.resolution || '1080p',
        enable_audio2face: data.enableAudio2face || false,
        enable_real_time_lipsync: data.enableRealTimeLipsync || false,
        status: 'pending',
        progress_percentage: 0,
        output_metadata: data.metadata || {}
      })
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao criar render job:', error);
      return null;
    }

    // Enviar notificação de job criado
    await sendRenderNotification({
      type: 'render_job_created',
      jobId: newJob.id,
      userId: data.userId,
      status: 'pending',
      timestamp: new Date().toISOString(),
      data: {
        job: newJob
      }
    });

    console.log(`✅ [RenderNotifications] Render job criado: ${newJob.id}`);
    return newJob.id;

  } catch (error) {
    console.error('❌ [RenderNotifications] Erro ao criar render job:', error);
    return null;
  }
}

/**
 * Busca render jobs ativos do usuário
 */
export async function getUserActiveRenderJobs(userId: string): Promise<any[]> {
  try {
    const { data: jobs, error } = await supabase
      .from('render_jobs')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar render jobs ativos:', error);
      return [];
    }

    return jobs || [];

  } catch (error) {
    console.error('❌ [RenderNotifications] Erro ao buscar jobs ativos:', error);
    return [];
  }
}

/**
 * Atualiza progresso de um render job
 */
export async function updateRenderProgress(
  jobId: string, 
  userId: string, 
  progress: number, 
  statusMessage?: string
): Promise<void> {
  await updateRenderJobStatus({
    jobId,
    userId,
    status: 'processing',
    progress,
    metadata: statusMessage ? { statusMessage } : undefined
  });
}

/**
 * Marca render job como concluído
 */
export async function completeRenderJob(
  jobId: string,
  userId: string,
  outputVideoUrl: string,
  metadata?: any
): Promise<void> {
  await updateRenderJobStatus({
    jobId,
    userId,
    status: 'completed',
    progress: 100,
    outputVideoUrl,
    metadata
  });
}

/**
 * Marca render job como falhou
 */
export async function failRenderJob(
  jobId: string,
  userId: string,
  errorMessage: string
): Promise<void> {
  await updateRenderJobStatus({
    jobId,
    userId,
    status: 'failed',
    errorMessage
  });
}