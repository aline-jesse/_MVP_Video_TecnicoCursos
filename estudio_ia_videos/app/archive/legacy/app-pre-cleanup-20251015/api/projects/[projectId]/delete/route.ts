
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;

    // Deletar renders relacionados
    await prisma.renderJob.deleteMany({
      where: { 
        inputData: {
          path: ['projectId'],
          equals: projectId
        }
      },
    });

    // Deletar projeto
    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({
      success: true,
      message: 'Projeto excluído com sucesso',
    });

  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir projeto' },
      { status: 500 }
    );
  }
}
