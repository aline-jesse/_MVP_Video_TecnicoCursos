/**
 * ⚡ Timeline Bulk Operations API - Batch Processing
 * Sprint 44 - Mass operations on timeline elements
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';

/**
 * POST - Execute bulk operations
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId, operation, targets, data } = body;

    if (!projectId || !operation || !targets) {
      return NextResponse.json(
        { success: false, message: 'projectId, operation e targets são obrigatórios' },
        { status: 400 }
      );
    }

    console.log(`⚡ Executando operação em lote: ${operation}...`);

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

    // Get timeline
    const timeline = await prisma.timeline.findUnique({
      where: { projectId },
    });

    if (!timeline) {
      return NextResponse.json(
        { success: false, message: 'Timeline não encontrada' },
        { status: 404 }
      );
    }

    let result: any = {};
    let updatedTracks = timeline.tracks as any[];

    switch (operation) {
      case 'delete_tracks':
        // Delete multiple tracks
        const trackIdsToDelete = targets.trackIds || [];
        updatedTracks = updatedTracks.filter((track: any) => 
          !trackIdsToDelete.includes(track.id)
        );
        result = {
          deletedCount: trackIdsToDelete.length,
          remainingCount: updatedTracks.length,
        };
        break;

      case 'delete_clips':
        // Delete multiple clips
        const clipIdsToDelete = targets.clipIds || [];
        updatedTracks = updatedTracks.map((track: any) => ({
          ...track,
          clips: track.clips?.filter((clip: any) => 
            !clipIdsToDelete.includes(clip.id)
          ) || [],
        }));
        result = {
          deletedCount: clipIdsToDelete.length,
          tracksAffected: updatedTracks.filter((t: any) => 
            t.clips?.length !== (timeline.tracks as any[])
              .find((ot: any) => ot.id === t.id)?.clips?.length
          ).length,
        };
        break;

      case 'duplicate_clips':
        // Duplicate multiple clips
        const clipIdsToDuplicate = targets.clipIds || [];
        const offset = data?.timeOffset || 5; // seconds
        
        updatedTracks = updatedTracks.map((track: any) => {
          const newClips: any[] = [];
          track.clips?.forEach((clip: any) => {
            if (clipIdsToDuplicate.includes(clip.id)) {
              newClips.push({
                ...clip,
                id: `${clip.id}_copy_${Date.now()}`,
                startTime: clip.startTime + offset,
              });
            }
          });
          return {
            ...track,
            clips: [...(track.clips || []), ...newClips],
          };
        });
        
        result = {
          duplicatedCount: clipIdsToDuplicate.length,
          timeOffset: offset,
        };
        break;

      case 'move_clips':
        // Move multiple clips to different track
        const clipIdsToMove = targets.clipIds || [];
        const targetTrackId = data?.targetTrackId;
        
        if (!targetTrackId) {
          return NextResponse.json(
            { success: false, message: 'targetTrackId é obrigatório para move_clips' },
            { status: 400 }
          );
        }

        const clipsToMove: any[] = [];
        updatedTracks = updatedTracks.map((track: any) => {
          const remainingClips = track.clips?.filter((clip: any) => {
            if (clipIdsToMove.includes(clip.id)) {
              clipsToMove.push(clip);
              return false;
            }
            return true;
          }) || [];
          
          return { ...track, clips: remainingClips };
        });

        // Add clips to target track
        updatedTracks = updatedTracks.map((track: any) => {
          if (track.id === targetTrackId) {
            return {
              ...track,
              clips: [...(track.clips || []), ...clipsToMove],
            };
          }
          return track;
        });

        result = {
          movedCount: clipsToMove.length,
          targetTrackId,
        };
        break;

      case 'update_settings':
        // Update settings for multiple tracks
        const trackIdsToUpdate = targets.trackIds || [];
        const settings = data?.settings || {};
        
        updatedTracks = updatedTracks.map((track: any) => {
          if (trackIdsToUpdate.includes(track.id)) {
            return {
              ...track,
              ...settings,
            };
          }
          return track;
        });

        result = {
          updatedCount: trackIdsToUpdate.length,
          settings,
        };
        break;

      case 'apply_effect':
        // Apply effect to multiple clips
        const clipIdsForEffect = targets.clipIds || [];
        const effect = data?.effect;
        
        if (!effect) {
          return NextResponse.json(
            { success: false, message: 'effect é obrigatório para apply_effect' },
            { status: 400 }
          );
        }

        updatedTracks = updatedTracks.map((track: any) => ({
          ...track,
          clips: track.clips?.map((clip: any) => {
            if (clipIdsForEffect.includes(clip.id)) {
              return {
                ...clip,
                effects: [...(clip.effects || []), effect],
              };
            }
            return clip;
          }) || [],
        }));

        result = {
          affectedClips: clipIdsForEffect.length,
          effect: effect.type,
        };
        break;

      default:
        return NextResponse.json(
          { success: false, message: `Operação desconhecida: ${operation}` },
          { status: 400 }
        );
    }

    // Update timeline
    const updatedTimeline = await prisma.timeline.update({
      where: { projectId },
      data: {
        tracks: updatedTracks,
        version: { increment: 1 },
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Operação em lote concluída: ${operation}`);

    return NextResponse.json({
      success: true,
      data: {
        operation,
        result,
        timeline: {
          id: updatedTimeline.id,
          version: updatedTimeline.version,
          tracksCount: updatedTracks.length,
          updatedAt: updatedTimeline.updatedAt.toISOString(),
        },
      },
      message: `Operação ${operation} executada com sucesso`,
    });

  } catch (error: any) {
    console.error('❌ Erro em operação em lote:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao executar operação em lote', error: error.message },
      { status: 500 }
    );
  }
}
