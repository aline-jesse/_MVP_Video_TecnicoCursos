/**
 * Teste da rota /api/v1/video/export-real (GET status)
 */
const { NextRequest } = require('next/server')
const exportRoute = require('../api/v1/video/export-real/route')

jest.mock('../lib/video-export-real.ts', () => ({
  getExportJobStatus: jest.fn().mockResolvedValue({
    job: {
      id: 'job1', projectId: 'p1', status: 'processing', progress: 40,
      outputUrl: null, error: null, startedAt: new Date(), completedAt: null, metadata: {}
    }
  })
}))

function makeRequest(method, url) {
  return new NextRequest(new URL(url, 'http://localhost').toString(), { method })
}

describe('API video export-real', () => {
  it('GET retorna status do job', async () => {
    const req = makeRequest('GET', '/api/v1/video/export-real?jobId=job1')
    const res = await exportRoute.GET(req)
    const json = await res.json()
    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.job?.id).toBe('job1')
  })
})
