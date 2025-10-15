type QueueConfig = {
  redisUrl: string
  queueName: string
}

let cachedConfig: QueueConfig | null = null

export function getQueueConfig(): QueueConfig {
  if (cachedConfig) {
    return cachedConfig
  }

  const redisUrl = process.env.REDIS_URL
  const queueName = process.env.RENDER_QUEUE_NAME ?? 'render-jobs'

  if (!redisUrl) {
    throw new Error('Missing REDIS_URL environment variable for render queue')
  }

  cachedConfig = { redisUrl, queueName }
  return cachedConfig
}
