/**
 * 📊 Timeline Analytics API - Detailed Usage Statistics
 * Sprint 44 - Analytics and insights for timeline usage
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';

/**
 * GET - Get analytics for timeline
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const type = searchParams.get('type') || 'summary';

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: 'projectId é obrigatório' },
        { status: 400 }
      );
    }

    // Verify project access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    const timeline = await prisma.timeline.findUnique({
      where: { projectId },
    });

    if (!timeline) {
      return NextResponse.json(
        { success: false, message: 'Timeline não encontrada' },
        { status: 404 }
      );
    }

    let analytics: any = {};

    switch (type) {
      case 'summary':
        analytics = await getTimelineSummary(timeline, projectId);
        break;

      case 'usage':
        analytics = await getUsageStats(projectId);
        break;

      case 'performance':
        analytics = await getPerformanceMetrics(timeline);
        break;

      case 'editing_patterns':
        analytics = await getEditingPatterns(projectId);
        break;

      default:
        return NextResponse.json(
          { success: false, message: `Tipo de analytics desconhecido: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: analytics,
    });

  } catch (error: any) {
    console.error('❌ Erro ao gerar analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao gerar analytics', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Timeline Summary Analytics
 */
async function getTimelineSummary(timeline: any, projectId: string) {
  const tracks = timeline.tracks || [];
  
  // Calculate basic metrics
  const totalClips = tracks.reduce((sum: number, track: any) => 
    sum + (track.clips?.length || 0), 0
  );

  const trackTypes = tracks.reduce((acc: any, track: any) => {
    acc[track.type] = (acc[track.type] || 0) + 1;
    return acc;
  }, {});

  const avgClipsPerTrack = tracks.length > 0 ? totalClips / tracks.length : 0;

  const totalKeyframes = tracks.reduce((sum: number, track: any) => 
    sum + (track.keyframes?.length || 0), 0
  );

  // Get snapshot count
  const snapshotCount = await prisma.timelineSnapshot.count({
    where: { timeline: { projectId } },
  });

  return {
    overview: {
      version: timeline.version,
      totalDuration: timeline.totalDuration,
      tracksCount: tracks.length,
      clipsCount: totalClips,
      keyframesCount: totalKeyframes,
      snapshotsCount: snapshotCount,
    },
    trackDistribution: trackTypes,
    averages: {
      clipsPerTrack: Math.round(avgClipsPerTrack * 100) / 100,
      keyframesPerTrack: tracks.length > 0 
        ? Math.round((totalKeyframes / tracks.length) * 100) / 100 
        : 0,
    },
    settings: timeline.settings || {},
    lastUpdated: timeline.updatedAt,
  };
}

/**
 * Usage Statistics
 */
async function getUsageStats(projectId: string) {
  // Get timeline history
  const timeline = await prisma.timeline.findUnique({
    where: { projectId },
  });

  if (!timeline) {
    return {};
  }

  const snapshots = await prisma.timelineSnapshot.findMany({
    where: { timelineId: timeline.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // Calculate edit frequency
  const editTimes = snapshots.map((s: any) => s.createdAt.getTime());
  const intervals = editTimes.slice(1).map((time: number, i: number) => 
    editTimes[i] - time
  );

  const avgEditInterval = intervals.length > 0
    ? intervals.reduce((sum: number, int: number) => sum + int, 0) / intervals.length
    : 0;

  // Get unique editors
  const uniqueEditors = new Set(snapshots.map((s: any) => s.createdBy));

  // Calculate version growth
  const versionChanges = snapshots.map((s: any, i: number) => ({
    version: s.version,
    timestamp: s.createdAt,
    changeSize: i < snapshots.length - 1 
      ? Math.abs(s.version - snapshots[i + 1].version) 
      : 0,
  }));

  return {
    totalEdits: snapshots.length,
    uniqueEditors: uniqueEditors.size,
    currentVersion: timeline.version,
    averageEditInterval: Math.round(avgEditInterval / 1000 / 60), // minutes
    editHistory: versionChanges.slice(0, 10),
    firstEdit: snapshots[snapshots.length - 1]?.createdAt,
    lastEdit: snapshots[0]?.createdAt,
  };
}

/**
 * Performance Metrics
 */
async function getPerformanceMetrics(timeline: any) {
  const tracks = timeline.tracks || [];
  
  // Calculate complexity score
  const totalElements = tracks.reduce((sum: number, track: any) => 
    sum + (track.clips?.length || 0) + (track.keyframes?.length || 0) + (track.effects?.length || 0), 
    0
  );

  let complexityScore = 0;
  if (totalElements < 50) complexityScore = 1; // Low
  else if (totalElements < 150) complexityScore = 2; // Medium
  else if (totalElements < 300) complexityScore = 3; // High
  else complexityScore = 4; // Very High

  // Analyze clip durations
  const allClips = tracks.flatMap((track: any) => track.clips || []);
  const clipDurations = allClips.map((clip: any) => clip.duration || 0);
  const avgClipDuration = clipDurations.length > 0
    ? clipDurations.reduce((sum: number, dur: number) => sum + dur, 0) / clipDurations.length
    : 0;

  // Check for overlaps (performance issue)
  let overlapCount = 0;
  tracks.forEach((track: any) => {
    const clips = (track.clips || []).sort((a: any, b: any) => a.startTime - b.startTime);
    for (let i = 0; i < clips.length - 1; i++) {
      const current = clips[i];
      const next = clips[i + 1];
      if (current.startTime + current.duration > next.startTime) {
        overlapCount++;
      }
    }
  });

  // Estimate render time (simplified)
  const estimatedRenderTime = Math.round(
    (timeline.totalDuration / 60) * 
    (1 + (complexityScore * 0.5)) * 
    (timeline.settings?.quality === '4k' ? 3 : timeline.settings?.quality === 'hd' ? 2 : 1)
  );

  return {
    complexity: {
      score: complexityScore,
      level: ['Low', 'Medium', 'High', 'Very High'][complexityScore - 1] || 'Unknown',
      totalElements,
      breakdown: {
        tracks: tracks.length,
        clips: allClips.length,
        keyframes: tracks.reduce((sum: number, t: any) => sum + (t.keyframes?.length || 0), 0),
        effects: tracks.reduce((sum: number, t: any) => 
          sum + (t.clips?.reduce((s: number, c: any) => s + (c.effects?.length || 0), 0) || 0), 0
        ),
      },
    },
    performance: {
      averageClipDuration: Math.round(avgClipDuration * 100) / 100,
      overlapDetected: overlapCount > 0,
      overlapCount,
      estimatedRenderTime: `${estimatedRenderTime} min`,
    },
    optimization: {
      suggestions: [
        overlapCount > 0 ? 'Resolver sobreposições de clips para melhor performance' : null,
        totalElements > 200 ? 'Considerar dividir em múltiplas timelines' : null,
        allClips.length > 100 ? 'Agrupar clips similares para melhor organização' : null,
      ].filter(Boolean),
    },
  };
}

/**
 * Editing Patterns Analysis
 */
async function getEditingPatterns(projectId: string) {
  const timeline = await prisma.timeline.findUnique({
    where: { projectId },
  });

  if (!timeline) {
    return {};
  }

  const snapshots = await prisma.timelineSnapshot.findMany({
    where: { timelineId: timeline.id },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });

  // Analyze editing patterns
  const hourlyDistribution: any = {};
  const dailyDistribution: any = {};

  snapshots.forEach((snapshot: any) => {
    const date = new Date(snapshot.createdAt);
    const hour = date.getHours();
    const day = date.getDay();

    hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
    dailyDistribution[day] = (dailyDistribution[day] || 0) + 1;
  });

  // Find most active periods
  const peakHour = Object.entries(hourlyDistribution)
    .sort(([, a]: any, [, b]: any) => b - a)[0];

  const peakDay = Object.entries(dailyDistribution)
    .sort(([, a]: any, [, b]: any) => b - a)[0];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return {
    editingSessions: {
      total: snapshots.length,
      hourlyDistribution,
      dailyDistribution,
      peakActivity: {
        hour: peakHour ? `${peakHour[0]}:00` : 'N/A',
        day: peakDay ? dayNames[parseInt(peakDay[0])] : 'N/A',
      },
    },
    patterns: {
      averageSessionLength: 'N/A', // Would need session tracking
      preferredTools: 'N/A', // Would need tool usage tracking
      commonOperations: 'N/A', // Would need operation tracking
    },
  };
}
