
/**
 * 💾 API para salvar configurações do sistema
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json()

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Configuração não fornecida' },
        { status: 400 }
      )
    }

    // Caminho do arquivo .env
    const envPath = join(process.cwd(), '.env')
    
    // Ler .env atual (se existir)
    let envContent = ''
    try {
      envContent = readFileSync(envPath, 'utf-8')
    } catch (error) {
      console.log('📝 Arquivo .env não existe, será criado')
    }

    // Função para atualizar ou adicionar variável
    const updateEnvVar = (content: string, key: string, value: string): string => {
      const regex = new RegExp(`^${key}=.*$`, 'gm')
      const newLine = `${key}=${value}`
      
      if (regex.test(content)) {
        return content.replace(regex, newLine)
      } else {
        return content + (content ? '\n' : '') + newLine
      }
    }

    // Atualizar variáveis apenas se fornecidas e não vazias
    let updatedContent = envContent

    if (config.googleTtsApiKey && !config.googleTtsApiKey.includes('...')) {
      updatedContent = updateEnvVar(updatedContent, 'GOOGLE_TTS_API_KEY', config.googleTtsApiKey)
    }
    
    if (config.googleTtsProjectId) {
      updatedContent = updateEnvVar(updatedContent, 'GOOGLE_TTS_PROJECT_ID', config.googleTtsProjectId)
    }
    
    if (config.awsAccessKeyId && !config.awsAccessKeyId.includes('...')) {
      updatedContent = updateEnvVar(updatedContent, 'AWS_ACCESS_KEY_ID', config.awsAccessKeyId)
    }
    
    if (config.awsSecretAccessKey && config.awsSecretAccessKey !== '***') {
      updatedContent = updateEnvVar(updatedContent, 'AWS_SECRET_ACCESS_KEY', config.awsSecretAccessKey)
    }
    
    if (config.awsRegion) {
      updatedContent = updateEnvVar(updatedContent, 'AWS_REGION', config.awsRegion)
    }
    
    if (config.awsBucketName) {
      updatedContent = updateEnvVar(updatedContent, 'AWS_BUCKET_NAME', config.awsBucketName)
    }
    
    if (config.awsFolderPrefix) {
      updatedContent = updateEnvVar(updatedContent, 'AWS_FOLDER_PREFIX', config.awsFolderPrefix)
    }
    
    if (config.elevenlabsApiKey && !config.elevenlabsApiKey.includes('...')) {
      updatedContent = updateEnvVar(updatedContent, 'ELEVENLABS_API_KEY', config.elevenlabsApiKey)
    }
    
    if (config.openaiApiKey && !config.openaiApiKey.includes('...')) {
      updatedContent = updateEnvVar(updatedContent, 'OPENAI_API_KEY', config.openaiApiKey)
    }
    
    if (config.azureSpeechKey && !config.azureSpeechKey.includes('...')) {
      updatedContent = updateEnvVar(updatedContent, 'AZURE_SPEECH_KEY', config.azureSpeechKey)
    }
    
    if (config.azureSpeechRegion) {
      updatedContent = updateEnvVar(updatedContent, 'AZURE_SPEECH_REGION', config.azureSpeechRegion)
    }
    
    if (config.databaseUrl && !config.databaseUrl.includes('***')) {
      updatedContent = updateEnvVar(updatedContent, 'DATABASE_URL', config.databaseUrl)
    }

    // Configurações gerais
    updatedContent = updateEnvVar(updatedContent, 'DEFAULT_LANGUAGE', config.defaultLanguage || 'pt-BR')
    updatedContent = updateEnvVar(updatedContent, 'MAX_VIDEO_LENGTH', (config.maxVideoLength || 300).toString())
    updatedContent = updateEnvVar(updatedContent, 'ENABLE_ANALYTICS', config.enableAnalytics ? 'true' : 'false')
    updatedContent = updateEnvVar(updatedContent, 'ENABLE_METRICS', config.enableMetrics ? 'true' : 'false')

    // Salvar arquivo .env
    writeFileSync(envPath, updatedContent)

    console.log('✅ Configurações salvas no arquivo .env')

    // Atualizar process.env para as mudanças terem efeito imediato
    if (config.googleTtsApiKey && !config.googleTtsApiKey.includes('...')) {
      process.env.GOOGLE_TTS_API_KEY = config.googleTtsApiKey
    }
    if (config.googleTtsProjectId) {
      process.env.GOOGLE_TTS_PROJECT_ID = config.googleTtsProjectId
    }
    if (config.awsAccessKeyId && !config.awsAccessKeyId.includes('...')) {
      process.env.AWS_ACCESS_KEY_ID = config.awsAccessKeyId
    }
    if (config.awsSecretAccessKey && config.awsSecretAccessKey !== '***') {
      process.env.AWS_SECRET_ACCESS_KEY = config.awsSecretAccessKey
    }
    if (config.awsRegion) {
      process.env.AWS_REGION = config.awsRegion
    }
    if (config.awsBucketName) {
      process.env.AWS_BUCKET_NAME = config.awsBucketName
    }
    if (config.awsFolderPrefix) {
      process.env.AWS_FOLDER_PREFIX = config.awsFolderPrefix
    }

    return NextResponse.json({
      success: true,
      message: 'Configurações salvas com sucesso',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Erro ao salvar configurações:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao salvar configurações' },
      { status: 500 }
    )
  }
}
