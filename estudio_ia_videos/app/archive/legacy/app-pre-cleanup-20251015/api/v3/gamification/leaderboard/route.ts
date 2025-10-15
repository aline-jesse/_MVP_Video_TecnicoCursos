
/**
 * 🎮 API - Gamificação e Rankings
 */

import { NextRequest, NextResponse } from 'next/server';


// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    const limit = parseInt(searchParams.get('limit') || '10');

    const leaderboard = [
      {
        id: 1,
        name: 'Marina Silva',
        avatar: '/avatar-1.jpg',
        level: 15,
        points: 18750,
        streak: 12,
        badge: 'Especialista NR-35',
        department: 'Segurança',
        completedCourses: 28,
        rank: 1
      },
      {
        id: 2,
        name: 'João Santos', 
        avatar: '/avatar-2.jpg',
        level: 14,
        points: 16200,
        streak: 8,
        badge: 'Mestre Elétrica',
        department: 'Elétrica',
        completedCourses: 24,
        rank: 2
      },
      {
        id: 3,
        name: 'Ana Costa',
        avatar: '/avatar-3.jpg', 
        level: 12,
        points: 12450,
        streak: 7,
        badge: 'Técnico Expert',
        department: 'Operações',
        completedCourses: 19,
        rank: 3
      }
    ];

    return NextResponse.json({
      success: true,
      data: leaderboard.slice(0, limit),
      period,
      totalUsers: leaderboard.length,
      lastUpdated: new Date()
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar ranking' },
      { status: 500 }
    );
  }
}
