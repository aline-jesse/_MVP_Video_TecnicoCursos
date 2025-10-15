

/**
 * 🎨 Advanced Video Effects Engine API
 */

import { NextRequest, NextResponse } from 'next/server';

interface VideoEffect {
  id: string;
  name: string;
  category: 'particle' | 'transition' | 'color' | 'motion' | 'composite';
  description: string;
  parameters: { [key: string]: any };
  renderTime: number;
  complexity: 'low' | 'medium' | 'high';
  preview?: string;
}


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const effects: VideoEffect[] = [
      // Particle Systems
      {
        id: 'particles-smoke',
        name: 'Smoke Particles',
        category: 'particle',
        description: 'Sistema de partículas de fumaça realístico para simulações industriais',
        parameters: {
          density: 100,
          velocity: 0.5,
          lifetime: 5.0,
          color: '#888888',
          opacity: 0.7
        },
        renderTime: 3200,
        complexity: 'high',
        preview: '/effects/previews/smoke.gif'
      },
      {
        id: 'particles-sparks',
        name: 'Electric Sparks',
        category: 'particle',
        description: 'Faíscas elétricas para treinamentos de segurança elétrica',
        parameters: {
          count: 50,
          intensity: 0.8,
          color: '#ffff00',
          randomness: 0.3
        },
        renderTime: 2100,
        complexity: 'medium',
        preview: '/effects/previews/sparks.gif'
      },
      
      // Advanced Transitions
      {
        id: 'transition-cinematic-wipe',
        name: 'Cinematic Wipe',
        category: 'transition',
        description: 'Transição cinematográfica com movimento de câmera',
        parameters: {
          direction: 'left-to-right',
          duration: 1.5,
          easing: 'ease-in-out',
          blur: 2.0
        },
        renderTime: 800,
        complexity: 'medium',
        preview: '/effects/previews/cinematic-wipe.gif'
      },
      {
        id: 'transition-3d-cube',
        name: '3D Cube Transition',
        category: 'transition',
        description: 'Transição com cubo 3D rotacionando',
        parameters: {
          rotation: 'y-axis',
          speed: 1.0,
          perspective: 1200
        },
        renderTime: 1500,
        complexity: 'high',
        preview: '/effects/previews/3d-cube.gif'
      },
      
      // Color Grading
      {
        id: 'color-professional',
        name: 'Professional Color Grade',
        category: 'color',
        description: 'Correção de cor automática para aparência profissional',
        parameters: {
          exposure: 0.2,
          contrast: 1.1,
          saturation: 1.05,
          warmth: 0.1
        },
        renderTime: 600,
        complexity: 'low',
        preview: '/effects/previews/color-grade.jpg'
      },
      
      // Motion Graphics
      {
        id: 'motion-title-sequence',
        name: 'Animated Title Sequence',
        category: 'motion',
        description: 'Sequência de título animada com elementos gráficos',
        parameters: {
          animation: 'slide-up',
          duration: 3.0,
          font: 'professional',
          effects: ['glow', 'shadow']
        },
        renderTime: 1800,
        complexity: 'medium',
        preview: '/effects/previews/title-sequence.gif'
      },
      
      // Green Screen / Chroma Key
      {
        id: 'greenscreen-studio',
        name: 'Professional Green Screen',
        category: 'composite',
        description: 'Chroma key profissional com anti-aliasing avançado',
        parameters: {
          chromaColor: '#00ff00',
          tolerance: 0.3,
          spillSuppression: 0.8,
          edgeSmoothing: 0.5
        },
        renderTime: 2400,
        complexity: 'high',
        preview: '/effects/previews/greenscreen.jpg'
      }
    ];

    const filteredEffects = category 
      ? effects.filter(effect => effect.category === category)
      : effects;

    return NextResponse.json({
      success: true,
      effects: filteredEffects,
      categories: ['particle', 'transition', 'color', 'motion', 'composite'],
      stats: {
        totalEffects: effects.length,
        byCategory: {
          particle: effects.filter(e => e.category === 'particle').length,
          transition: effects.filter(e => e.category === 'transition').length,
          color: effects.filter(e => e.category === 'color').length,
          motion: effects.filter(e => e.category === 'motion').length,
          composite: effects.filter(e => e.category === 'composite').length,
        }
      }
    });

  } catch (error) {
    console.error('Video effects error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch video effects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { effectId, parameters, targetVideo } = await request.json();
    
    if (!effectId || !targetVideo) {
      return NextResponse.json(
        { success: false, error: 'Effect ID and target video are required' },
        { status: 400 }
      );
    }

    // Simular aplicação de efeito
    const jobId = `effect_job_${Date.now()}`;
    const estimatedTime = Math.random() * 10000 + 5000; // 5-15 segundos

    return NextResponse.json({
      success: true,
      jobId,
      estimatedTime: Math.round(estimatedTime),
      status: 'processing',
      message: 'Video effect application started'
    });

  } catch (error) {
    console.error('Video effect application error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to apply video effect' },
      { status: 500 }
    );
  }
}

