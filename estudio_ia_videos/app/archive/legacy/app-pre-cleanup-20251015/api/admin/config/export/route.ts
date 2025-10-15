
/**
 * 📄 API para exportar arquivo .env com configurações
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Gerar conteúdo .env baseado nas configurações atuais
    const envContent = `# Estúdio IA de Vídeos - Configurações
# Gerado em: ${new Date().toISOString()}

# Google Cloud Text-to-Speech
GOOGLE_TTS_API_KEY=${process.env.GOOGLE_TTS_API_KEY || ''}
GOOGLE_TTS_PROJECT_ID=${process.env.GOOGLE_TTS_PROJECT_ID || ''}

# AWS S3 Storage
AWS_ACCESS_KEY_ID=${process.env.AWS_ACCESS_KEY_ID || ''}
AWS_SECRET_ACCESS_KEY=${process.env.AWS_SECRET_ACCESS_KEY || ''}
AWS_REGION=${process.env.AWS_REGION || 'us-west-2'}
AWS_BUCKET_NAME=${process.env.AWS_BUCKET_NAME || ''}
AWS_FOLDER_PREFIX=${process.env.AWS_FOLDER_PREFIX || ''}

# ElevenLabs Voice Cloning
ELEVENLABS_API_KEY=${process.env.ELEVENLABS_API_KEY || ''}

# OpenAI GPT
OPENAI_API_KEY=${process.env.OPENAI_API_KEY || ''}

# Azure Speech Services
AZURE_SPEECH_KEY=${process.env.AZURE_SPEECH_KEY || ''}
AZURE_SPEECH_REGION=${process.env.AZURE_SPEECH_REGION || ''}

# Database
DATABASE_URL=${process.env.DATABASE_URL || ''}

# Configurações Gerais
DEFAULT_LANGUAGE=${process.env.DEFAULT_LANGUAGE || 'pt-BR'}
MAX_VIDEO_LENGTH=${process.env.MAX_VIDEO_LENGTH || '300'}
ENABLE_ANALYTICS=${process.env.ENABLE_ANALYTICS || 'true'}
ENABLE_METRICS=${process.env.ENABLE_METRICS || 'true'}

# Next.js & Auth (não modifique)
NEXTAUTH_URL=${process.env.NEXTAUTH_URL || ''}
NEXTAUTH_SECRET=${process.env.NEXTAUTH_SECRET || ''}

# AbacusAI API (não modifique)
ABACUSAI_API_KEY=${process.env.ABACUSAI_API_KEY || ''}
`

    // Retornar como download
    return new NextResponse(envContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename=".env"'
      }
    })

  } catch (error) {
    console.error('❌ Erro ao exportar configurações:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao exportar configurações' },
      { status: 500 }
    )
  }
}
