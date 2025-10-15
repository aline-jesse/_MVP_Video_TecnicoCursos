/**
 * API de Profile - Gerenciamento de perfil do usuário
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth/auth-service';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token de acesso obrigatório' },
        { status: 401 }
      );
    }

    const user = await authService.getUserFromToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      permissions: user.permissions,
      preferences: user.preferences,
      metadata: {
        ...user.metadata,
        // Não expor informações sensíveis
        lastIp: undefined,
        userAgent: undefined
      },
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    });

  } catch (error) {
    console.error('Profile get error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token de acesso obrigatório' },
        { status: 401 }
      );
    }

    const user = await authService.getUserFromToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const updates = await request.json();

    // Atualizar apenas campos permitidos
    const allowedUpdates = ['name', 'avatar', 'preferences'];
    const filteredUpdates: any = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    // Validações específicas
    if (filteredUpdates.name && filteredUpdates.name.length < 2) {
      return NextResponse.json(
        { error: 'Nome deve ter pelo menos 2 caracteres' },
        { status: 400 }
      );
    }

    // Atualizar usuário (em produção, salvar no banco)
    Object.assign(user, filteredUpdates);

    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        permissions: user.permissions,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}