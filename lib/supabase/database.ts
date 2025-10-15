import { supabase } from './client';
import { supabaseAdmin } from './server';
import { RealtimeChannel } from '@supabase/supabase-js';

// Funções para gerenciar cursos
export const getCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getCourseById = async (id: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*, videos(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

// Funções para gerenciar vídeos
export const getVideosByCourseId = async (courseId: string) => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const getVideoById = async (id: string) => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

// Funções para gerenciar progresso do usuário
export const getUserProgress = async (userId: string, videoId: string) => {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('video_id', videoId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // Ignora erro de não encontrado
  return data;
};

export const updateUserProgress = async (
  userId: string,
  videoId: string,
  progressPercentage: number,
  completed: boolean
) => {
  const now = new Date().toISOString();
  
  // Verifica se já existe um registro de progresso
  const existingProgress = await getUserProgress(userId, videoId);
  
  if (existingProgress) {
    // Atualiza o registro existente
    const { error } = await supabase
      .from('user_progress')
      .update({
        progress_percentage: progressPercentage,
        completed,
        last_watched_at: now,
        updated_at: now,
      })
      .eq('id', existingProgress.id);
    
    if (error) throw error;
  } else {
    // Cria um novo registro
    const { error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        video_id: videoId,
        progress_percentage: progressPercentage,
        completed,
        last_watched_at: now,
        created_at: now,
      });
    
    if (error) throw error;
  }
  
  return { success: true };
};

// Funções para tempo real (realtime)
export const subscribeToUserProgress = (
  userId: string,
  callback: (payload: any) => void
): RealtimeChannel => {
  return supabase
    .channel('user_progress_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_progress',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

// Função para obter estatísticas do usuário
export const getUserStats = async (userId: string) => {
  const { data, error } = await supabase
    .rpc('get_user_course_stats', { user_id: userId });
  
  if (error) throw error;
  return data;
};