
import { NextRequest, NextResponse } from 'next/server'

// Para testes do MVP - simular autenticação
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Para demo - credenciais simplificadas
    if (email === 'admin@estudioIA.com' && password === 'admin123') {
      return NextResponse.json({
        message: 'Login realizado com sucesso',
        user: {
          id: '1',
          email: 'admin@estudioIA.com',
          name: 'Administrador'
        }
      }, { status: 200 })
    }

    // Para demo - qualquer email com senha demo123
    if (password === 'demo123' && email.includes('@')) {
      return NextResponse.json({
        message: 'Login realizado com sucesso',
        user: {
          id: '2',
          email: email,
          name: email.split('@')[0]
        }
      }, { status: 200 })
    }

    return NextResponse.json(
      { error: 'Credenciais inválidas' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Endpoint de login ativo' },
    { status: 200 }
  )
}
