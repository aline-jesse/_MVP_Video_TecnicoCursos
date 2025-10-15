
/**
 * 📁 Create Test Project API
 * Cria um projeto de teste
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { name, description } = body;
    
    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        name: name || 'Projeto de Teste',
        description: description || 'Projeto criado para testes',
        status: 'DRAFT',
      },
    });
    
    // Track analytics
    await prisma.analyticsEvent.create({
      data: {
        userId: session.user.id,
        category: 'project',
        action: 'create',
        label: project.id,
        metadata: {
          projectId: project.id,
          name: project.name,
        },
      },
    });
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating test project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
