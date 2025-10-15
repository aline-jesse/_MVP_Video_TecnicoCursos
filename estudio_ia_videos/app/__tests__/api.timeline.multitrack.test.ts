/**
 * Testes das rotas /api/v1/timeline/multi-track (POST e GET)
 */
// @jest-environment node
/// <reference types="jest" />
import { NextRequest } from 'next/server'
import * as timelineRoute from '../api/v1/timeline/multi-track/route'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    project: { findFirst: jest.fn().mockResolvedValue({ id: 'p1', userId: 'u1', name: 'Projeto' }) },
    timeline: {
      upsert: jest.fn().mockImplementation(async ({ create, update }) => ({ id: 't1', projectId: 'p1', version: 2, totalDuration: update?.totalDuration ?? create?.totalDuration ?? 300, tracks: update?.tracks ?? create?.tracks ?? [], settings: update?.settings ?? create?.settings ?? {}, updatedAt: new Date() })),
      findUnique: jest.fn().mockResolvedValue({ id: 't1', projectId: 'p1', version: 2, totalDuration: 300, tracks: [], settings: { fps: 30, resolution: '1920x1080', quality: 'hd' }, createdAt: new Date(), updatedAt: new Date(), project: { id: 'p1', name: 'Projeto', status: 'DRAFT', userId: 'u1' } }),
    }
  }
}))

jest.mock('next-auth', () => ({ getServerSession: jest.fn().mockResolvedValue({ user: { id: 'u1' } }) }))
jest.mock('@/lib/auth/auth-config', () => ({ authConfig: {} }))
jest.mock('@/lib/analytics/analytics-tracker', () => ({ AnalyticsTracker: { trackTimelineEdit: jest.fn().mockResolvedValue(true) } }))

function makeRequest(method: string, url: string, body?: any) {
  const init: any = { method, headers: { 'content-type': 'application/json' } }
  if (body) init.body = JSON.stringify(body)
  return new NextRequest(new URL(url, 'http://localhost').toString(), init)
}

describe('API timeline multi-track', () => {
  it('POST salva timeline com sucesso', async () => {
    const req = makeRequest('POST', '/api/v1/timeline/multi-track', {
      projectId: 'p1',
      tracks: [{ id: 'track1', type: 'video', duration: 100 }],
      totalDuration: 100,
      exportSettings: { fps: 60, resolution: '3840x2160', format: 'webm', quality: '4k' }
    }) as any
    const res = await timelineRoute.POST(req)
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data?.projectId).toBe('p1')
    // Verificar que settings foram devolvidos no payload de resposta
    expect(json.data?.settings?.fps).toBe(60)
    expect(json.data?.settings?.resolution).toBe('3840x2160')
  expect(json.data?.settings?.format).toBe('webm')
  expect(json.data?.settings?.quality).toBe('4k')
  })

  it('GET carrega timeline com sucesso', async () => {
    const req = makeRequest('GET', '/api/v1/timeline/multi-track?projectId=p1') as any
    const res = await timelineRoute.GET(req)
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data?.projectId).toBe('p1')
    expect(json.data?.settings?.fps).toBe(30)
  expect(json.data?.settings?.resolution).toBe('1920x1080')
  expect(json.data?.settings?.quality).toBe('hd')
  })
})
