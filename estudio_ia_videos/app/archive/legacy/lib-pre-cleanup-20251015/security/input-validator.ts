
/**
 * ✅ INPUT VALIDATOR - Sprint 44
 * Validação rigorosa de inputs
 */

import { z } from 'zod'

export const schemas = {
  voiceCreate: z.object({
    name: z.string().min(3).max(50),
    samples: z.array(z.any()).min(3).max(5)
  }),

  complianceCheck: z.object({
    projectId: z.string().uuid()
  }),

  certificateMint: z.object({
    orgId: z.string(),
    projectId: z.string().uuid(),
    userId: z.string()
  }),

  reviewRequest: z.object({
    projectId: z.string().uuid(),
    reviewers: z.array(z.string().email()).min(1),
    message: z.string().optional()
  }),

  reviewApprove: z.object({
    reviewRequestId: z.string(),
    comments: z.string().min(10).max(500)
  }),

  projectPublish: z.object({
    projectId: z.string().uuid(),
    overrideCompliance: z.boolean().optional()
  })
}

export function validateInput<T extends keyof typeof schemas>(
  schema: T,
  data: any
): z.infer<typeof schemas[T]> {
  return schemas[schema].parse(data)
}
