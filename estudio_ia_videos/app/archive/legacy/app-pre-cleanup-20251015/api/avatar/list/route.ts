
import { NextRequest, NextResponse } from 'next/server';

/**
 * API de Lista de Avatares
 */
export async function GET(request: NextRequest) {
  try {
    const avatars = [
      {
        id: 'avatar-executivo-masc',
        name: 'Executivo Masculino',
        gender: 'male',
        style: 'corporate',
        thumbnail: '/avatar-executivo-thumb.jpg',
        animations: ['talking', 'gesturing', 'pointing'],
        status: 'active'
      },
      {
        id: 'avatar-tecnico-masc',
        name: 'Técnico Masculino',
        gender: 'male',
        style: 'technical',
        thumbnail: '/avatar-tecnico-thumb.jpg',
        animations: ['talking', 'demonstrating', 'warning'],
        status: 'active'
      },
      {
        id: 'avatar-corporativa-fem',
        name: 'Corporativa Feminina',
        gender: 'female',
        style: 'corporate',
        thumbnail: '/corporativa-thumb.jpg',
        animations: ['talking', 'smiling', 'professional'],
        status: 'active'
      }
    ];

    return NextResponse.json({
      success: true,
      avatars,
      count: avatars.length
    });
  } catch (error) {
    console.error('Erro ao buscar avatares:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar avatares' },
      { status: 500 }
    );
  }
}
