export type RenderTaskPayload = {
  projectId: string
  userId: string
  slidesBucketPath: string
  outputBucketPath: string
}

export type RenderTaskResult = {
  jobId: string
  outputUrl: string
  durationMs: number
}
