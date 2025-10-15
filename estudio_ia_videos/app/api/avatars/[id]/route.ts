import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema de validação para atualização de avatar
const updateAvatarSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  ready_player_me_url: z.string().url().optional(),
  avatar_type: z.enum(['full_body', 'half_body', 'head_only']).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  style: z.enum(['realistic', 'cartoon', 'anime']).optional(),
  animations: z.array(z.object({
    name: z.string(),
    type: z.enum(['idle', 'talking', 'gesture', 'emotion', 'custom']),
    duration: z.number().positive(),
    loop: z.boolean().default(false),
    file_url: z.string().url().optional()
  })).optional(),
  voice_settings: z.object({
    voice_id: z.string().optional(),
    language: z.string().optional(),
    speed: z.number().min(0.5).max(2.0).optional(),
    pitch: z.number().min(-20).max(20).optional(),
    volume: z.number().min(0).max(1).optional()
  }).optional(),
  properties: z.record(z.any()).optional()
})

// GET - Obter detalhes de um avatar específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const avatarId = params.id

    // Buscar avatar com dados relacionados
    const { data: avatar, error } = await supabase
      .from('avatars_3d')
      .select(`
        *,
        projects:project_id (
          id,
          name,
          owner_id,
          collaborators,
          is_public
        )
      `)
      .eq('id', avatarId)
      .single()

    if (error || !avatar) {
      return NextResponse.json(
        { error: 'Avatar não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const project = avatar.projects as any
    const hasPermission = project.owner_id === user.id || 
                         project.collaborators?.includes(user.id) ||
                         project.is_public

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Sem permissão para acessar este avatar' },
        { status: 403 }
      )
    }

    // Atualizar último acesso
    await supabase
      .from('avatars_3d')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', avatarId)

    return NextResponse.json({ avatar })

  } catch (error) {
    console.error('Erro ao buscar avatar:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar avatar
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const avatarId = params.id
    const body = await request.json()

    // Validar dados
    const validatedData = updateAvatarSchema.parse(body)

    // Verificar se avatar existe e permissões
    const { data: avatar } = await supabase
      .from('avatars_3d')
      .select(`
        *,
        projects:project_id (
          owner_id,
          collaborators
        )
      `)
      .eq('id', avatarId)
      .single()

    if (!avatar) {
      return NextResponse.json(
        { error: 'Avatar não encontrado' },
        { status: 404 }
      )
    }

    const project = avatar.projects as any
    const hasPermission = project.owner_id === user.id || 
                         project.collaborators?.includes(user.id)

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Sem permissão para atualizar este avatar' },
        { status: 403 }
      )
    }

    // Se mudando nome, verificar conflitos
    if (validatedData.name && validatedData.name !== avatar.name) {
      const { data: existingAvatar } = await supabase
        .from('avatars_3d')
        .select('id')
        .eq('project_id', avatar.project_id)
        .eq('name', validatedData.name)
        .neq('id', avatarId)
        .single()

      if (existingAvatar) {
        return NextResponse.json(
          { error: `Já existe um avatar com nome "${validatedData.name}" neste projeto` },
          { status: 409 }
        )
      }
    }

    // Preparar dados para atualização
    let updateData: any = {
      ...validatedData,
      updated_at: new Date().toISOString()
    }

    // Se mudando URL do Ready Player Me, buscar novos dados
    if (validatedData.ready_player_me_url && validatedData.ready_player_me_url !== avatar.ready_player_me_url) {
      if (!isValidReadyPlayerMeUrl(validatedData.ready_player_me_url)) {
        return NextResponse.json(
          { error: 'URL do Ready Player Me inválida' },
          { status: 400 }
        )
      }

      const avatarData = await fetchReadyPlayerMeData(validatedData.ready_player_me_url)
      updateData.model_url = avatarData.model_url
      updateData.thumbnail_url = avatarData.thumbnail_url
      updateData.metadata = avatarData.metadata
    }

    // Mesclar propriedades e configurações de voz se fornecidas
    if (validatedData.properties && avatar.properties) {
      updateData.properties = {
        ...avatar.properties,
        ...validatedData.properties
      }
    }

    if (validatedData.voice_settings && avatar.voice_settings) {
      updateData.voice_settings = {
        ...avatar.voice_settings,
        ...validatedData.voice_settings
      }
    }

    // Atualizar avatar
    const { data: updatedAvatar, error: updateError } = await supabase
      .from('avatars_3d')
      .update(updateData)
      .eq('id', avatarId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar avatar:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar avatar' },
        { status: 500 }
      )
    }

    // Registrar no histórico
    await supabase
      .from('project_history')
      .insert({
        project_id: avatar.project_id,
        user_id: user.id,
        action: 'update',
        entity_type: 'avatar_3d',
        entity_id: avatarId,
        description: `Avatar 3D "${avatar.name}" atualizado`,
        changes: validatedData
      })

    return NextResponse.json({ avatar: updatedAvatar })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar avatar:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir avatar
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const avatarId = params.id

    // Verificar se avatar existe e permissões
    const { data: avatar } = await supabase
      .from('avatars_3d')
      .select(`
        *,
        projects:project_id (
          owner_id,
          collaborators
        )
      `)
      .eq('id', avatarId)
      .single()

    if (!avatar) {
      return NextResponse.json(
        { error: 'Avatar não encontrado' },
        { status: 404 }
      )
    }

    const project = avatar.projects as any
    const hasPermission = project.owner_id === user.id || 
                         project.collaborators?.includes(user.id)

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Sem permissão para excluir este avatar' },
        { status: 403 }
      )
    }

    // Verificar se avatar está sendo usado em elementos da timeline
    const { data: usedInElements } = await supabase
      .from('timeline_elements')
      .select('id')
      .eq('type', 'avatar_3d')
      .contains('properties', { avatar_id: avatarId })
      .limit(1)

    if (usedInElements && usedInElements.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir avatar que está sendo usado na timeline' },
        { status: 400 }
      )
    }

    // Excluir avatar
    const { error: deleteError } = await supabase
      .from('avatars_3d')
      .delete()
      .eq('id', avatarId)

    if (deleteError) {
      console.error('Erro ao excluir avatar:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao excluir avatar' },
        { status: 500 }
      )
    }

    // Registrar no histórico
    await supabase
      .from('project_history')
      .insert({
        project_id: avatar.project_id,
        user_id: user.id,
        action: 'delete',
        entity_type: 'avatar_3d',
        entity_id: avatarId,
        description: `Avatar 3D "${avatar.name}" excluído`,
        changes: {
          deleted_avatar: {
            name: avatar.name,
            avatar_type: avatar.avatar_type,
            style: avatar.style
          }
        }
      })

    return NextResponse.json({ 
      message: 'Avatar excluído com sucesso' 
    })

  } catch (error) {
    console.error('Erro ao excluir avatar:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função para validar URL do Ready Player Me
function isValidReadyPlayerMeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.includes('readyplayer.me') || 
           urlObj.hostname.includes('models.readyplayer.me')
  } catch {
    return false
  }
}

// Função para buscar dados do Ready Player Me (simulada)
async function fetchReadyPlayerMeData(url: string) {
  // Em produção, isso faria uma requisição real para a API do Ready Player Me
  const avatarId = url.split('/').pop()?.split('.')[0] || 'default'
  
  return {
    model_url: `https://models.readyplayer.me/${avatarId}.glb`,
    thumbnail_url: `https://models.readyplayer.me/${avatarId}.png`,
    metadata: {
      id: avatarId,
      created_at: new Date().toISOString(),
      body_type: 'fullbody',
      outfit: 'casual',
      hair_color: '#8B4513',
      skin_color: '#FDBCB4',
      eye_color: '#4A90E2'
    }
  }
}