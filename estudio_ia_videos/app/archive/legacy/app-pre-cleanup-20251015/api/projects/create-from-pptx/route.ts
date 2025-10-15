
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { name, pptxData } = await req.json();

    if (!name || !pptxData) {
      return NextResponse.json(
        { error: 'Nome e dados do PPTX são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar projeto
    const projectId = uuidv4();
    const project = await prisma.project.create({
      data: {
        id: projectId,
        name,
        userId: 'system', // TODO: pegar do session
        status: 'DRAFT',
        type: 'pptx',
        slidesData: pptxData,
      },
    });

    // Converter slides em clips básicos (armazenado em metadata)
    const tracks = [];
    
    if (pptxData.slides && Array.isArray(pptxData.slides)) {
      for (let i = 0; i < pptxData.slides.length; i++) {
        const slide = pptxData.slides[i];
        
        tracks.push({
          id: `track-${i}`,
          name: `Slide ${i + 1}`,
          type: 'video',
          clips: [
            {
              id: `clip-${i}`,
              start: i * 5, // 5s por slide
              end: (i + 1) * 5,
              duration: 5,
              type: 'image',
              source: slide.thumbnail || slide.image || '',
              properties: {
                text: slide.text || '',
                notes: slide.notes || '',
              },
            },
          ],
        });
      }
    }

    return NextResponse.json({
      success: true,
      id: project.id,
      name: project.name,
      tracksCreated: tracks.length,
    });

  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json(
      { error: 'Erro ao criar projeto' },
      { status: 500 }
    );
  }
}
