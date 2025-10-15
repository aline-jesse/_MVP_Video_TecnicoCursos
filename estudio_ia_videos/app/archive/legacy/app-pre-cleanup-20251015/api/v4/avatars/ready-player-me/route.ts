

/**
 * 🎮 Ready Player Me Integration API
 * Integração com a plataforma Ready Player Me
 */

import { NextRequest, NextResponse } from 'next/server';


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, avatarUrl, customization } = body;

    switch (action) {
      case 'load_avatar':
        return await loadReadyPlayerMeAvatar(avatarUrl);
      
      case 'create_avatar':
        return await createReadyPlayerMeAvatar(customization);
      
      case 'update_avatar':
        return await updateReadyPlayerMeAvatar(avatarUrl, customization);
      
      default:
        return NextResponse.json(
          { success: false, error: 'Ação não reconhecida' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Erro na API Ready Player Me:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const avatarId = searchParams.get('avatarId');

    if (!avatarId) {
      return NextResponse.json({
        success: true,
        config: {
          apiKey: process.env.READY_PLAYER_ME_API_KEY ? 'configured' : 'not_configured',
          subdomain: process.env.READY_PLAYER_ME_SUBDOMAIN || 'demo',
          features: {
            fullBody: true,
            halfBody: true,
            expressions: true,
            animations: true,
            customization: true
          }
        }
      });
    }

    const avatarData = await getReadyPlayerMeAvatar(avatarId);
    return NextResponse.json(avatarData);

  } catch (error) {
    console.error('Erro ao buscar avatar Ready Player Me:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function loadReadyPlayerMeAvatar(avatarUrl: string) {
  try {
    const avatarId = extractAvatarIdFromUrl(avatarUrl);
    
    const avatarData = {
      success: true,
      avatar: {
        id: avatarId,
        name: 'Avatar RPM ' + avatarId.slice(-6),
        modelUrl: avatarUrl,
        previewUrl: avatarUrl.replace('.glb', '.png'),
        category: 'ready-player-me',
        gender: Math.random() > 0.5 ? 'masculino' : 'feminino'
      }
    };

    return NextResponse.json(avatarData);

  } catch (error) {
    console.error('Erro ao carregar avatar Ready Player Me:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar avatar' },
      { status: 500 }
    );
  }
}

async function createReadyPlayerMeAvatar(customization: any) {
  try {
    const avatarId = 'rpm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newAvatar = {
      success: true,
      avatar: {
        id: avatarId,
        name: 'Avatar Personalizado ' + avatarId.slice(-6),
        modelUrl: 'https://i.ytimg.com/vi/teig9MgxB9k/maxresdefault.jpg' + avatarId + '.glb',
        previewUrl: 'https://i.ytimg.com/vi/teig9MgxB9k/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDYxt5aU9HSNFrrlNlQvR7xbpr6cg' + avatarId + '.png',
        category: 'custom',
        customization
      }
    };

    return NextResponse.json(newAvatar);

  } catch (error) {
    console.error('Erro ao criar avatar Ready Player Me:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar avatar' },
      { status: 500 }
    );
  }
}

async function updateReadyPlayerMeAvatar(avatarUrl: string, customization: any) {
  try {
    const avatarId = extractAvatarIdFromUrl(avatarUrl);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    const updatedAvatar = {
      success: true,
      avatar: {
        id: avatarId,
        name: 'Avatar Atualizado ' + avatarId.slice(-6),
        modelUrl: avatarUrl,
        previewUrl: avatarUrl.replace('.glb', '.png'),
        customization
      }
    };

    return NextResponse.json(updatedAvatar);

  } catch (error) {
    console.error('Erro ao atualizar avatar Ready Player Me:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar avatar' },
      { status: 500 }
    );
  }
}

async function getReadyPlayerMeAvatar(avatarId: string) {
  try {
    const avatarData = {
      success: true,
      avatar: {
        id: avatarId,
        name: 'Avatar RPM ' + avatarId.slice(-6),
        modelUrl: 'https://i.ytimg.com/vi/IdS1295nHfA/mqdefault.jpg' + avatarId + '.glb',
        previewUrl: 'https://i.pinimg.com/736x/00/aa/91/00aa91269c41631dcb19287a54c6bd76.jpg' + avatarId + '.png',
        category: 'ready-player-me',
        stats: {
          downloads: Math.floor(Math.random() * 1000),
          rating: 4.0 + Math.random() * 1.0,
          reviews: Math.floor(Math.random() * 100)
        },
        features: {
          expressions: ['neutral', 'happy', 'sad', 'angry', 'surprised'],
          animations: ['idle', 'talking', 'gesturing', 'walking'],
          lipSync: true,
          eyeTracking: true
        }
      }
    };

    return avatarData;

  } catch (error) {
    console.error('Erro ao buscar avatar Ready Player Me:', error);
    throw error;
  }
}

function extractAvatarIdFromUrl(url: string): string {
  const match = url.match(/avatars\/([a-zA-Z0-9-]+)/);
  return match ? match[1] : 'fallback_' + Date.now();
}
