
import { NextRequest, NextResponse } from 'next/server'

// API simplificada para simulação de sessão no MVP
export async function GET() {
  // Para demo - retornar sessão padrão
  return NextResponse.json({
    user: {
      id: 'demo-user',
      email: 'demo@estudioIA.com',
      name: 'Usuário Demo'
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
  }, { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'signin') {
      return NextResponse.json({
        user: {
          id: 'demo-user',
          email: 'demo@estudioIA.com',
          name: 'Usuário Demo'
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }, { status: 200 })
    }
    
    if (action === 'signout') {
      return NextResponse.json({
        message: 'Logout realizado com sucesso'
      }, { status: 200 })
    }
    
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
