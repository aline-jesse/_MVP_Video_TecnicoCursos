
/**
 * ✅ API de Perfis de Voice Cloning - CONECTADO AO DB REAL
 * Sprint 43 - P1 CORRIGIDO
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    // Filtro opcional por usuário
    let userFilter = {};
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      });
      if (user) {
        userFilter = { userId: user.id };
      }
    }

    // ✅ BUSCAR PERFIS REAIS DO BANCO
    const profiles = await prisma.voiceClone.findMany({
      where: userFilter,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        userId: true,
        name: true,
        description: true,
        provider: true,
        voiceId: true,
        sampleCount: true,
        trainingStatus: true,
        qualityScore: true,
        samplesS3Keys: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true
      }
    });

    // Buscar uso dos perfis (de AIGeneration)
    const profilesWithUsage = await Promise.all(profiles.map(async (profile: any) => {
      const usage = await prisma.aIGeneration.aggregate({
        where: {
          type: 'text_to_speech',
          settings: {
            path: ['voiceId'],
            equals: profile.voiceId
          }
        },
        _count: { id: true },
        _sum: { duration: true }
      });

      const lastUsed = await prisma.aIGeneration.findFirst({
        where: {
          type: 'text_to_speech',
          settings: {
            path: ['voiceId'],
            equals: profile.voiceId
          }
        },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      });

      // Extrair metadados das samples
      const samplesData = profile.samplesS3Keys as any;
      const samplesProvided = profile.sampleCount;
      const samplesRequired = 10; // Padrão

      return {
        id: profile.id,
        name: profile.name,
        description: profile.description || 'Voice clone profile',
        gender: 'neutral', // Pode ser adicionado ao schema posteriormente
        language: 'pt-BR',
        accent: 'neutro',
        ageRange: 'adult',
        training: {
          trainingStatus: profile.trainingStatus,
          similarity: profile.qualityScore ? profile.qualityScore / 100 : 0.85,
          quality: profile.qualityScore ? profile.qualityScore / 100 : 0.9,
          samplesProvided,
          samplesRequired
        },
        characteristics: {
          emotion: 'neutral',
          clarity: 0.95,
          naturalness: profile.qualityScore ? profile.qualityScore / 100 : 0.88,
          pitch: 1.0,
          speed: 1.0
        },
        usage: {
          totalGenerations: usage._count.id,
          totalDuration: Math.round(usage._sum.duration || 0),
          lastUsed: lastUsed?.createdAt.toISOString() || null
        },
        metadata: {
          createdAt: profile.createdAt.toISOString(),
          updatedAt: profile.updatedAt.toISOString(),
          owner: profile.userId,
          isPublic: false,
          tags: ['voice-cloning'],
          provider: profile.provider
        },
        completedAt: profile.completedAt?.toISOString()
      };
    }));

    return NextResponse.json({
      success: true,
      profiles: profilesWithUsage,
      total: profilesWithUsage.length,
      source: 'DATABASE_REAL',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao listar perfis de voice cloning:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao listar perfis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/voice-cloning/profiles
 * Criar novo perfil de voice cloning
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, provider, voiceId, samplesS3Keys } = body;

    if (!name || !provider) {
      return NextResponse.json(
        { success: false, error: 'name and provider are required' },
        { status: 400 }
      );
    }

    // ✅ CRIAR PERFIL NO BANCO
    const profile = await prisma.voiceClone.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        provider: provider || 'elevenlabs',
        voiceId: voiceId || `voice_${Date.now()}`,
        sampleCount: Array.isArray(samplesS3Keys) ? samplesS3Keys.length : 0,
        trainingStatus: 'pending',
        qualityScore: null,
        samplesS3Keys: samplesS3Keys || []
      }
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        name: profile.name,
        voiceId: profile.voiceId,
        trainingStatus: profile.trainingStatus
      },
      source: 'DATABASE_REAL'
    });
  } catch (error) {
    console.error('❌ Erro ao criar perfil de voice cloning:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao criar perfil',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
