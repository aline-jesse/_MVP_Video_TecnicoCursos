/**
 * PROJECTS SYSTEM - Implementação Real Completa
 * 
 * Sistema completo de gerenciamento de projetos com:
 * - CRUD completo
 * - Versionamento automático
 * - Compartilhamento e permissões
 * - Exportação em múltiplos formatos
 * - Duplicação e templates
 * - Busca avançada
 * 
 * @created 2025-10-07
 * @version 2.0.0
 */

import { PrismaClient } from '@prisma/client'
import { notificationsSystem } from './notifications-system-real'
import { renderQueueSystem } from './render-queue-real'
import archiver from 'archiver'
import { createWriteStream } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Tipos
export interface Project {
  id: string
  name: string
  description?: string
  type: ProjectType
  status: ProjectStatus
  visibility: ProjectVisibility
  thumbnail?: string
  duration: number
  config: ProjectConfig
  templateId?: string
  userId: string
  organizationId?: string
  tags: string[]
  views: number
  downloads: number
  lastEditedAt: Date
  createdAt: Date
  updatedAt: Date
}

export type ProjectType = 'video' | 'presentation' | 'animation' | 'training'

export type ProjectStatus = 'draft' | 'in-progress' | 'review' | 'approved' | 'published' | 'archived'

export type ProjectVisibility = 'private' | 'shared' | 'public'

export interface ProjectConfig {
  resolution: string
  fps: number
  backgroundColor: string
  scenes: Scene[]
  assets: string[]
  settings: ProjectSettings
}

export interface Scene {
  id: string
  name: string
  duration: number
  elements: SceneElement[]
}

export interface SceneElement {
  id: string
  type: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  content?: any
  style?: any
}

export interface ProjectSettings {
  autoSave: boolean
  autoSaveInterval: number
  gridEnabled: boolean
  snapToGrid: boolean
  showRulers: boolean
}

export interface ProjectShare {
  id: string
  projectId: string
  userId: string
  permission: SharePermission
  expiresAt?: Date
  createdAt: Date
}

export type SharePermission = 'view' | 'comment' | 'edit' | 'admin'

export interface ProjectVersion {
  id: string
  projectId: string
  version: number
  name?: string
  description?: string
  config: ProjectConfig
  createdBy: string
  createdAt: Date
}

export interface SearchFilters {
  query?: string
  type?: ProjectType
  status?: ProjectStatus
  tags?: string[]
  userId?: string
  organizationId?: string
  shared?: boolean
  minViews?: number
  dateFrom?: Date
  dateTo?: Date
}

export interface ExportOptions {
  format: 'json' | 'pdf' | 'zip' | 'html'
  includeAssets?: boolean
  includeVersions?: boolean
  watermark?: boolean
}

/**
 * Classe principal do sistema de projetos
 */
class ProjectsSystemReal {

  /**
   * Cria um novo projeto
   */
  async createProject(
    data: Omit<Project, 'id' | 'views' | 'downloads' | 'lastEditedAt' | 'createdAt' | 'updatedAt'>,
    userId: string
  ) {
    const project = await prisma.project.create({
      data: {
        ...data,
        userId,
        views: 0,
        downloads: 0,
        lastEditedAt: new Date(),
        config: data.config as any
      }
    })

    // Criar versão inicial
    await this.createVersion(project.id, {
      version: 1,
      name: 'Versão Inicial',
      config: data.config,
      createdBy: userId
    })

    // Notificar usuário
    await notificationsSystem.send({
      userId,
      type: 'project_created',
      title: 'Projeto Criado',
      message: `Seu projeto "${data.name}" foi criado com sucesso!`,
      actionUrl: `/projects/${project.id}`,
      actionLabel: 'Abrir Projeto'
    })

    return project
  }

  /**
   * Obtém um projeto por ID
   */
  async getProject(id: string, userId?: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        shares: true,
        versions: {
          orderBy: { version: 'desc' },
          take: 5
        }
      }
    })

    if (!project) {
      throw new Error('Projeto não encontrado')
    }

    // Verificar permissão
    if (project.visibility === 'private' && project.userId !== userId) {
      const hasAccess = await this.checkUserAccess(id, userId || '')
      if (!hasAccess) {
        throw new Error('Sem permissão para acessar este projeto')
      }
    }

    // Incrementar visualizações
    await prisma.project.update({
      where: { id },
      data: { views: { increment: 1 } }
    })

    return project
  }

  /**
   * Atualiza um projeto
   */
  async updateProject(
    id: string,
    data: Partial<Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
    userId: string,
    createVersion: boolean = false
  ) {
    // Verificar permissão
    const hasPermission = await this.checkUserPermission(id, userId, 'edit')
    if (!hasPermission) {
      throw new Error('Sem permissão para editar este projeto')
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        lastEditedAt: new Date(),
        config: data.config as any
      }
    })

    // Criar versão se solicitado
    if (createVersion && data.config) {
      const lastVersion = await prisma.projectVersion.findFirst({
        where: { projectId: id },
        orderBy: { version: 'desc' }
      })

      await this.createVersion(id, {
        version: (lastVersion?.version || 0) + 1,
        name: data.name,
        config: data.config,
        createdBy: userId
      })
    }

    // Notificar colaboradores
    const shares = await prisma.projectShare.findMany({
      where: { projectId: id }
    })

    for (const share of shares) {
      if (share.userId !== userId) {
        await notificationsSystem.send({
          userId: share.userId,
          type: 'project_updated',
          title: 'Projeto Atualizado',
          message: `O projeto "${project.name}" foi atualizado`,
          actionUrl: `/projects/${id}`,
          actionLabel: 'Ver Alterações'
        })
      }
    }

    return project
  }

  /**
   * Deleta um projeto
   */
  async deleteProject(id: string, userId: string) {
    // Verificar permissão
    const project = await prisma.project.findUnique({
      where: { id }
    })

    if (!project) {
      throw new Error('Projeto não encontrado')
    }

    if (project.userId !== userId) {
      throw new Error('Apenas o criador pode deletar o projeto')
    }

    // Deletar versões
    await prisma.projectVersion.deleteMany({
      where: { projectId: id }
    })

    // Deletar compartilhamentos
    await prisma.projectShare.deleteMany({
      where: { projectId: id }
    })

    // Deletar comentários
    await prisma.projectComment.deleteMany({
      where: { projectId: id }
    })

    // Deletar projeto
    await prisma.project.delete({
      where: { id }
    })

    return { success: true }
  }

  /**
   * Busca projetos com filtros avançados
   */
  async searchProjects(
    filters: SearchFilters = {},
    page: number = 1,
    perPage: number = 20,
    userId?: string
  ) {
    const skip = (page - 1) * perPage

    const where: any = {}

    // Filtro de texto
    if (filters.query) {
      where.OR = [
        { name: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
        { tags: { hasSome: [filters.query] } }
      ]
    }

    // Filtros específicos
    if (filters.type) where.type = filters.type
    if (filters.status) where.status = filters.status
    if (filters.userId) where.userId = filters.userId
    if (filters.organizationId) where.organizationId = filters.organizationId

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags }
    }

    if (filters.minViews) {
      where.views = { gte: filters.minViews }
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom
      if (filters.dateTo) where.createdAt.lte = filters.dateTo
    }

    // Visibilidade
    if (!filters.shared) {
      where.OR = [
        { visibility: 'public' },
        { userId: userId },
        {
          shares: {
            some: { userId: userId }
          }
        }
      ]
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: perPage,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        },
        orderBy: [
          { lastEditedAt: 'desc' }
        ]
      }),
      prisma.project.count({ where })
    ])

    return {
      projects,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage)
    }
  }

  /**
   * Duplica um projeto
   */
  async duplicateProject(id: string, userId: string, name?: string) {
    const original = await this.getProject(id, userId)

    const duplicate = await this.createProject({
      name: name || `${original.name} (Cópia)`,
      description: original.description,
      type: original.type as ProjectType,
      status: 'draft' as ProjectStatus,
      visibility: 'private' as ProjectVisibility,
      thumbnail: original.thumbnail,
      duration: original.duration,
      config: original.config as ProjectConfig,
      tags: original.tags,
      organizationId: original.organizationId
    }, userId)

    return duplicate
  }

  /**
   * Compartilha projeto com usuário
   */
  async shareProject(
    projectId: string,
    targetUserId: string,
    permission: SharePermission,
    ownerId: string,
    expiresAt?: Date
  ) {
    // Verificar se é o dono
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project || project.userId !== ownerId) {
      throw new Error('Sem permissão para compartilhar este projeto')
    }

    // Criar compartilhamento
    const share = await prisma.projectShare.create({
      data: {
        projectId,
        userId: targetUserId,
        permission,
        expiresAt
      }
    })

    // Notificar usuário
    await notificationsSystem.send({
      userId: targetUserId,
      type: 'project_shared',
      title: 'Projeto Compartilhado',
      message: `${project.name} foi compartilhado com você com permissão de ${permission}`,
      actionUrl: `/projects/${projectId}`,
      actionLabel: 'Abrir Projeto',
      priority: 'high'
    })

    return share
  }

  /**
   * Remove compartilhamento
   */
  async unshareProject(projectId: string, userId: string, ownerId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project || project.userId !== ownerId) {
      throw new Error('Sem permissão')
    }

    await prisma.projectShare.deleteMany({
      where: {
        projectId,
        userId
      }
    })

    return { success: true }
  }

  /**
   * Cria uma versão do projeto
   */
  async createVersion(
    projectId: string,
    data: Omit<ProjectVersion, 'id' | 'projectId' | 'createdAt'>
  ) {
    const version = await prisma.projectVersion.create({
      data: {
        projectId,
        ...data,
        config: data.config as any
      }
    })

    return version
  }

  /**
   * Restaura uma versão do projeto
   */
  async restoreVersion(projectId: string, versionId: string, userId: string) {
    // Verificar permissão
    const hasPermission = await this.checkUserPermission(projectId, userId, 'edit')
    if (!hasPermission) {
      throw new Error('Sem permissão para editar este projeto')
    }

    const version = await prisma.projectVersion.findUnique({
      where: { id: versionId }
    })

    if (!version || version.projectId !== projectId) {
      throw new Error('Versão não encontrada')
    }

    // Atualizar projeto com config da versão
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        config: version.config,
        lastEditedAt: new Date()
      }
    })

    // Criar nova versão (restore)
    await this.createVersion(projectId, {
      version: version.version + 1,
      name: `Restaurado da v${version.version}`,
      description: version.description,
      config: version.config as ProjectConfig,
      createdBy: userId
    })

    return project
  }

  /**
   * Exporta projeto
   */
  async exportProject(
    projectId: string,
    options: ExportOptions,
    userId: string
  ): Promise<string> {
    const project = await this.getProject(projectId, userId)

    switch (options.format) {
      case 'json':
        return this.exportAsJSON(project, options)
      case 'pdf':
        return this.exportAsPDF(project, options)
      case 'zip':
        return this.exportAsZIP(project, options)
      case 'html':
        return this.exportAsHTML(project, options)
      default:
        throw new Error('Formato de exportação não suportado')
    }
  }

  /**
   * Exporta como JSON
   */
  private async exportAsJSON(project: any, options: ExportOptions): Promise<string> {
    const data: any = {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        type: project.type,
        config: project.config
      }
    }

    if (options.includeVersions) {
      data.versions = project.versions
    }

    const json = JSON.stringify(data, null, 2)
    const fileName = `${project.id}_${Date.now()}.json`
    const filePath = path.join(process.cwd(), 'public', 'exports', fileName)

    await require('fs/promises').writeFile(filePath, json)

    return `/exports/${fileName}`
  }

  /**
   * Exporta como PDF (placeholder)
   */
  private async exportAsPDF(project: any, options: ExportOptions): Promise<string> {
    // TODO: Implementar geração de PDF com puppeteer ou similar
    throw new Error('Exportação PDF em desenvolvimento')
  }

  /**
   * Exporta como ZIP
   */
  private async exportAsZIP(project: any, options: ExportOptions): Promise<string> {
    const fileName = `${project.id}_${Date.now()}.zip`
    const outputPath = path.join(process.cwd(), 'public', 'exports', fileName)
    
    const output = createWriteStream(outputPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    archive.pipe(output)

    // Adicionar JSON do projeto
    archive.append(JSON.stringify(project, null, 2), { name: 'project.json' })

    // Adicionar assets se solicitado
    if (options.includeAssets) {
      // TODO: Baixar e incluir assets
    }

    await archive.finalize()

    return `/exports/${fileName}`
  }

  /**
   * Exporta como HTML (placeholder)
   */
  private async exportAsHTML(project: any, options: ExportOptions): Promise<string> {
    // TODO: Implementar geração de HTML interativo
    throw new Error('Exportação HTML em desenvolvimento')
  }

  /**
   * Verifica se usuário tem acesso ao projeto
   */
  private async checkUserAccess(projectId: string, userId: string): Promise<boolean> {
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) return false
    if (project.userId === userId) return true
    if (project.visibility === 'public') return true

    const share = await prisma.projectShare.findFirst({
      where: {
        projectId,
        userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    })

    return !!share
  }

  /**
   * Verifica permissão específica
   */
  private async checkUserPermission(
    projectId: string,
    userId: string,
    requiredPermission: SharePermission
  ): Promise<boolean> {
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) return false
    if (project.userId === userId) return true

    const share = await prisma.projectShare.findFirst({
      where: {
        projectId,
        userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    })

    if (!share) return false

    // Hierarquia de permissões
    const permissionLevel = {
      'view': 0,
      'comment': 1,
      'edit': 2,
      'admin': 3
    }

    return permissionLevel[share.permission] >= permissionLevel[requiredPermission]
  }

  /**
   * Obtém estatísticas do projeto
   */
  async getProjectStats(projectId: string) {
    const [project, comments, versions, renders] = await Promise.all([
      prisma.project.findUnique({ where: { id: projectId } }),
      prisma.projectComment.count({ where: { projectId } }),
      prisma.projectVersion.count({ where: { projectId } }),
      prisma.renderJob.count({ where: { projectId } })
    ])

    return {
      views: project?.views || 0,
      downloads: project?.downloads || 0,
      comments,
      versions,
      renders,
      lastEdited: project?.lastEditedAt,
      created: project?.createdAt
    }
  }
}

// Instância singleton
export const projectsSystem = new ProjectsSystemReal()

export default ProjectsSystemReal
