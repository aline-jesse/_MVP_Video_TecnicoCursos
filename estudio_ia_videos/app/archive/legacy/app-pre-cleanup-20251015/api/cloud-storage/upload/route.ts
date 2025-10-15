
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const provider = formData.get('provider') as string
    const folder = formData.get('folder') as string || 'Estudio IA Videos'

    if (!file || !provider) {
      return NextResponse.json(
        { error: 'Arquivo e provedor são obrigatórios' },
        { status: 400 }
      )
    }

    // Validações
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 500MB.' },
        { status: 400 }
      )
    }

    const allowedTypes = [
      'video/mp4', 'video/webm', 'video/mov', 'video/avi',
      'image/gif', 'image/png', 'image/jpeg',
      'application/json' // Para backups
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado' },
        { status: 400 }
      )
    }

    // Simular upload baseado no provider
    const uploadResult = await simulateUpload(file, provider, folder)

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      file: {
        id: uploadResult.fileId,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        downloadUrl: uploadResult.downloadUrl,
        provider,
        uploadedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function simulateUpload(
  file: File, 
  provider: string, 
  folder: string
): Promise<{
  success: boolean
  fileId?: string
  downloadUrl?: string
  error?: string
}> {
  // Simular delay baseado no tamanho do arquivo
  const delay = Math.min(file.size / (1024 * 1024) * 100, 3000) // Max 3s
  await new Promise(resolve => setTimeout(resolve, delay))

  // Simular possível falha (5% de chance)
  if (Math.random() < 0.05) {
    return {
      success: false,
      error: 'Erro de conexão com o provedor'
    }
  }

  const fileId = `${provider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  let downloadUrl: string
  switch (provider) {
    case 'google-drive':
      downloadUrl = `https://drive.google.com/file/d/${fileId}/view`
      break
    case 'dropbox':
      downloadUrl = `https://dropbox.com/s/${fileId}/${file.name}`
      break
    case 'onedrive':
      downloadUrl = `https://1drv.ms/v/s!${fileId}`
      break
    default:
      return {
        success: false,
        error: 'Provedor não suportado'
      }
  }

  return {
    success: true,
    fileId,
    downloadUrl
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Cloud Storage API ativo',
    supportedProviders: ['google-drive', 'dropbox', 'onedrive'],
    maxFileSize: '500MB',
    supportedTypes: ['video/*', 'image/gif', 'application/json']
  })
}
