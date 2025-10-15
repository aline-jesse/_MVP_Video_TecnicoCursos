
/**
 * 🌍 API de Listagem de Ambientes 3D
 */

import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Usar searchParams diretamente sem construir URL
    const url = request.nextUrl;
    const category = url.searchParams.get('category');

    // Mock data para demonstração
    const mockEnvironments = [
      {
        id: 'industrial-factory',
        name: 'Fábrica Industrial',
        description: 'Ambiente industrial completo com máquinas e equipamentos de segurança',
        category: 'industrial',
        previewImage: '/environments/previews/factory.jpg',
        modelPath: '/environments/models/factory.glb',
        compatibility: { mobile: true, desktop: true, vr: true, ar: false },
        performance: { 
          complexity: 'high', 
          polygonCount: 150000, 
          textureSize: 2048,
          loadTime: 8.5 
        },
        metadata: { 
          rating: 4.8, 
          downloads: 1247, 
          tags: ['industrial', 'segurança', 'NR-12', 'máquinas'],
          createdAt: '2025-08-20T10:00:00Z',
          author: 'Estúdio IA Team'
        }
      },
      {
        id: 'construction-site',
        name: 'Canteiro de Obras',
        description: 'Canteiro de construção civil com equipamentos e áreas de risco',
        category: 'construction',
        previewImage: '/environments/previews/construction.jpg',
        modelPath: '/environments/models/construction.glb',
        compatibility: { mobile: true, desktop: true, vr: true, ar: true },
        performance: { 
          complexity: 'high', 
          polygonCount: 200000, 
          textureSize: 4096,
          loadTime: 12.3 
        },
        metadata: { 
          rating: 4.6, 
          downloads: 892, 
          tags: ['construção', 'NR-35', 'altura', 'canteiro'],
          createdAt: '2025-08-22T09:15:00Z',
          author: 'Estúdio IA Team'
        }
      },
      {
        id: 'modern-office',
        name: 'Escritório Moderno',
        description: 'Ambiente corporativo profissional para treinamentos administrativos',
        category: 'office',
        previewImage: '/environments/previews/office.jpg',
        modelPath: '/environments/models/office.glb',
        compatibility: { mobile: true, desktop: true, vr: false, ar: false },
        performance: { 
          complexity: 'medium', 
          polygonCount: 75000, 
          textureSize: 1024,
          loadTime: 4.2 
        },
        metadata: { 
          rating: 4.7, 
          downloads: 1567, 
          tags: ['escritório', 'corporativo', 'reunião', 'apresentação'],
          createdAt: '2025-08-18T16:30:00Z',
          author: 'Estúdio IA Team'
        }
      },
      {
        id: 'medical-facility',
        name: 'Instalação Médica',
        description: 'Hospital moderno com equipamentos médicos avançados',
        category: 'medical',
        previewImage: '/environments/previews/medical.jpg',
        modelPath: '/environments/models/medical.glb',
        compatibility: { mobile: true, desktop: true, vr: true, ar: false },
        performance: { 
          complexity: 'medium', 
          polygonCount: 95000, 
          textureSize: 1024,
          loadTime: 6.1 
        },
        metadata: { 
          rating: 4.5, 
          downloads: 673, 
          tags: ['médico', 'hospital', 'saúde', 'equipamentos'],
          createdAt: '2025-08-24T13:20:00Z',
          author: 'Medical Team'
        }
      },
      {
        id: 'virtual-classroom',
        name: 'Sala de Aula Virtual',
        description: 'Ambiente educacional futurista com tecnologia avançada',
        category: 'virtual',
        previewImage: '/environments/previews/classroom.jpg',
        modelPath: '/environments/models/classroom.glb',
        compatibility: { mobile: true, desktop: true, vr: true, ar: true },
        performance: { 
          complexity: 'low', 
          polygonCount: 45000, 
          textureSize: 512,
          loadTime: 2.8 
        },
        metadata: { 
          rating: 4.9, 
          downloads: 734, 
          tags: ['virtual', 'educação', 'futurista', 'interativo'],
          createdAt: '2025-08-25T11:00:00Z',
          author: 'Education Team'
        }
      },
      {
        id: 'outdoor-training',
        name: 'Área de Treinamento Externa',
        description: 'Ambiente externo para simulações de emergência',
        category: 'outdoor',
        previewImage: '/environments/previews/outdoor.jpg',
        modelPath: '/environments/models/outdoor.glb',
        compatibility: { mobile: true, desktop: true, vr: true, ar: true },
        performance: { 
          complexity: 'medium', 
          polygonCount: 120000, 
          textureSize: 2048,
          loadTime: 7.8 
        },
        metadata: { 
          rating: 4.4, 
          downloads: 456, 
          tags: ['externo', 'emergência', 'evacuação', 'simulação'],
          createdAt: '2025-08-26T14:45:00Z',
          author: 'Safety Team'
        }
      }
    ];

    let filteredEnvironments = mockEnvironments;
    
    if (category && category !== 'all') {
      filteredEnvironments = mockEnvironments.filter(env => env.category === category);
    }

    return NextResponse.json(filteredEnvironments);

  } catch (error) {
    console.error('Erro ao listar ambientes:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
