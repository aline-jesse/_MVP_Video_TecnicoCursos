// Tipos compartilhados para render jobs e estatísticas
// Centraliza enums e interfaces para remover ts-nocheck na rota de analytics

export const RENDER_JOB_STATUSES = [
  'pending',
  'queued',
  'processing',
  'completed',
  'failed',
  'cancelled'
] as const

export type RenderJobStatus = typeof RENDER_JOB_STATUSES[number]

export interface RenderJobRecord {
  id: string
  user_id?: string
  status: RenderJobStatus
  created_at: string
  started_at: string | null
  completed_at: string | null
  error_message: string | null
  render_settings?: any
}
