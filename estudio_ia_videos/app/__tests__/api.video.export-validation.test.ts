// @ts-nocheck
/**
 * Testes de validação de combinações formato/codec/qualidade na rota POST export-real
 */
// @jest-environment node
/// <reference types="jest" />
import { NextRequest } from 'next/server'
import * as exportRoute from '@/api/v1/video/export-real/route'

jest.mock('@/lib/video-export-real', () => ({
  exportProjectVideo: jest.fn().mockResolvedValue({ success: true, jobId: 'job-valid-1' }),
}))

function makeRequest(method: string, url: string, body?: any) {
  const init: any = { method, headers: { 'content-type': 'application/json' } }
  if (body) init.body = JSON.stringify(body)
  return new NextRequest(new URL(url, 'http://localhost').toString(), init)
}

describe('API video export-real (validações)', () => {
  it('retorna 400 para webm + h264', async () => {
    const req = makeRequest('POST', '/api/v1/video/export-real', { projectId: 'p1', options: { format: 'webm', codec: 'h264', quality: 'hd', fps: 30 } }) as any
    const res = await exportRoute.POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/webm.*vp9|av1/i)
  })

  it('aceita webm + vp9', async () => {
    const req = makeRequest('POST', '/api/v1/video/export-real', { projectId: 'p1', options: { format: 'webm', codec: 'vp9', quality: 'hd', fps: 30 } }) as any
    const res = await exportRoute.POST(req)
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.jobId).toBeDefined()
  })
})
