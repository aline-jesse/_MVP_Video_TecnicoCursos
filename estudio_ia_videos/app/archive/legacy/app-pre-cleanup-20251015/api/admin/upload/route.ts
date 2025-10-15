export const dynamic = 'force-dynamic';

/**
 * 📁 Admin File Upload API - Upload de logos e favicons
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth/admin-middleware'
import { uploadFile } from '@/lib/s3'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = {
  logo: 2 * 1024 * 1024, // 2MB
  favicon: 512 * 1024    // 512KB
}

const ALLOWED_TYPES = {
  logo: ['image/png', 'image/svg+xml', 'image/jpeg'],
  favicon: ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon']
}

export async function POST(request: NextRequest) {
  return withAdminAuth(request, async () => {
    try {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const type = formData.get('type') as 'logo' | 'favicon'

      if (!file) {
        return NextResponse.json(
          { error: 'Nenhum arquivo enviado' },
          { status: 400 }
        )
      }

      if (!type || !['logo', 'favicon'].includes(type)) {
        return NextResponse.json(
          { error: 'Tipo inválido. Use "logo" ou "favicon"' },
          { status: 400 }
        )
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE[type]) {
        return NextResponse.json(
          { error: `Arquivo muito grande. Máximo ${MAX_FILE_SIZE[type] / (1024 * 1024)}MB` },
          { status: 400 }
        )
      }

      // Validate file type
      if (!ALLOWED_TYPES[type].includes(file.type)) {
        return NextResponse.json(
          { error: `Tipo de arquivo não permitido. Use: ${ALLOWED_TYPES[type].join(', ')}` },
          { status: 400 }
        )
      }

      // Generate unique filename
      const extension = file.name.split('.').pop()
      const filename = `admin/${type}s/${uuidv4()}.${extension}`

      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer())

      // Upload to S3/R2
      const uploadResult = await uploadFile(buffer, filename, file.type)

      return NextResponse.json({
        url: uploadResult,
        filename,
        type: file.type,
        size: file.size
      })

    } catch (error) {
      console.error('Upload error:', error)
      return NextResponse.json(
        { error: 'Erro no upload do arquivo' },
        { status: 500 }
      )
    }
  })
}
