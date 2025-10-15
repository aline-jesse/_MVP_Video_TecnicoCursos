
/**
 * 🔧 API para carregar configurações atuais do sistema
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Carregar configurações atuais das variáveis de ambiente
    const config = {
      // Google Cloud TTS
      googleTtsApiKey: process.env.GOOGLE_TTS_API_KEY || '',
      googleTtsProjectId: process.env.GOOGLE_TTS_PROJECT_ID || '',
      
      // AWS S3
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      awsRegion: process.env.AWS_REGION || 'us-west-2',
      awsBucketName: process.env.AWS_BUCKET_NAME || '',
      awsFolderPrefix: process.env.AWS_FOLDER_PREFIX || '',
      
      // ElevenLabs
      elevenlabsApiKey: process.env.ELEVENLABS_API_KEY || '',
      
      // OpenAI
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      
      // Azure Speech
      azureSpeechKey: process.env.AZURE_SPEECH_KEY || '',
      azureSpeechRegion: process.env.AZURE_SPEECH_REGION || '',
      
      // Database
      databaseUrl: process.env.DATABASE_URL || '',
      
      // General Settings
      defaultLanguage: process.env.DEFAULT_LANGUAGE || 'pt-BR',
      maxVideoLength: parseInt(process.env.MAX_VIDEO_LENGTH || '300'),
      enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
      enableMetrics: process.env.ENABLE_METRICS === 'true'
    }

    // Mascarar dados sensíveis para exibição
    const maskedConfig = {
      ...config,
      googleTtsApiKey: config.googleTtsApiKey ? config.googleTtsApiKey.substring(0, 8) + '...' : '',
      awsAccessKeyId: config.awsAccessKeyId ? config.awsAccessKeyId.substring(0, 8) + '...' : '',
      awsSecretAccessKey: config.awsSecretAccessKey ? '***' : '',
      elevenlabsApiKey: config.elevenlabsApiKey ? config.elevenlabsApiKey.substring(0, 8) + '...' : '',
      openaiApiKey: config.openaiApiKey ? config.openaiApiKey.substring(0, 8) + '...' : '',
      azureSpeechKey: config.azureSpeechKey ? config.azureSpeechKey.substring(0, 8) + '...' : '',
      databaseUrl: config.databaseUrl ? 'postgresql://***@***/**' : ''
    }

    // Status dos serviços baseado na presença das chaves
    const services = {
      googleTts: {
        name: 'Google Cloud TTS',
        status: config.googleTtsApiKey ? 'connected' : 'disconnected'
      },
      awsS3: {
        name: 'AWS S3 Storage',
        status: (config.awsAccessKeyId && config.awsSecretAccessKey && config.awsBucketName) ? 'connected' : 'disconnected'
      },
      elevenlabs: {
        name: 'ElevenLabs Voice',
        status: config.elevenlabsApiKey ? 'connected' : 'disconnected'
      },
      openai: {
        name: 'OpenAI GPT',
        status: config.openaiApiKey ? 'connected' : 'disconnected'
      },
      azureSpeech: {
        name: 'Azure Speech',
        status: (config.azureSpeechKey && config.azureSpeechRegion) ? 'connected' : 'disconnected'
      },
      database: {
        name: 'Database',
        status: config.databaseUrl ? 'connected' : 'disconnected'
      }
    }

    return NextResponse.json({
      success: true,
      config: maskedConfig,
      services,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Erro ao carregar configurações:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
