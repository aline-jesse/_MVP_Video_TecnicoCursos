/**
 * 🔔 Render Notifications API
 * Endpoint para gerenciar notificações de status de render jobs
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { jobId, status, progress, errorMessage, outputVideoUrl } = await req.json();

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID é obrigatório' },
        { status: 400 }
      );
    }

    // Atualizar status do job no Supabase
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (progress !== undefined) {
      updateData.progress_percentage = progress;
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

    if (status === 'processing') {
      updateData.started_at = new Date().toISOString();
    }

    const { data, error } = await supabaseClient
      .from('render_jobs')
      .update(updateData)
      .eq('id', jobId)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao atualizar job:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar status do job' },
        { status: 500 }
      );
    }

    // Enviar notificação em tempo real via broadcast
    const notificationData = {
      type: 'render_status_update',
      jobId,
      status,
      progress,
      timestamp: new Date().toISOString(),
      data: {
        job: data,
        errorMessage,
        outputVideoUrl
      }
    };

    // Broadcast para o canal específico do usuário
    const { error: broadcastError } = await supabaseClient
      .channel(`user_${data.user_id}`)
      .send({
        type: 'broadcast',
        event: 'render_notification',
        payload: notificationData
      });

    if (broadcastError) {
      console.error('Erro ao enviar broadcast:', broadcastError);
    }

    return NextResponse.json({
      success: true,
      message: 'Status atualizado e notificação enviada',
      data: notificationData
    });

  } catch (error) {
    console.error('Erro no endpoint de notificações:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar jobs ativos do usuário
    const { data: jobs, error } = await supabaseClient
      .from('render_jobs')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar jobs:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        activeJobs: jobs,
        count: jobs.length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar jobs ativos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}