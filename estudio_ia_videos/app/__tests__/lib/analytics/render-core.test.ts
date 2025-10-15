import { computeBasicStats, computePerformanceMetrics, computeErrorAnalysis, computeQueueStats, computeErrorCategories, normalizeErrorMessage, BasicRenderJob } from '../../../lib/analytics/render-core'

function makeJob(partial: Partial<BasicRenderJob>): BasicRenderJob {
  return {
    id: partial.id || crypto.randomUUID(),
    status: partial.status || 'pending',
    created_at: partial.created_at || new Date().toISOString(),
    started_at: partial.started_at ?? null,
    completed_at: partial.completed_at ?? null,
    error_message: partial.error_message ?? null,
    render_settings: partial.render_settings
  }
}

describe('render-core metrics', () => {
  const baseTime = Date.now()
  const t = (offsetMs: number) => new Date(baseTime + offsetMs).toISOString()

  const sample: BasicRenderJob[] = [
  makeJob({ id: '1', status: 'completed', started_at: t(0), completed_at: t(10_000), render_settings: { resolution: '1080p', format: 'mp4' } }), // 10s
    makeJob({ id: '2', status: 'completed', started_at: t(0), completed_at: t(5_000), render_settings: { resolution: '1080p', format: 'mp4' } }), // 5s
    makeJob({ id: '3', status: 'failed', started_at: t(0), completed_at: t(3_000), error_message: 'RenderTimeout: exceeded' }),
    makeJob({ id: '4', status: 'processing', started_at: t(2_000) }),
    makeJob({ id: '5', status: 'pending' })
  ]

  test('computeBasicStats', () => {
    const stats = computeBasicStats(sample)
    expect(stats.total_renders).toBe(5)
    expect(stats.successful_renders).toBe(2)
    expect(stats.failed_renders).toBe(1)
    // avg of 10s + 5s = 7.5 -> rounded 8
    expect(stats.avg_render_time).toBe(8)
    expect(stats.total_render_time).toBe(15)
    expect(stats.success_rate).toBe(Math.round((2/5)*100))
  })

  test('computePerformanceMetrics', () => {
    const perf = computePerformanceMetrics(sample)
    expect(perf.fastest_render).toBe(5)
    expect(perf.slowest_render).toBe(10)
    expect(perf.most_common_resolution).toBe('1080p')
    expect(perf.most_common_format).toBe('mp4')
    expect(perf.p50_render_time).toBeGreaterThanOrEqual(5)
    expect(perf.p90_render_time).toBeGreaterThanOrEqual(perf.p50_render_time || 0)
    expect(perf.p95_render_time).toBeGreaterThanOrEqual(perf.p90_render_time || 0)
  })

  test('computeErrorAnalysis', () => {
    const errs = computeErrorAnalysis(sample)
    expect(errs.length).toBe(1)
    expect(errs[0].error_type).toBe('RenderTimeout')
    expect(errs[0].count).toBe(1)
  })

  test('computeQueueStats', () => {
    const qs = computeQueueStats(sample)
    expect(qs.current_queue_length).toBe(1)
    expect(qs.processing_jobs).toBe(1)
    expect(typeof qs.avg_wait_time).toBe('number')
    expect(qs.peak_queue_time).toBeTruthy()
  })

  test('normalizeErrorMessage categories', () => {
    expect(normalizeErrorMessage('FFmpeg exited with code 1')).toBe('ffmpeg')
    expect(normalizeErrorMessage('NetworkError: timeout')).toBe('network')
    expect(normalizeErrorMessage('Connection timeout')).toBe('timeout')
    expect(normalizeErrorMessage('S3 upload failed')).toBe('storage')
    expect(normalizeErrorMessage('Permission denied')).toBe('auth')
    expect(normalizeErrorMessage('Validation failed: field invalid')).toBe('validation')
  })

  test('computeErrorCategories aggregates properly', () => {
    const jobs: BasicRenderJob[] = [
      makeJob({ id: 'e1', status: 'failed', error_message: 'FFmpeg: codec not found' }),
      makeJob({ id: 'e2', status: 'failed', error_message: 'FFmpeg: muxing error' }),
      makeJob({ id: 'e3', status: 'failed', error_message: 'Network error on segment' }),
      makeJob({ id: 'e4', status: 'failed', error_message: 'DNS failure' }),
      makeJob({ id: 'e5', status: 'failed', error_message: 'fetch() connection reset' }),
      makeJob({ id: 'e6', status: 'failed', error_message: 'S3 upload failed' })
    ]
    const cats = computeErrorCategories(jobs)
    const ffmpeg = cats.find(c=>c.category==='ffmpeg')
    const network = cats.find(c=>c.category==='network')
    const storage = cats.find(c=>c.category==='storage')
    expect(ffmpeg?.count).toBe(2)
    expect(network?.count).toBe(3)
    expect(storage?.count).toBe(1)
    expect((ffmpeg?.sample_errors||[]).length).toBeGreaterThan(0)
  })
})
