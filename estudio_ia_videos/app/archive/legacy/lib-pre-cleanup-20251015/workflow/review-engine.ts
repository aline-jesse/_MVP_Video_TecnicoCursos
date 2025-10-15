
/**
 * 📋 REVIEW WORKFLOW ENGINE - Sprint 44
 * Sistema de revisão e aprovação de projetos
 */

import { prisma } from '@/lib/db'

export type ReviewStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'published'

export interface ReviewRequest {
  id: string
  projectId: string
  requestedBy: string
  reviewers: string[]
  status: ReviewStatus
  comments?: string
  createdAt: Date
  resolvedAt?: Date
  resolvedBy?: string
}

export class ReviewEngine {
  static async requestReview(
    projectId: string,
    requestedBy: string,
    reviewers: string[],
    message?: string
  ): Promise<ReviewRequest> {
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      throw new Error('Projeto não encontrado')
    }

    const reviewRequest = await prisma.reviewRequest.create({
      data: {
        projectId,
        requestedBy,
        reviewers: JSON.stringify(reviewers),
        status: 'review',
        comments: message,
        metadata: { message }
      }
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'REVIEW' }
    })

    return {
      id: reviewRequest.id,
      projectId: reviewRequest.projectId,
      requestedBy: reviewRequest.requestedBy,
      reviewers: JSON.parse(reviewRequest.reviewers as string),
      status: reviewRequest.status as ReviewStatus,
      comments: reviewRequest.comments || undefined,
      createdAt: reviewRequest.createdAt,
      resolvedAt: reviewRequest.resolvedAt || undefined,
      resolvedBy: reviewRequest.resolvedBy || undefined
    }
  }

  static async approve(
    reviewRequestId: string,
    reviewerId: string,
    comments: string
  ): Promise<void> {
    if (!comments || comments.trim().length === 0) {
      throw new Error('Comentário obrigatório para aprovação')
    }

    const reviewRequest = await prisma.reviewRequest.findUnique({
      where: { id: reviewRequestId }
    })

    if (!reviewRequest) {
      throw new Error('Review request não encontrado')
    }

    await prisma.reviewRequest.update({
      where: { id: reviewRequestId },
      data: {
        status: 'approved',
        resolvedBy: reviewerId,
        resolvedAt: new Date(),
        comments: comments
      }
    })

    await prisma.project.update({
      where: { id: reviewRequest.projectId },
      data: { status: 'APPROVED' }
    })
  }

  static async reject(
    reviewRequestId: string,
    reviewerId: string,
    comments: string
  ): Promise<void> {
    if (!comments || comments.trim().length === 0) {
      throw new Error('Comentário obrigatório para reprovação')
    }

    const reviewRequest = await prisma.reviewRequest.findUnique({
      where: { id: reviewRequestId }
    })

    if (!reviewRequest) {
      throw new Error('Review request não encontrado')
    }

    await prisma.reviewRequest.update({
      where: { id: reviewRequestId },
      data: {
        status: 'rejected',
        resolvedBy: reviewerId,
        resolvedAt: new Date(),
        comments: comments
      }
    })

    await prisma.project.update({
      where: { id: reviewRequest.projectId },
      data: { status: 'DRAFT' }
    })
  }

  static async canPublish(projectId: string): Promise<{
    allowed: boolean
    reason?: string
  }> {
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return { allowed: false, reason: 'Projeto não encontrado' }
    }

    if (project.status !== 'APPROVED' && project.status !== 'PUBLISHED') {
      return { 
        allowed: false, 
        reason: `Projeto deve estar aprovado. Status atual: ${project.status}` 
      }
    }

    return { allowed: true }
  }

  static async publish(
    projectId: string,
    userId: string,
    overrideCompliance: boolean = false
  ): Promise<void> {
    if (!overrideCompliance) {
      const check = await this.canPublish(projectId)
      if (!check.allowed) {
        throw new Error(check.reason)
      }
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'PUBLISHED' }
    })
  }

  static async getReviewHistory(projectId: string): Promise<ReviewRequest[]> {
    const requests = await prisma.reviewRequest.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    })

    return requests.map((r: any) => ({
      id: r.id,
      projectId: r.projectId,
      requestedBy: r.requestedBy,
      reviewers: JSON.parse(r.reviewers as string),
      status: r.status as ReviewStatus,
      comments: r.comments || undefined,
      createdAt: r.createdAt,
      resolvedAt: r.resolvedAt || undefined,
      resolvedBy: r.resolvedBy || undefined
    }))
  }
}
