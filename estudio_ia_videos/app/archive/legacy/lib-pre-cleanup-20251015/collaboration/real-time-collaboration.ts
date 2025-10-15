

// Sistema de Colaboração em Tempo Real Avançado
export interface CollaborationSession {
  id: string
  project_id: string
  owner_id: string
  participants: CollaborationParticipant[]
  status: 'active' | 'paused' | 'ended'
  created_at: string
  last_activity: string
  permissions: CollaborationPermissions
  real_time_data: {
    cursors: Record<string, CursorPosition>
    selections: Record<string, ElementSelection>
    active_tools: Record<string, ActiveTool>
    chat_messages: ChatMessage[]
  }
}

export interface CollaborationParticipant {
  user_id: string
  name: string
  email: string
  avatar_url?: string
  role: 'owner' | 'editor' | 'viewer' | 'reviewer'
  status: 'online' | 'away' | 'offline'
  joined_at: string
  last_seen: string
  cursor_color: string
  permissions: {
    can_edit: boolean
    can_comment: boolean
    can_export: boolean
    can_invite: boolean
  }
}

export interface CollaborationPermissions {
  is_public: boolean
  require_approval: boolean
  max_participants: number
  allowed_roles: ('editor' | 'viewer' | 'reviewer')[]
  expiration_date?: string
  password_required: boolean
  password?: string
}

export interface CursorPosition {
  user_id: string
  x: number
  y: number
  component: string
  timestamp: string
  color: string
}

export interface ElementSelection {
  user_id: string
  element_id: string
  element_type: 'scene' | 'avatar' | 'text' | 'image' | 'audio'
  selection_bounds?: {
    x: number
    y: number
    width: number
    height: number
  }
  timestamp: string
}

export interface ActiveTool {
  user_id: string
  tool_name: string
  tool_options: any
  started_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  user_name: string
  message: string
  timestamp: string
  type: 'text' | 'system' | 'mention' | 'file'
  mentions?: string[]
  attachments?: {
    type: 'image' | 'file' | 'link'
    url: string
    name: string
  }[]
  reactions?: {
    emoji: string
    users: string[]
  }[]
}

export interface ChangeOperation {
  id: string
  user_id: string
  timestamp: string
  operation_type: 'insert' | 'delete' | 'update' | 'move'
  target: {
    element_id: string
    element_type: string
    path: string[]
  }
  data: {
    before?: any
    after?: any
    position?: { x: number, y: number }
  }
  conflict_resolution?: 'auto' | 'manual' | 'last_writer_wins'
}

export interface ConflictResolution {
  conflict_id: string
  operations: ChangeOperation[]
  conflict_type: 'concurrent_edit' | 'delete_vs_edit' | 'move_conflict'
  resolution_strategy: 'merge' | 'user_choice' | 'automatic'
  resolved_by?: string
  resolved_at?: string
  final_state: any
}

export class RealTimeCollaboration {
  
  // Gerenciador de sessões de colaboração
  static async createCollaborationSession(
    project_id: string,
    owner_id: string,
    permissions: CollaborationPermissions
  ): Promise<CollaborationSession> {
    
    const session: CollaborationSession = {
      id: `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      project_id,
      owner_id,
      participants: [],
      status: 'active',
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      permissions,
      real_time_data: {
        cursors: {},
        selections: {},
        active_tools: {},
        chat_messages: []
      }
    }

    return session
  }

  // Sistema de convites inteligente
  static async inviteParticipant(
    session_id: string,
    invitee_email: string,
    role: CollaborationParticipant['role'],
    personal_message?: string
  ): Promise<{
    invitation_id: string
    invitation_url: string
    expires_at: string
  }> {
    
    const invitation_id = `invite-${Date.now()}`
    const invitation_url = `https://estudio-ia.com/collaboration/${session_id}?invite=${invitation_id}`
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    
    // Simular envio de convite por email
    await this.sendCollaborationInvite({
      invitation_id,
      invitee_email,
      role,
      invitation_url,
      expires_at,
      personal_message
    })

    return {
      invitation_id,
      invitation_url,
      expires_at
    }
  }

  // Sistema de sincronização em tempo real
  static async syncCollaborationState(
    session_id: string,
    operation: ChangeOperation
  ): Promise<{
    applied: boolean
    conflicts: ConflictResolution[]
    updated_state: any
    notifications: Array<{
      user_id: string
      type: 'conflict' | 'update' | 'info'
      message: string
    }>
  }> {
    
    // Simular detecção de conflitos
    const conflicts: ConflictResolution[] = []
    
    // Verificar conflitos concorrentes
    const concurrent_operations = await this.detectConcurrentOperations(session_id, operation)
    
    if (concurrent_operations.length > 0) {
      const conflict: ConflictResolution = {
        conflict_id: `conflict-${Date.now()}`,
        operations: [operation, ...concurrent_operations],
        conflict_type: 'concurrent_edit',
        resolution_strategy: 'merge',
        final_state: await this.resolveConflictAutomatically(operation, concurrent_operations)
      }
      conflicts.push(conflict)
    }

    return {
      applied: conflicts.length === 0,
      conflicts,
      updated_state: operation.data.after,
      notifications: conflicts.map(conflict => ({
        user_id: operation.user_id,
        type: 'conflict' as const,
        message: `Conflito resolvido automaticamente em ${conflict.conflict_type}`
      }))
    }
  }

  // Chat colaborativo avançado
  static async sendChatMessage(
    session_id: string,
    user_id: string,
    message_data: {
      message: string
      type: 'text' | 'system' | 'mention'
      mentions?: string[]
      attachments?: any[]
    }
  ): Promise<ChatMessage> {
    
    const chatMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      user_id,
      user_name: await this.getUserName(user_id),
      message: message_data.message,
      timestamp: new Date().toISOString(),
      type: message_data.type,
      mentions: message_data.mentions,
      attachments: message_data.attachments,
      reactions: []
    }

    // Processar menções
    if (message_data.mentions) {
      await this.processMessageMentions(session_id, chatMessage)
    }

    return chatMessage
  }

  // Sistema de presença em tempo real
  static async updateUserPresence(
    session_id: string,
    user_id: string,
    presence_data: {
      cursor_position?: { x: number, y: number, component: string }
      selected_element?: string
      active_tool?: string
      status: 'online' | 'away' | 'typing'
    }
  ): Promise<void> {
    
    // Atualizar cursor
    if (presence_data.cursor_position) {
      await this.updateCursorPosition(session_id, user_id, presence_data.cursor_position)
    }

    // Atualizar seleção
    if (presence_data.selected_element) {
      await this.updateElementSelection(session_id, user_id, presence_data.selected_element)
    }

    // Atualizar ferramenta ativa
    if (presence_data.active_tool) {
      await this.updateActiveTool(session_id, user_id, presence_data.active_tool)
    }

    // Broadcast para outros participantes
    await this.broadcastPresenceUpdate(session_id, user_id, presence_data)
  }

  // Sistema de controle de versão colaborativo
  static async createProjectSnapshot(
    session_id: string,
    user_id: string,
    snapshot_name: string
  ): Promise<{
    snapshot_id: string
    created_at: string
    changes_since_last: number
    participants_active: string[]
  }> {
    
    const snapshot_id = `snapshot-${Date.now()}`
    
    return {
      snapshot_id,
      created_at: new Date().toISOString(),
      changes_since_last: 24, // number of operations
      participants_active: ['user-1', 'user-2']
    }
  }

  // Sistema de aprovação colaborativa
  static async requestApproval(
    session_id: string,
    requester_id: string,
    approval_data: {
      type: 'publish' | 'export' | 'major_change'
      description: string
      changes_summary: string[]
      required_approvers: string[]
    }
  ): Promise<{
    approval_id: string
    status: 'pending' | 'approved' | 'rejected'
    approvals: Array<{
      user_id: string
      status: 'pending' | 'approved' | 'rejected'
      timestamp?: string
      comments?: string
    }>
  }> {
    
    const approval_id = `approval-${Date.now()}`
    
    return {
      approval_id,
      status: 'pending',
      approvals: approval_data.required_approvers.map(user_id => ({
        user_id,
        status: 'pending'
      }))
    }
  }

  // Analytics de colaboração
  static async getCollaborationAnalytics(
    session_id: string,
    time_range: { start: string, end: string }
  ): Promise<{
    session_metrics: {
      total_participants: number
      average_concurrent_users: number
      total_operations: number
      conflicts_resolved: number
      chat_messages: number
    }
    productivity_metrics: {
      operations_per_minute: number
      average_response_time: number
      feature_usage_distribution: Record<string, number>
      peak_activity_hours: string[]
    }
    quality_metrics: {
      conflict_rate: number
      resolution_time_avg: number
      user_satisfaction: number
      completion_rate: number
    }
  }> {
    
    return {
      session_metrics: {
        total_participants: 4,
        average_concurrent_users: 2.3,
        total_operations: 156,
        conflicts_resolved: 3,
        chat_messages: 47
      },
      productivity_metrics: {
        operations_per_minute: 2.8,
        average_response_time: 0.08, // seconds
        feature_usage_distribution: {
          'avatar_editing': 34,
          'voice_adjustment': 28,
          'timeline_editing': 45,
          'chat': 47,
          'comments': 12
        },
        peak_activity_hours: ['14:00-16:00', '09:00-11:00']
      },
      quality_metrics: {
        conflict_rate: 1.9, // %
        resolution_time_avg: 0.15, // seconds
        user_satisfaction: 4.6, // 0-5 scale
        completion_rate: 94.2
      }
    }
  }

  // Helper methods
  private static async sendCollaborationInvite(invite_data: any): Promise<void> {
    console.log('Convite enviado:', invite_data)
    // Em produção, integrar com serviço de email
  }

  private static async getUserName(user_id: string): Promise<string> {
    // Simular busca de nome do usuário
    const names = ['Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Costa']
    return names[Math.floor(Math.random() * names.length)]
  }

  private static async detectConcurrentOperations(
    session_id: string, 
    operation: ChangeOperation
  ): Promise<ChangeOperation[]> {
    // Simular detecção de operações concorrentes
    return []
  }

  private static async resolveConflictAutomatically(
    operation: ChangeOperation,
    concurrent_operations: ChangeOperation[]
  ): Promise<any> {
    // Implementar estratégias de resolução automática
    return operation.data.after
  }

  private static async processMessageMentions(
    session_id: string,
    message: ChatMessage
  ): Promise<void> {
    // Processar menções e notificar usuários
    console.log('Processando menções:', message.mentions)
  }

  private static async updateCursorPosition(
    session_id: string,
    user_id: string,
    position: { x: number, y: number, component: string }
  ): Promise<void> {
    // Atualizar posição do cursor em tempo real
  }

  private static async updateElementSelection(
    session_id: string,
    user_id: string,
    element_id: string
  ): Promise<void> {
    // Atualizar seleção de elemento
  }

  private static async updateActiveTool(
    session_id: string,
    user_id: string,
    tool: string
  ): Promise<void> {
    // Atualizar ferramenta ativa
  }

  private static async broadcastPresenceUpdate(
    session_id: string,
    user_id: string,
    presence_data: any
  ): Promise<void> {
    // Broadcast para outros usuários via WebSocket
  }
}

// Sistema de operações distribuídas (CRDT-like)
export class DistributedOperations {
  
  // Operational Transform para sincronização
  static transformOperation(
    operation: ChangeOperation,
    concurrent_operation: ChangeOperation
  ): ChangeOperation {
    
    // Implementar transformação operacional
    switch (operation.operation_type) {
      case 'insert':
        return this.transformInsert(operation, concurrent_operation)
      case 'delete':
        return this.transformDelete(operation, concurrent_operation)
      case 'update':
        return this.transformUpdate(operation, concurrent_operation)
      case 'move':
        return this.transformMove(operation, concurrent_operation)
      default:
        return operation
    }
  }

  private static transformInsert(op: ChangeOperation, concurrent: ChangeOperation): ChangeOperation {
    // Transformar operação de inserção
    if (concurrent.operation_type === 'insert' && 
        op.target.element_id === concurrent.target.element_id) {
      // Ajustar posição se inserção no mesmo elemento
      if (op.data.position && concurrent.data.position) {
        if (concurrent.data.position.x <= op.data.position.x) {
          op.data.position.x += 1 // Ajustar posição
        }
      }
    }
    return op
  }

  private static transformDelete(op: ChangeOperation, concurrent: ChangeOperation): ChangeOperation {
    // Transformar operação de deleção
    if (concurrent.operation_type === 'delete' && 
        op.target.element_id === concurrent.target.element_id) {
      // Conflito: ambos tentando deletar o mesmo elemento
      // Última operação vence
      op.conflict_resolution = 'last_writer_wins'
    }
    return op
  }

  private static transformUpdate(op: ChangeOperation, concurrent: ChangeOperation): ChangeOperation {
    // Transformar operação de atualização
    if (concurrent.operation_type === 'update' && 
        op.target.element_id === concurrent.target.element_id) {
      // Merge das propriedades se possível
      op.data.after = {
        ...concurrent.data.after,
        ...op.data.after
      }
    }
    return op
  }

  private static transformMove(op: ChangeOperation, concurrent: ChangeOperation): ChangeOperation {
    // Transformar operação de movimento
    return op
  }
}

// Sistema de comentários e feedback
export interface ProjectComment {
  id: string
  user_id: string
  user_name: string
  user_avatar?: string
  timestamp: string
  content: string
  type: 'general' | 'suggestion' | 'issue' | 'approval'
  target?: {
    element_id: string
    element_type: string
    timestamp_position?: number // Para comentários em vídeo
    scene_id?: string
  }
  replies: ProjectComment[]
  status: 'open' | 'resolved' | 'dismissed'
  resolved_by?: string
  resolved_at?: string
  attachments?: {
    type: 'image' | 'file' | 'link'
    url: string
    name: string
  }[]
  tags: string[]
}

export class CollaborativeComments {
  
  static async addComment(
    session_id: string,
    user_id: string,
    comment_data: {
      content: string
      type: ProjectComment['type']
      target?: ProjectComment['target']
      tags?: string[]
    }
  ): Promise<ProjectComment> {
    
    const comment: ProjectComment = {
      id: `comment-${Date.now()}`,
      user_id,
      user_name: await this.getUserName(user_id),
      timestamp: new Date().toISOString(),
      content: comment_data.content,
      type: comment_data.type,
      target: comment_data.target,
      replies: [],
      status: 'open',
      tags: comment_data.tags || []
    }

    // Notificar outros participantes
    await this.notifyParticipants(session_id, 'new_comment', comment)

    return comment
  }

  static async replyToComment(
    comment_id: string,
    user_id: string,
    reply_content: string
  ): Promise<ProjectComment> {
    
    const reply: ProjectComment = {
      id: `reply-${Date.now()}`,
      user_id,
      user_name: await this.getUserName(user_id),
      timestamp: new Date().toISOString(),
      content: reply_content,
      type: 'general',
      replies: [],
      status: 'open',
      tags: []
    }

    return reply
  }

  static async resolveComment(
    comment_id: string,
    resolver_id: string,
    resolution_note?: string
  ): Promise<void> {
    // Marcar comentário como resolvido
    console.log(`Comentário ${comment_id} resolvido por ${resolver_id}`)
  }

  private static async getUserName(user_id: string): Promise<string> {
    const names = ['Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Costa']
    return names[Math.floor(Math.random() * names.length)]
  }

  private static async notifyParticipants(
    session_id: string,
    event_type: string,
    data: any
  ): Promise<void> {
    // Notificar via WebSocket ou push notification
    console.log(`Notificação ${event_type} enviada para sessão ${session_id}`)
  }
}

// Sistema de versionamento colaborativo
export interface VersionHistory {
  version_id: string
  timestamp: string
  author_id: string
  author_name: string
  description: string
  changes: ChangeOperation[]
  snapshot_data: any
  tags: string[]
  is_major: boolean
  parent_version?: string
  branch_name?: string
}

export class CollaborativeVersioning {
  
  static async createVersion(
    project_id: string,
    user_id: string,
    changes: ChangeOperation[],
    version_description: string,
    is_major = false
  ): Promise<VersionHistory> {
    
    const version: VersionHistory = {
      version_id: `v${Date.now()}`,
      timestamp: new Date().toISOString(),
      author_id: user_id,
      author_name: await this.getUserName(user_id),
      description: version_description,
      changes,
      snapshot_data: {}, // Estado completo do projeto
      tags: is_major ? ['major', 'release'] : ['minor'],
      is_major,
      branch_name: 'main'
    }

    return version
  }

  static async compareVersions(
    version_a: string,
    version_b: string
  ): Promise<{
    differences: Array<{
      type: 'added' | 'removed' | 'modified'
      element_path: string
      old_value?: any
      new_value?: any
    }>
    similarity_score: number
    change_summary: {
      total_changes: number
      major_changes: number
      minor_changes: number
    }
  }> {
    
    return {
      differences: [
        {
          type: 'modified',
          element_path: 'scenes[0].avatar.voice',
          old_value: 'sp-carlos-tech',
          new_value: 'ba-antonio-mentor'
        },
        {
          type: 'added',
          element_path: 'scenes[2]',
          new_value: { title: 'Nova cena de segurança' }
        }
      ],
      similarity_score: 0.87,
      change_summary: {
        total_changes: 12,
        major_changes: 2,
        minor_changes: 10
      }
    }
  }

  private static async getUserName(user_id: string): Promise<string> {
    const names = ['Ana Silva', 'Carlos Santos', 'Maria Oliveira', 'João Costa']
    return names[Math.floor(Math.random() * names.length)]
  }
}

