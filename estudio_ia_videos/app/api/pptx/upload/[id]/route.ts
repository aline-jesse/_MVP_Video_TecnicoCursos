import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { withRateLimit, RATE_LIMITS } from '@/lib/rate-limiter-real'
import { S3StorageService } from '@/lib/s3-storage'
import { videoCache } from '@/lib/video-cache'
import { notificationManager } from '@/lib/notifications/notification-manager'
import { unlink } from 'fs/promises'

// GET /api/pptx/upload/[id] - Buscar status e metadados de um upload específico
export const GET = withRateLimit(RATE_LIMITS.AUTH_API, 'user')(async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const uploadId = params.id
    if (!uploadId) {
      return NextResponse.json({ error: 'ID do upload é obrigatório' }, { status: 400 })
    }

    // Buscar upload
    const { data: upload, error } = await supabase
      .from('pptx_uploads')
      .select('*')
      .eq('id', uploadId)
      .single()

    if (error) {
      console.error('Erro ao buscar upload:', error)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    if (!upload) {
      return NextResponse.json({ error: 'Upload não encontrado' }, { status: 404 })
    }

    // Verificar permissões no projeto
    const { data: project } = await supabase
      .from('projects')
      .select('owner_id, collaborators, is_public')
      .eq('id', upload.project_id)
      .single()

    const hasPermission = project && (project.owner_id === user.id || project.collaborators?.includes(user.id) || project.is_public)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Sem permissão para acessar este upload' }, { status: 403 })
    }

    // Buscar slides relacionados
    const { data: slides } = await supabase
      .from('pptx_slides')
      .select('*')
      .eq('upload_id', uploadId)
      .order('slide_number', { ascending: true })

    return NextResponse.json({ upload, slides: slides || [] })
  } catch (error) {
    console.error('Erro na API de upload by id:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})

// DELETE /api/pptx/upload/[id] - Remover upload, slides e limpar assets de preview
export const DELETE = withRateLimit(RATE_LIMITS.AUTH_STRICT, 'user')(async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const uploadId = params.id
    if (!uploadId) {
      return NextResponse.json({ error: 'ID do upload é obrigatório' }, { status: 400 })
    }

    // Buscar upload para validar e obter dados
    const { data: upload } = await supabase
      .from('pptx_uploads')
      .select('*')
      .eq('id', uploadId)
      .single()

    if (!upload) {
      return NextResponse.json({ error: 'Upload não encontrado' }, { status: 404 })
    }

    // Verificar permissões no projeto
    const { data: project } = await supabase
      .from('projects')
      .select('owner_id, collaborators, is_public')
      .eq('id', upload.project_id)
      .single()

    const hasPermission = project && (project.owner_id === user.id || project.collaborators?.includes(user.id) || project.is_public)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Sem permissão para excluir este upload' }, { status: 403 })
    }

    // Remover slides
    await supabase
      .from('pptx_slides')
      .delete()
      .eq('upload_id', uploadId)

    // Limpar preview assets (S3 ou cache local)
    if (upload.preview_url && typeof upload.preview_url === 'string') {
      try {
        if (upload.preview_url.startsWith('/api/s3/serve/')) {
          const key = decodeURIComponent(upload.preview_url.replace('/api/s3/serve/', ''))
          await S3StorageService.deleteFile(key)
        } else if (upload.preview_url.startsWith('/api/videos/cache/')) {
          const filename = decodeURIComponent(upload.preview_url.replace('/api/videos/cache/', ''))
          await videoCache.delete(filename)
        }
      } catch (err) {
        console.warn('Falha ao limpar preview asset:', err)
      }
    }

    // Remover arquivo original do disco, se existir
    if (upload.file_path && typeof upload.file_path === 'string') {
      try {
        await unlink(upload.file_path)
      } catch (err) {
        // Ignorar erros de remoção do arquivo local
      }
    }

    // Remover registro de upload
    await supabase
      .from('pptx_uploads')
      .delete()
      .eq('id', uploadId)

    // Notificar sala do projeto (opcional)
    const roomId = `project:${upload.project_id}:uploads`
    notificationManager.sendNotification({
      id: `upload_${uploadId}_deleted_${Date.now()}`,
      type: 'system_alert',
      title: 'Upload removido',
      message: `O upload ${upload.original_filename || upload.filename} foi removido do projeto`,
      priority: 'low',
      timestamp: Date.now(),
      roomId,
      data: { uploadId, projectId: upload.project_id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir upload:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
})