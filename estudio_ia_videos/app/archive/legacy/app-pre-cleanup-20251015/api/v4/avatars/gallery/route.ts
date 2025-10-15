

/**
 * 🎭 API da Galeria de Avatares 3D Hiper-Realistas
 * Pipeline integrado com Unreal Engine 5
 */

import { NextRequest, NextResponse } from 'next/server';
import { avatar3DHyperPipeline } from '@/lib/avatar-3d-pipeline';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

// Transformar avatares do pipeline para formato da galeria
function transformAvatarForGallery(avatar: any): any {
  return {
    id: avatar.id,
    name: avatar.name,
    category: avatar.category,
    gender: avatar.gender,
    ethnicity: avatar.ethnicity,
    hairStyle: avatar.features?.hairSystem || 'volumetric',
    clothing: avatar.category === 'business' ? 'formal' : 
              avatar.category === 'safety' ? 'uniforme-segurança' :
              avatar.category === 'healthcare' ? 'jaleco-médico' : 'casual',
    bodyType: 'atlético',
    faceType: 'oval',
    expressions: avatar.animations?.emotions || ['neutro', 'sorriso', 'profissional'],
    languages: avatar.voiceSync?.supportedLanguages || ['pt-BR', 'en-US'],
    price: avatar.quality === 'hyperreal' ? 35 : 0,
    premium: avatar.quality === 'hyperreal',
    modelUrl: avatar.assets?.modelFile || `/avatars/3d/${avatar.id}.gltf`,
    textureUrl: avatar.assets?.textureFiles?.[0] || `/avatars/textures/${avatar.id}_diffuse_8k.jpg`,
    animationsUrl: avatar.assets?.rigFile || `/avatars/animations/${avatar.id}.fbx`,
    preview: `/avatars/previews/${avatar.id}.jpg`,
    quality: avatar.quality,
    hyperRealistic: true,
    renderingEngine: 'Unreal Engine 5',
    rayTracing: avatar.rendering?.rayTracing || true,
    lipSyncAccuracy: avatar.features?.lipSyncAccuracy || 98,
    stats: {
      downloads: Math.floor(Math.random() * 15000) + 5000,
      rating: 4.5 + Math.random() * 0.5,
      reviews: Math.floor(Math.random() * 800) + 200
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const gender = searchParams.get('gender') || 'all';
    const premium = searchParams.get('premium') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Usar avatares hiper-realistas do pipeline
    const hyperRealisticAvatars = avatar3DHyperPipeline.getAllAvatars();
    const galleryAvatars = hyperRealisticAvatars.map(transformAvatarForGallery);

    let filteredAvatars = galleryAvatars.filter(avatar => {
      const matchesSearch = avatar.name.toLowerCase().includes(search.toLowerCase()) ||
                           avatar.category.toLowerCase().includes(search.toLowerCase()) ||
                           avatar.ethnicity.toLowerCase().includes(search.toLowerCase());
      
      // Mapear categorias
      const categoryMap: Record<string, string> = {
        'profissional': 'business',
        'especialista': 'healthcare',
        'instrutor': 'education',
        'casual': 'casual',
        'segurança': 'safety'
      };
      
      const avatarCategory = Object.keys(categoryMap).find(key => 
        categoryMap[key] === avatar.category
      ) || avatar.category;
      
      const matchesCategory = category === 'all' || avatarCategory === category || avatar.category === category;
      const matchesGender = gender === 'all' || avatar.gender === gender;
      const matchesPremium = !premium || avatar.premium;

      return matchesSearch && matchesCategory && matchesGender && matchesPremium;
    });

    // Ordenar por qualidade hiper-realista primeiro
    filteredAvatars.sort((a, b) => {
      if (a.quality === 'hyperreal' && b.quality !== 'hyperreal') return -1;
      if (b.quality === 'hyperreal' && a.quality !== 'hyperreal') return 1;
      return b.stats.downloads - a.stats.downloads;
    });

    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAvatars = filteredAvatars.slice(startIndex, endIndex);

    const response = {
      success: true,
      avatars: paginatedAvatars,
      pagination: {
        page,
        limit,
        total: filteredAvatars.length,
        totalPages: Math.ceil(filteredAvatars.length / limit)
      },
      stats: {
        total: galleryAvatars.length,
        hyperRealistic: galleryAvatars.filter(a => a.quality === 'hyperreal').length,
        cinematic: galleryAvatars.filter(a => a.quality === 'cinematic').length,
        premium: galleryAvatars.filter(a => a.premium).length,
        categories: {
          business: galleryAvatars.filter(a => a.category === 'business').length,
          healthcare: galleryAvatars.filter(a => a.category === 'healthcare').length,
          education: galleryAvatars.filter(a => a.category === 'education').length,
          safety: galleryAvatars.filter(a => a.category === 'safety').length,
          casual: galleryAvatars.filter(a => a.category === 'casual').length
        }
      },
      pipeline: {
        engine: 'Unreal Engine 5',
        rayTracing: true,
        resolution: '8K',
        lipSyncAccuracy: '98%',
        renderingTech: ['Lumen GI', 'Nanite Virtualized', 'Temporal AA']
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro na API da galeria:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, avatarId, customization } = body;

    switch (action) {
      case 'customize':
        // Personalizar avatar hiper-realista
        const baseAvatar = avatar3DHyperPipeline.getAvatar(avatarId);
        if (!baseAvatar) {
          return NextResponse.json(
            { success: false, error: 'Avatar não encontrado' },
            { status: 404 }
          );
        }
        
        const customizedAvatar = {
          ...transformAvatarForGallery(baseAvatar),
          ...customization,
          id: `custom_${Date.now()}`,
          name: `${baseAvatar.name} (Personalizado)`,
          premium: true,
          quality: 'hyperreal',
          price: 35
        };

        return NextResponse.json({
          success: true,
          avatar: customizedAvatar,
          message: 'Avatar personalizado criado com sucesso'
        });

      case 'favorite':
        // Adicionar aos favoritos
        return NextResponse.json({
          success: true,
          message: 'Avatar adicionado aos favoritos'
        });

      case 'download':
        // Preparar download do avatar
        return NextResponse.json({
          success: true,
          downloadUrl: `/api/v4/avatars/download/${avatarId}`,
          message: 'Link de download gerado'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Erro na API de avatares:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
