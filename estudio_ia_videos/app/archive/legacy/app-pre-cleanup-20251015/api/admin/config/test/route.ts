
/**
 * 🧪 API para testar conexões dos serviços
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { service, config } = await request.json()

    if (!service || !config) {
      return NextResponse.json(
        { success: false, error: 'Parâmetros inválidos' },
        { status: 400 }
      )
    }

    console.log(`🧪 Testando conexão do serviço: ${service}`)

    let testResult: { success: boolean; error?: string } = { success: false, error: 'Serviço não implementado' }

    switch (service) {
      case 'googleTts':
        testResult = await testGoogleTTS(config)
        break
      
      case 'awsS3':
        testResult = await testAWSS3(config)
        break
      
      case 'elevenlabs':
        testResult = await testElevenLabs(config)
        break
      
      case 'openai':
        testResult = await testOpenAI(config)
        break
      
      case 'azureSpeech':
        testResult = await testAzureSpeech(config)
        break
      
      case 'database':
        testResult = await testDatabase(config)
        break
      
      default:
        testResult = { success: false, error: `Serviço ${service} não reconhecido` }
    }

    return NextResponse.json({
      success: testResult.success,
      service,
      error: testResult.error,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Erro no teste de conexão:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Teste Google Cloud TTS
async function testGoogleTTS(config: any): Promise<{ success: boolean; error?: string }> {
  try {
    if (!config.googleTtsApiKey || config.googleTtsApiKey.includes('...')) {
      return { success: false, error: 'API Key não fornecida' }
    }

    const { GoogleTTSService } = await import('@/lib/google-tts-service')
    
    // Teste simples com texto pequeno
    const result = await GoogleTTSService.synthesizeSpeech({
      text: 'Teste',
      language: 'pt-BR',
      voice: 'pt-BR-Neural2-A',
      speakingRate: 1.0,
      pitch: 0.0
    })

    if (result.success) {
      return { success: true }
    } else {
      return { success: false, error: result.error || 'Falha na síntese' }
    }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro na conexão Google TTS' 
    }
  }
}

// Teste AWS S3
async function testAWSS3(config: any): Promise<{ success: boolean; error?: string }> {
  try {
    if (!config.awsAccessKeyId || !config.awsSecretAccessKey || !config.awsBucketName) {
      return { success: false, error: 'Credenciais AWS incompletas' }
    }

    if (config.awsAccessKeyId.includes('...') || config.awsSecretAccessKey === '***') {
      return { success: false, error: 'Credenciais mascaradas, forneça as reais' }
    }

    const { S3Client, ListObjectsV2Command } = await import('@aws-sdk/client-s3')
    
    const client = new S3Client({
      region: config.awsRegion || 'us-west-2',
      credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey
      }
    })

    // Teste listar objetos do bucket
    await client.send(new ListObjectsV2Command({
      Bucket: config.awsBucketName,
      MaxKeys: 1
    }))

    return { success: true }

  } catch (error: any) {
    let errorMessage = 'Erro de conexão S3'
    
    if (error.Code === 'NoSuchBucket') {
      errorMessage = 'Bucket não encontrado'
    } else if (error.Code === 'AccessDenied') {
      errorMessage = 'Acesso negado - verifique permissões'
    } else if (error.Code === 'InvalidAccessKeyId') {
      errorMessage = 'Access Key ID inválido'
    } else if (error.Code === 'SignatureDoesNotMatch') {
      errorMessage = 'Secret Access Key inválido'
    } else if (error.message) {
      errorMessage = error.message
    }

    return { success: false, error: errorMessage }
  }
}

// Teste ElevenLabs
async function testElevenLabs(config: any): Promise<{ success: boolean; error?: string }> {
  try {
    if (!config.elevenlabsApiKey || config.elevenlabsApiKey.includes('...')) {
      return { success: false, error: 'API Key ElevenLabs não fornecida' }
    }

    // Teste endpoint de usuário
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      method: 'GET',
      headers: {
        'xi-api-key': config.elevenlabsApiKey,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return { success: true }
    } else if (response.status === 401) {
      return { success: false, error: 'API Key inválida' }
    } else {
      return { success: false, error: `Erro HTTP ${response.status}` }
    }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro de conexão ElevenLabs' 
    }
  }
}

// Teste OpenAI
async function testOpenAI(config: any): Promise<{ success: boolean; error?: string }> {
  try {
    if (!config.openaiApiKey || config.openaiApiKey.includes('...')) {
      return { success: false, error: 'API Key OpenAI não fornecida' }
    }

    // Teste endpoint de modelos
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.openaiApiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      return { success: true }
    } else if (response.status === 401) {
      return { success: false, error: 'API Key inválida' }
    } else {
      return { success: false, error: `Erro HTTP ${response.status}` }
    }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro de conexão OpenAI' 
    }
  }
}

// Teste Azure Speech
async function testAzureSpeech(config: any): Promise<{ success: boolean; error?: string }> {
  try {
    if (!config.azureSpeechKey || !config.azureSpeechRegion) {
      return { success: false, error: 'Credenciais Azure incompletas' }
    }

    if (config.azureSpeechKey.includes('...')) {
      return { success: false, error: 'Chave mascarada, forneça a real' }
    }

    // Teste endpoint de token
    const response = await fetch(`https://${config.azureSpeechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': config.azureSpeechKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    if (response.ok) {
      return { success: true }
    } else if (response.status === 401 || response.status === 403) {
      return { success: false, error: 'Chave de subscrição inválida' }
    } else {
      return { success: false, error: `Erro HTTP ${response.status}` }
    }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro de conexão Azure Speech' 
    }
  }
}

// Teste Database
async function testDatabase(config: any): Promise<{ success: boolean; error?: string }> {
  try {
    if (!config.databaseUrl || config.databaseUrl.includes('***')) {
      return { success: false, error: 'URL do banco não fornecida' }
    }

    // Teste básico de conexão PostgreSQL
    const { Client } = await import('pg')
    const client = new Client({ connectionString: config.databaseUrl })
    
    await client.connect()
    await client.query('SELECT 1')
    await client.end()

    return { success: true }

  } catch (error: any) {
    let errorMessage = 'Erro de conexão com banco'
    
    if (error.code === 'ENOTFOUND') {
      errorMessage = 'Host do banco não encontrado'
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Conexão recusada pelo banco'
    } else if (error.code === '28P01') {
      errorMessage = 'Credenciais de autenticação inválidas'
    } else if (error.message) {
      errorMessage = error.message
    }

    return { success: false, error: errorMessage }
  }
}
