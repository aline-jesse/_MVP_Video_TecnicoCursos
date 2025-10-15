import { NextRequest, NextResponse } from 'next/server';

// Em um sistema real, isso seria conectado a um banco de dados
// Por agora, vamos usar um armazenamento em memória simples
const projects = new Map();

export async function GET(request: NextRequest) {
  try {
    const projectId = request.url.split('/').pop();
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const project = projects.get(projectId);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error loading project:', error);
    return NextResponse.json(
      { error: 'Failed to load project' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const projectId = request.url.split('/').pop();
    const projectData = await request.json();
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Validação básica
    if (!projectData.name || !projectData.tracks) {
      return NextResponse.json(
        { error: 'Invalid project data' },
        { status: 400 }
      );
    }

    // Adicionar timestamp de atualização
    const updatedProject = {
      ...projectData,
      id: projectId,
      updatedAt: new Date().toISOString()
    };

    projects.set(projectId, updatedProject);

    return NextResponse.json({
      success: true,
      project: updatedProject
    });
  } catch (error) {
    console.error('Error saving project:', error);
    return NextResponse.json(
      { error: 'Failed to save project' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const projectId = request.url.split('/').pop();
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const existed = projects.has(projectId);
    projects.delete(projectId);

    if (!existed) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}