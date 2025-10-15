/**
 * 🎯 UNIFIED PROJECT STORE - Zustand
 * Estado global unificado para gerenciar projetos e workflows
 * Implementação baseada no PRD e Arquitetura Técnica
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// Types baseados na documentação
export interface ProjectSlide {
  id: string
  slideNumber: number
  title: string
  content: string
  duration: number
  thumbnailUrl?: string
  notes?: string
  animations?: any[]
  transitions?: any
}

export interface Avatar3DConfig {
  id: string
  name: string
  model: string
  gender: 'male' | 'female' | 'unisex'
  ethnicity: string
  age: string
  quality: 'standard' | 'premium' | 'cinematic' | 'hyperreal'
  customization?: {
    pose_style?: 'dinamico' | 'estatico' | 'interativo'
    expression_intensity?: 'suave' | 'moderado' | 'intenso'
    gesture_frequency?: 'baixa' | 'media' | 'alta'
    eye_contact_level?: 'direto' | 'natural' | 'ocasional'
  }
}

export interface TTSConfig {
  voice: string
  language: string
  speed: number
  pitch: number
  volume: number
  provider: 'elevenlabs' | 'azure' | 'openai'
  model?: string
  settings?: any
}

export interface RenderConfig {
  resolution: { width: number; height: number }
  fps: number
  quality: 'low' | 'medium' | 'high' | 'ultra'
  format: 'mp4' | 'webm' | 'avi'
  codec: 'h264' | 'h265' | 'vp9'
  bitrate?: number
  includeSubtitles: boolean
  watermark?: boolean
}

export interface ProcessingStatus {
  step: 'import' | 'edit' | 'avatar' | 'tts' | 'render' | 'export' | 'complete'
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  message?: string
  error?: string
  startTime?: Date
  endTime?: Date
  estimatedCompletion?: Date
}

export interface UnifiedProject {
  // Basic project info
  id: string
  name: string
  description?: string
  type: 'pptx' | 'template-nr' | 'talking-photo' | 'custom'
  status: 'draft' | 'processing' | 'completed' | 'error'
  
  // Content
  slides: ProjectSlide[]
  totalSlides: number
  duration: number
  
  // Configuration
  avatar: Avatar3DConfig | null
  tts: TTSConfig | null
  render: RenderConfig
  
  // Processing
  workflow: {
    currentStep: ProcessingStatus['step']
    steps: Record<ProcessingStatus['step'], ProcessingStatus>
  }
  
  // Assets
  assets: {
    originalFile?: string
    thumbnailUrl?: string
    audioFiles: string[]
    videoFiles: string[]
    finalVideo?: string
  }
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  userId: string
  version: string
  tags: string[]
  isPublic: boolean
}

export interface UnifiedProjectState {
  // Current project
  currentProject: UnifiedProject | null
  
  // Projects list
  projects: UnifiedProject[]
  
  // UI State
  isLoading: boolean
  error: string | null
  
  // Processing state
  isProcessing: boolean
  processingStep: ProcessingStatus['step'] | null
  
  // Actions
  setCurrentProject: (project: UnifiedProject | null) => void
  updateProject: (projectId: string, updates: Partial<UnifiedProject>) => void
  updateProjectSlides: (projectId: string, slides: ProjectSlide[]) => void
  updateAvatarConfig: (projectId: string, avatar: Avatar3DConfig) => void
  updateTTSConfig: (projectId: string, tts: TTSConfig) => void
  updateRenderConfig: (projectId: string, render: RenderConfig) => void
  updateProcessingStatus: (projectId: string, step: ProcessingStatus['step'], status: Partial<ProcessingStatus>) => void
  
  // API Actions
  createProject: (data: { name: string; type: UnifiedProject['type']; source?: any }) => Promise<UnifiedProject>
  loadProject: (projectId: string) => Promise<UnifiedProject>
  saveProject: (projectId: string) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  
  // Workflow Actions
  startWorkflow: (projectId: string, step: ProcessingStatus['step'], data?: any) => Promise<void>
  executeStep: (projectId: string, step: ProcessingStatus['step'], data?: any) => Promise<any>
  
  // Utility Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  reset: () => void
}

// Default configurations
const defaultRenderConfig: RenderConfig = {
  resolution: { width: 1920, height: 1080 },
  fps: 30,
  quality: 'high',
  format: 'mp4',
  codec: 'h264',
  includeSubtitles: false,
  watermark: false
}

const defaultTTSConfig: TTSConfig = {
  voice: 'pt-BR-female-1',
  language: 'pt-BR',
  speed: 1.0,
  pitch: 1.0,
  volume: 1.0,
  provider: 'elevenlabs'
}

// Zustand Store
export const useUnifiedProjectStore = create<UnifiedProjectState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        currentProject: null,
        projects: [],
        isLoading: false,
        error: null,
        isProcessing: false,
        processingStep: null,

        // Basic actions
        setCurrentProject: (project) => set((state) => {
          state.currentProject = project
        }),

        updateProject: (projectId, updates) => set((state) => {
          if (state.currentProject?.id === projectId) {
            Object.assign(state.currentProject, updates)
            state.currentProject.updatedAt = new Date()
          }
          
          const projectIndex = state.projects.findIndex(p => p.id === projectId)
          if (projectIndex !== -1) {
            Object.assign(state.projects[projectIndex], updates)
            state.projects[projectIndex].updatedAt = new Date()
          }
        }),

        updateProjectSlides: (projectId, slides) => set((state) => {
          const updates = {
            slides,
            totalSlides: slides.length,
            duration: slides.reduce((total, slide) => total + slide.duration, 0),
            updatedAt: new Date()
          }
          
          if (state.currentProject?.id === projectId) {
            Object.assign(state.currentProject, updates)
          }
          
          const projectIndex = state.projects.findIndex(p => p.id === projectId)
          if (projectIndex !== -1) {
            Object.assign(state.projects[projectIndex], updates)
          }
        }),

        updateAvatarConfig: (projectId, avatar) => set((state) => {
          if (state.currentProject?.id === projectId) {
            state.currentProject.avatar = avatar
            state.currentProject.updatedAt = new Date()
          }
          
          const projectIndex = state.projects.findIndex(p => p.id === projectId)
          if (projectIndex !== -1) {
            state.projects[projectIndex].avatar = avatar
            state.projects[projectIndex].updatedAt = new Date()
          }
        }),

        updateTTSConfig: (projectId, tts) => set((state) => {
          if (state.currentProject?.id === projectId) {
            state.currentProject.tts = tts
            state.currentProject.updatedAt = new Date()
          }
          
          const projectIndex = state.projects.findIndex(p => p.id === projectId)
          if (projectIndex !== -1) {
            state.projects[projectIndex].tts = tts
            state.projects[projectIndex].updatedAt = new Date()
          }
        }),

        updateRenderConfig: (projectId, render) => set((state) => {
          if (state.currentProject?.id === projectId) {
            state.currentProject.render = render
            state.currentProject.updatedAt = new Date()
          }
          
          const projectIndex = state.projects.findIndex(p => p.id === projectId)
          if (projectIndex !== -1) {
            state.projects[projectIndex].render = render
            state.projects[projectIndex].updatedAt = new Date()
          }
        }),

        updateProcessingStatus: (projectId, step, status) => set((state) => {
          const updateWorkflow = (project: UnifiedProject) => {
            if (!project.workflow.steps[step]) {
              project.workflow.steps[step] = {
                step,
                status: 'pending',
                progress: 0
              }
            }
            
            Object.assign(project.workflow.steps[step], status)
            
            if (status.status === 'processing') {
              project.workflow.currentStep = step
              state.isProcessing = true
              state.processingStep = step
            } else if (status.status === 'completed') {
              // Auto-advance to next step
              const stepOrder: ProcessingStatus['step'][] = ['import', 'edit', 'avatar', 'tts', 'render', 'export']
              const currentIndex = stepOrder.indexOf(step)
              if (currentIndex < stepOrder.length - 1) {
                project.workflow.currentStep = stepOrder[currentIndex + 1]
              } else {
                project.workflow.currentStep = 'complete'
                state.isProcessing = false
                state.processingStep = null
              }
            } else if (status.status === 'error') {
              state.isProcessing = false
              state.processingStep = null
              state.error = status.error || 'Processing error occurred'
            }
            
            project.updatedAt = new Date()
          }
          
          if (state.currentProject?.id === projectId) {
            updateWorkflow(state.currentProject)
          }
          
          const projectIndex = state.projects.findIndex(p => p.id === projectId)
          if (projectIndex !== -1) {
            updateWorkflow(state.projects[projectIndex])
          }
        }),

        // API Actions
        createProject: async (data) => {
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          try {
            const response = await fetch('/api/unified', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: data.name,
                type: data.type,
                source: data.source || { type: 'blank' }
              })
            })

            if (!response.ok) {
              throw new Error('Failed to create project')
            }

            const { project, workflow } = await response.json()

            const unifiedProject: UnifiedProject = {
              id: project.id,
              name: project.name,
              description: project.description,
              type: project.type,
              status: 'draft',
              slides: [],
              totalSlides: 0,
              duration: 0,
              avatar: null,
              tts: defaultTTSConfig,
              render: defaultRenderConfig,
              workflow: {
                currentStep: workflow.currentStep,
                steps: workflow.steps
              },
              assets: {
                audioFiles: [],
                videoFiles: []
              },
              createdAt: new Date(project.createdAt),
              updatedAt: new Date(project.updatedAt),
              userId: project.userId,
              version: project.version,
              tags: project.tags || [],
              isPublic: project.isPublic || false
            }

            set((state) => {
              state.projects.push(unifiedProject)
              state.currentProject = unifiedProject
              state.isLoading = false
            })

            return unifiedProject

          } catch (error: any) {
            set((state) => {
              state.error = error.message
              state.isLoading = false
            })
            throw error
          }
        },

        loadProject: async (projectId) => {
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          try {
            const response = await fetch(`/api/unified?projectId=${projectId}`)
            
            if (!response.ok) {
              throw new Error('Failed to load project')
            }

            const { workflow } = await response.json()
            
            // Convert to unified project format
            const unifiedProject: UnifiedProject = {
              id: projectId,
              name: 'Loaded Project', // This would come from the actual project data
              type: 'pptx',
              status: 'draft',
              slides: [],
              totalSlides: 0,
              duration: 0,
              avatar: null,
              tts: defaultTTSConfig,
              render: defaultRenderConfig,
              workflow: {
                currentStep: workflow.currentStep,
                steps: workflow.steps
              },
              assets: {
                audioFiles: [],
                videoFiles: []
              },
              createdAt: new Date(),
              updatedAt: new Date(),
              userId: workflow.metadata.userId,
              version: '1.0',
              tags: [],
              isPublic: false
            }

            set((state) => {
              state.currentProject = unifiedProject
              state.isLoading = false
            })

            return unifiedProject

          } catch (error: any) {
            set((state) => {
              state.error = error.message
              state.isLoading = false
            })
            throw error
          }
        },

        saveProject: async (projectId) => {
          const project = get().currentProject
          if (!project || project.id !== projectId) {
            throw new Error('Project not found')
          }

          set((state) => {
            state.isLoading = true
            state.error = null
          })

          try {
            const response = await fetch('/api/unified', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: projectId,
                action: 'edit',
                data: {
                  slides: project.slides,
                  avatar: project.avatar,
                  tts: project.tts,
                  render: project.render
                }
              })
            })

            if (!response.ok) {
              throw new Error('Failed to save project')
            }

            set((state) => {
              state.isLoading = false
            })

          } catch (error: any) {
            set((state) => {
              state.error = error.message
              state.isLoading = false
            })
            throw error
          }
        },

        deleteProject: async (projectId) => {
          set((state) => {
            state.isLoading = true
            state.error = null
          })

          try {
            const response = await fetch(`/api/unified?projectId=${projectId}`, {
              method: 'DELETE'
            })

            if (!response.ok) {
              throw new Error('Failed to delete project')
            }

            set((state) => {
              state.projects = state.projects.filter(p => p.id !== projectId)
              if (state.currentProject?.id === projectId) {
                state.currentProject = null
              }
              state.isLoading = false
            })

          } catch (error: any) {
            set((state) => {
              state.error = error.message
              state.isLoading = false
            })
            throw error
          }
        },

        // Workflow Actions
        startWorkflow: async (projectId, step, data) => {
          set((state) => {
            state.isProcessing = true
            state.processingStep = step
            state.error = null
          })

          get().updateProcessingStatus(projectId, step, {
            status: 'processing',
            progress: 0,
            startTime: new Date()
          })
        },

        executeStep: async (projectId, step, data) => {
          try {
            get().updateProcessingStatus(projectId, step, {
              status: 'processing',
              progress: 0,
              startTime: new Date()
            })

            const response = await fetch('/api/unified', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: projectId,
                action: step === 'render' ? 'render' : 'edit',
                data
              })
            })

            if (!response.ok) {
              throw new Error(`Failed to execute ${step}`)
            }

            const result = await response.json()

            get().updateProcessingStatus(projectId, step, {
              status: 'completed',
              progress: 100,
              endTime: new Date()
            })

            return result

          } catch (error: any) {
            get().updateProcessingStatus(projectId, step, {
              status: 'error',
              progress: 0,
              error: error.message,
              endTime: new Date()
            })
            throw error
          }
        },

        // Utility Actions
        setLoading: (loading) => set((state) => {
          state.isLoading = loading
        }),

        setError: (error) => set((state) => {
          state.error = error
        }),

        clearError: () => set((state) => {
          state.error = null
        }),

        reset: () => set((state) => {
          state.currentProject = null
          state.projects = []
          state.isLoading = false
          state.error = null
          state.isProcessing = false
          state.processingStep = null
        })
      })),
      {
        name: 'unified-project-store',
        partialize: (state) => ({
          projects: state.projects,
          currentProject: state.currentProject
        })
      }
    ),
    {
      name: 'unified-project-store'
    }
  )
)

// Selectors for better performance
export const useCurrentProject = () => useUnifiedProjectStore(state => state.currentProject)
export const useProjects = () => useUnifiedProjectStore(state => state.projects)
export const useProcessingState = () => useUnifiedProjectStore(state => ({
  isProcessing: state.isProcessing,
  processingStep: state.processingStep,
  currentStep: state.currentProject?.workflow.currentStep
}))
export const useProjectActions = () => useUnifiedProjectStore(state => ({
  createProject: state.createProject,
  loadProject: state.loadProject,
  saveProject: state.saveProject,
  deleteProject: state.deleteProject,
  executeStep: state.executeStep,
  updateProject: state.updateProject,
  updateProjectSlides: state.updateProjectSlides,
  updateAvatarConfig: state.updateAvatarConfig,
  updateTTSConfig: state.updateTTSConfig,
  updateRenderConfig: state.updateRenderConfig
}))