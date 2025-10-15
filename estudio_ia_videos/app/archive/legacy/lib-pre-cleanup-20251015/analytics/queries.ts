/**
 * Analytics Queries - Queries Otimizadas para Dashboard
 * 
 * Funções para buscar métricas e estatísticas de uso do sistema
 * com suporte a filtros de data e projeto.
 */

import { createClient } from '@/lib/supabase/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

// ==========================================
// TIPOS E INTERFACES
// ==========================================

export interface AnalyticsMetrics {
  totalProjects: number;
  totalUploads: number;
  totalRenders: number;
  totalTTSGenerations: number;
  activeUsers: number;
  storageUsed: number; // em MB
}

export interface DailyStats {
  date: string;
  uploads: number;
  renders: number;
  ttsGenerations: number;
  activeUsers: number;
}

export interface ProjectStats {
  projectId: string;
  projectName: string;
  uploads: number;
  renders: number;
  ttsUsage: number;
  lastActivity: string;
}

export interface RenderStats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  processing: number;
  avgDuration: number; // em segundos
  totalSize: number; // em MB
}

export interface TTSStats {
  totalGenerations: number;
  totalCharacters: number;
  totalCreditsUsed: number;
  providerBreakdown: {
    provider: string;
    count: number;
    characters: number;
    credits: number;
  }[];
  cacheHitRate: number; // porcentagem
}

export interface EventTypeBreakdown {
  eventType: string;
  count: number;
  percentage: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// ==========================================
// MÉTRICAS GERAIS
// ==========================================

/**
 * Busca métricas gerais do sistema
 */
export async function getOverallMetrics(
  userId: string,
  dateRange?: DateRange
): Promise<AnalyticsMetrics> {
  const supabase = createClient();
  
  const startDate = dateRange?.startDate || subDays(new Date(), 30);
  const endDate = dateRange?.endDate || new Date();

  // Total de projetos
  const { count: totalProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Total de uploads
  const { count: totalUploads } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', 'upload_pptx')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  // Total de renders
  const { count: totalRenders } = await supabase
    .from('render_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  // Total de gerações TTS
  const { count: totalTTSGenerations } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', 'tts_generate')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  // Usuários ativos (usuários únicos com eventos no período)
  const { data: activeUsersData } = await supabase
    .from('analytics_events')
    .select('user_id')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  const activeUsers = activeUsersData
    ? new Set(activeUsersData.map((e) => e.user_id)).size
    : 0;

  // Storage usado (soma de tamanhos de arquivos)
  const { data: filesData } = await supabase
    .from('project_files')
    .select('file_size')
    .eq('user_id', userId);

  const storageUsed = filesData
    ? filesData.reduce((sum, file) => sum + (file.file_size || 0), 0) / (1024 * 1024)
    : 0;

  return {
    totalProjects: totalProjects || 0,
    totalUploads: totalUploads || 0,
    totalRenders: totalRenders || 0,
    totalTTSGenerations: totalTTSGenerations || 0,
    activeUsers,
    storageUsed: Math.round(storageUsed * 100) / 100,
  };
}

// ==========================================
// ESTATÍSTICAS DIÁRIAS
// ==========================================

/**
 * Busca estatísticas diárias para gráficos
 */
export async function getDailyStats(
  userId: string,
  days: number = 30
): Promise<DailyStats[]> {
  const supabase = createClient();
  const startDate = subDays(new Date(), days);

  // Buscar eventos agrupados por dia
  const { data: eventsData, error } = await supabase
    .from('analytics_events')
    .select('event_type, created_at, user_id')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error || !eventsData) {
    console.error('Error fetching daily stats:', error);
    return [];
  }

  // Agrupar por data
  const statsByDate: Record<string, DailyStats> = {};

  eventsData.forEach((event) => {
    const date = format(new Date(event.created_at), 'yyyy-MM-dd');
    
    if (!statsByDate[date]) {
      statsByDate[date] = {
        date,
        uploads: 0,
        renders: 0,
        ttsGenerations: 0,
        activeUsers: 0,
      };
    }

    if (event.event_type === 'upload_pptx') {
      statsByDate[date].uploads++;
    } else if (event.event_type === 'render_start') {
      statsByDate[date].renders++;
    } else if (event.event_type === 'tts_generate') {
      statsByDate[date].ttsGenerations++;
    }
  });

  // Calcular usuários ativos por dia
  eventsData.forEach((event) => {
    const date = format(new Date(event.created_at), 'yyyy-MM-dd');
    if (statsByDate[date]) {
      // Incrementar se não contamos este usuário ainda hoje
      const users = new Set<string>();
      eventsData
        .filter((e) => format(new Date(e.created_at), 'yyyy-MM-dd') === date)
        .forEach((e) => users.add(e.user_id));
      statsByDate[date].activeUsers = users.size;
    }
  });

  // Preencher dias sem eventos com zeros
  const result: DailyStats[] = [];
  for (let i = 0; i < days; i++) {
    const date = format(subDays(new Date(), days - i - 1), 'yyyy-MM-dd');
    result.push(
      statsByDate[date] || {
        date,
        uploads: 0,
        renders: 0,
        ttsGenerations: 0,
        activeUsers: 0,
      }
    );
  }

  return result;
}

// ==========================================
// ESTATÍSTICAS POR PROJETO
// ==========================================

/**
 * Busca estatísticas por projeto
 */
export async function getProjectStats(
  userId: string,
  limit: number = 10
): Promise<ProjectStats[]> {
  const supabase = createClient();

  // Buscar projetos do usuário
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, name, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (projectsError || !projects) {
    console.error('Error fetching projects:', projectsError);
    return [];
  }

  // Buscar estatísticas para cada projeto
  const projectStats: ProjectStats[] = await Promise.all(
    projects.map(async (project) => {
      // Uploads
      const { count: uploads } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'upload_pptx')
        .eq('metadata->>projectId', project.id);

      // Renders
      const { count: renders } = await supabase
        .from('render_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id);

      // TTS Usage (soma de créditos)
      const { data: ttsData } = await supabase
        .from('analytics_events')
        .select('metadata')
        .eq('event_type', 'tts_generate')
        .eq('metadata->>projectId', project.id);

      const ttsUsage = ttsData
        ? ttsData.reduce((sum, event) => {
            const credits = event.metadata?.credits || 0;
            return sum + credits;
          }, 0)
        : 0;

      return {
        projectId: project.id,
        projectName: project.name,
        uploads: uploads || 0,
        renders: renders || 0,
        ttsUsage,
        lastActivity: project.updated_at,
      };
    })
  );

  return projectStats;
}

// ==========================================
// ESTATÍSTICAS DE RENDERIZAÇÃO
// ==========================================

/**
 * Busca estatísticas de renderização
 */
export async function getRenderStats(
  userId: string,
  dateRange?: DateRange
): Promise<RenderStats> {
  const supabase = createClient();
  
  const startDate = dateRange?.startDate || subDays(new Date(), 30);
  const endDate = dateRange?.endDate || new Date();

  // Buscar todos os renders do período
  const { data: renders, error } = await supabase
    .from('render_jobs')
    .select('status, created_at, completed_at, output_url')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (error || !renders) {
    console.error('Error fetching render stats:', error);
    return {
      total: 0,
      completed: 0,
      failed: 0,
      pending: 0,
      processing: 0,
      avgDuration: 0,
      totalSize: 0,
    };
  }

  // Contar por status
  const total = renders.length;
  const completed = renders.filter((r) => r.status === 'completed').length;
  const failed = renders.filter((r) => r.status === 'failed').length;
  const pending = renders.filter((r) => r.status === 'pending').length;
  const processing = renders.filter((r) => r.status === 'processing').length;

  // Calcular duração média (apenas completos)
  const completedRenders = renders.filter(
    (r) => r.status === 'completed' && r.completed_at
  );
  const totalDuration = completedRenders.reduce((sum, render) => {
    const start = new Date(render.created_at).getTime();
    const end = new Date(render.completed_at!).getTime();
    return sum + (end - start);
  }, 0);
  const avgDuration = completedRenders.length
    ? Math.round(totalDuration / completedRenders.length / 1000)
    : 0;

  // Calcular tamanho total (estimativa - seria melhor buscar do storage)
  const totalSize = completed * 150; // Estimativa de 150MB por vídeo

  return {
    total,
    completed,
    failed,
    pending,
    processing,
    avgDuration,
    totalSize,
  };
}

// ==========================================
// ESTATÍSTICAS TTS
// ==========================================

/**
 * Busca estatísticas de TTS
 */
export async function getTTSStats(
  userId: string,
  dateRange?: DateRange
): Promise<TTSStats> {
  const supabase = createClient();
  
  const startDate = dateRange?.startDate || subDays(new Date(), 30);
  const endDate = dateRange?.endDate || new Date();

  // Buscar eventos TTS
  const { data: ttsEvents, error } = await supabase
    .from('analytics_events')
    .select('metadata')
    .eq('user_id', userId)
    .eq('event_type', 'tts_generate')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (error || !ttsEvents) {
    console.error('Error fetching TTS stats:', error);
    return {
      totalGenerations: 0,
      totalCharacters: 0,
      totalCreditsUsed: 0,
      providerBreakdown: [],
      cacheHitRate: 0,
    };
  }

  const totalGenerations = ttsEvents.length;

  // Agregar estatísticas
  const totalCharacters = ttsEvents.reduce(
    (sum, event) => sum + (event.metadata?.characters || 0),
    0
  );

  const totalCreditsUsed = ttsEvents.reduce(
    (sum, event) => sum + (event.metadata?.credits || 0),
    0
  );

  // Breakdown por provider
  const providerMap: Record<string, { count: number; characters: number; credits: number }> = {};
  
  ttsEvents.forEach((event) => {
    const provider = event.metadata?.provider || 'unknown';
    if (!providerMap[provider]) {
      providerMap[provider] = { count: 0, characters: 0, credits: 0 };
    }
    providerMap[provider].count++;
    providerMap[provider].characters += event.metadata?.characters || 0;
    providerMap[provider].credits += event.metadata?.credits || 0;
  });

  const providerBreakdown = Object.entries(providerMap).map(([provider, stats]) => ({
    provider,
    ...stats,
  }));

  // Cache hit rate (buscar na tabela tts_cache)
  const { count: cacheHits } = await supabase
    .from('tts_cache')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  const cacheHitRate = totalGenerations > 0
    ? Math.round(((cacheHits || 0) / totalGenerations) * 100)
    : 0;

  return {
    totalGenerations,
    totalCharacters,
    totalCreditsUsed,
    providerBreakdown,
    cacheHitRate,
  };
}

// ==========================================
// BREAKDOWN DE EVENTOS
// ==========================================

/**
 * Busca breakdown de tipos de eventos
 */
export async function getEventTypeBreakdown(
  userId: string,
  dateRange?: DateRange
): Promise<EventTypeBreakdown[]> {
  const supabase = createClient();
  
  const startDate = dateRange?.startDate || subDays(new Date(), 30);
  const endDate = dateRange?.endDate || new Date();

  const { data: events, error } = await supabase
    .from('analytics_events')
    .select('event_type')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (error || !events) {
    console.error('Error fetching event breakdown:', error);
    return [];
  }

  // Contar eventos por tipo
  const eventCounts: Record<string, number> = {};
  events.forEach((event) => {
    eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;
  });

  const total = events.length;

  // Converter para array com porcentagens
  const breakdown = Object.entries(eventCounts).map(([eventType, count]) => ({
    eventType,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));

  // Ordenar por count decrescente
  return breakdown.sort((a, b) => b.count - a.count);
}

// ==========================================
// QUERY DE TENDÊNCIAS
// ==========================================

/**
 * Calcula tendência comparando período atual com anterior
 */
export async function getTrends(
  userId: string,
  days: number = 7
): Promise<{
  uploads: { current: number; previous: number; trend: number };
  renders: { current: number; previous: number; trend: number };
  tts: { current: number; previous: number; trend: number };
}> {
  const supabase = createClient();
  
  const currentStart = subDays(new Date(), days);
  const currentEnd = new Date();
  const previousStart = subDays(currentStart, days);
  const previousEnd = currentStart;

  // Uploads
  const { count: uploadsCurrentCount } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', 'upload_pptx')
    .gte('created_at', currentStart.toISOString())
    .lte('created_at', currentEnd.toISOString());

  const { count: uploadsPreviousCount } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', 'upload_pptx')
    .gte('created_at', previousStart.toISOString())
    .lte('created_at', previousEnd.toISOString());

  const uploadsCurrent = uploadsCurrentCount || 0;
  const uploadsPrevious = uploadsPreviousCount || 0;
  const uploadsTrend = uploadsPrevious > 0
    ? Math.round(((uploadsCurrent - uploadsPrevious) / uploadsPrevious) * 100)
    : 0;

  // Renders
  const { count: rendersCurrentCount } = await supabase
    .from('render_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', currentStart.toISOString())
    .lte('created_at', currentEnd.toISOString());

  const { count: rendersPreviousCount } = await supabase
    .from('render_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', previousStart.toISOString())
    .lte('created_at', previousEnd.toISOString());

  const rendersCurrent = rendersCurrentCount || 0;
  const rendersPrevious = rendersPreviousCount || 0;
  const rendersTrend = rendersPrevious > 0
    ? Math.round(((rendersCurrent - rendersPrevious) / rendersPrevious) * 100)
    : 0;

  // TTS
  const { count: ttsCurrentCount } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', 'tts_generate')
    .gte('created_at', currentStart.toISOString())
    .lte('created_at', currentEnd.toISOString());

  const { count: ttsPreviousCount } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', 'tts_generate')
    .gte('created_at', previousStart.toISOString())
    .lte('created_at', previousEnd.toISOString());

  const ttsCurrent = ttsCurrentCount || 0;
  const ttsPrevious = ttsPreviousCount || 0;
  const ttsTrend = ttsPrevious > 0
    ? Math.round(((ttsCurrent - ttsPrevious) / ttsPrevious) * 100)
    : 0;

  return {
    uploads: { current: uploadsCurrent, previous: uploadsPrevious, trend: uploadsTrend },
    renders: { current: rendersCurrent, previous: rendersPrevious, trend: rendersTrend },
    tts: { current: ttsCurrent, previous: ttsPrevious, trend: ttsTrend },
  };
}
