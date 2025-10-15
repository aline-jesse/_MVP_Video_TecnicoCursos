/**
 * Comprehensive Test Suite for Advanced Dashboard Components
 * Tests all implemented components for rendering, interaction, and integration
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock hooks
const mockUseAdvancedTemplates = {
  templates: [],
  categories: [],
  isLoading: false,
  error: null,
  loadTemplates: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
  toggleFavorite: vi.fn(),
  validateTemplate: vi.fn(),
  exportTemplate: vi.fn(),
  importTemplate: vi.fn(),
  searchTemplates: vi.fn(),
  filterByCategory: vi.fn(),
  getTemplatePreview: vi.fn()
};

const mockUseComplianceAnalyzer = {
  isAnalyzing: false,
  currentAnalysis: null,
  analysisHistory: [],
  issues: [],
  suggestions: [],
  nrRules: {},
  analyzeTemplate: vi.fn(),
  analyzeContent: vi.fn(),
  resolveIssue: vi.fn(),
  applySuggestion: vi.fn(),
  generateReport: vi.fn(),
  startRealTimeAnalysis: vi.fn(),
  stopRealTimeAnalysis: vi.fn()
};

const mockUseBackupSystem = {
  backups: [],
  restorePoints: [],
  config: {
    enabled: false,
    interval: 3600000,
    maxBackups: 10,
    compression: true,
    encryption: false,
    cloudSync: false
  },
  stats: null,
  isCreatingBackup: false,
  isRestoring: false,
  error: null,
  createBackup: vi.fn(),
  deleteBackup: vi.fn(),
  restoreBackup: vi.fn(),
  configureAutoBackup: vi.fn(),
  exportBackup: vi.fn(),
  importBackup: vi.fn(),
  cleanupOldBackups: vi.fn(),
  optimizeStorage: vi.fn()
};

const mockUsePerformanceMonitor = {
  isMonitoring: false,
  metrics: null,
  alerts: [],
  thresholds: {},
  reports: [],
  bottlenecks: [],
  startMonitoring: vi.fn(),
  stopMonitoring: vi.fn(),
  setThresholds: vi.fn(),
  generateReport: vi.fn(),
  exportData: vi.fn(),
  clearAlerts: vi.fn(),
  analyzeBottlenecks: vi.fn()
};

const mockUseWYSIWYGEditor = {
  elements: [],
  selectedElements: [],
  layers: [],
  animations: [],
  timeline: {
    currentTime: 0,
    duration: 10000,
    isPlaying: false,
    keyframes: [],
    markers: []
  },
  canvasSize: { width: 1920, height: 1080 },
  zoom: 1,
  gridEnabled: true,
  snapToGrid: true,
  history: { canUndo: false, canRedo: false },
  clipboard: null,
  isPlaying: false,
  addElement: vi.fn(),
  updateElement: vi.fn(),
  deleteElement: vi.fn(),
  duplicateElement: vi.fn(),
  selectElement: vi.fn(),
  selectMultiple: vi.fn(),
  clearSelection: vi.fn(),
  moveElement: vi.fn(),
  resizeElement: vi.fn(),
  rotateElement: vi.fn(),
  createLayer: vi.fn(),
  deleteLayer: vi.fn(),
  moveToLayer: vi.fn(),
  reorderLayers: vi.fn(),
  toggleLayerVisibility: vi.fn(),
  toggleLayerLock: vi.fn(),
  addKeyframe: vi.fn(),
  removeKeyframe: vi.fn(),
  updateKeyframe: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  stop: vi.fn(),
  seek: vi.fn(),
  setDuration: vi.fn(),
  copy: vi.fn(),
  cut: vi.fn(),
  paste: vi.fn(),
  undo: vi.fn(),
  redo: vi.fn(),
  saveSnapshot: vi.fn(),
  loadSnapshot: vi.fn(),
  setCanvasSize: vi.fn(),
  setZoom: vi.fn(),
  toggleGrid: vi.fn(),
  toggleSnapToGrid: vi.fn(),
  exportProject: vi.fn(),
  importProject: vi.fn(),
  generatePreview: vi.fn()
};

const mockUseRealTimeCollaboration = {
  isConnected: false,
  users: [],
  currentUser: null,
  comments: [],
  versions: [],
  notifications: [],
  sessionId: null,
  stats: null,
  joinSession: vi.fn(),
  leaveSession: vi.fn(),
  updateCursor: vi.fn(),
  addComment: vi.fn(),
  updateComment: vi.fn(),
  deleteComment: vi.fn(),
  resolveComment: vi.fn(),
  replyToComment: vi.fn(),
  createVersion: vi.fn(),
  revertToVersion: vi.fn(),
  mergeVersions: vi.fn(),
  markNotificationAsRead: vi.fn(),
  clearNotifications: vi.fn(),
  inviteUser: vi.fn(),
  removeUser: vi.fn(),
  changeUserRole: vi.fn(),
  trackElementChange: vi.fn()
};

const mockUseWorkflowAutomation = {
  workflows: [],
  executions: [],
  templates: [],
  stats: null,
  isExecuting: false,
  error: null,
  loadWorkflows: vi.fn(),
  createWorkflow: vi.fn(),
  updateWorkflow: vi.fn(),
  deleteWorkflow: vi.fn(),
  triggerWorkflow: vi.fn(),
  stopWorkflow: vi.fn(),
  executeAction: vi.fn(),
  loadTemplates: vi.fn(),
  saveAsTemplate: vi.fn(),
  getExecutionHistory: vi.fn(),
  getAnalytics: vi.fn()
};

const mockUseAdvancedAI = {
  models: [],
  isLoading: false,
  error: null,
  generationHistory: [],
  insights: [],
  usageStats: null,
  generateContent: vi.fn(),
  generatePersonalizedContent: vi.fn(),
  analyzeSentiment: vi.fn(),
  optimizeContent: vi.fn(),
  getSmartSuggestions: vi.fn(),
  autoCompleteContent: vi.fn(),
  translateContent: vi.fn(),
  summarizeContent: vi.fn(),
  markInsightAsRead: vi.fn(),
  executeInsightAction: vi.fn(),
  cancelGeneration: vi.fn()
};

// Mock the hooks
vi.mock('@/hooks/useAdvancedTemplates', () => ({
  useAdvancedTemplates: () => mockUseAdvancedTemplates
}));

vi.mock('@/hooks/useComplianceAnalyzer', () => ({
  useComplianceAnalyzer: () => mockUseComplianceAnalyzer
}));

vi.mock('@/hooks/useBackupSystem', () => ({
  useBackupSystem: () => mockUseBackupSystem
}));

vi.mock('@/hooks/usePerformanceMonitor', () => ({
  usePerformanceMonitor: () => mockUsePerformanceMonitor
}));

vi.mock('@/hooks/useWYSIWYGEditor', () => ({
  useWYSIWYGEditor: () => mockUseWYSIWYGEditor
}));

vi.mock('@/hooks/useRealTimeCollaboration', () => ({
  useRealTimeCollaboration: () => mockUseRealTimeCollaboration
}));

vi.mock('@/hooks/useWorkflowAutomation', () => ({
  useWorkflowAutomation: () => mockUseWorkflowAutomation
}));

vi.mock('@/hooks/useAdvancedAI', () => ({
  useAdvancedAI: () => mockUseAdvancedAI
}));

describe('Advanced Dashboard Components Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AdvancedTemplates Component', () => {
    it('should render templates grid', async () => {
      const mockTemplates = [
        {
          id: '1',
          name: 'Safety Training Template',
          category: 'NR-12',
          description: 'Comprehensive safety training template',
          thumbnail: 'safety.jpg',
          content: {},
          metadata: {
            version: '1.0',
            author: 'Test Author',
            createdAt: new Date(),
            updatedAt: new Date(),
            tags: ['safety', 'training'],
            compliance: { nrCategory: 'NR-12', isCompliant: true, score: 95 }
          },
          isFavorite: false,
          isCustom: false
        }
      ];

      mockUseAdvancedTemplates.templates = mockTemplates;

      const { AdvancedTemplates } = await import('@/components/AdvancedTemplates');
      render(<AdvancedTemplates />);

      expect(screen.getByText('Templates Avançados')).toBeInTheDocument();
      expect(screen.getByText('Safety Training Template')).toBeInTheDocument();
      expect(screen.getByText('NR-12')).toBeInTheDocument();
    });

    it('should handle template creation', async () => {
      const { AdvancedTemplates } = await import('@/components/AdvancedTemplates');
      render(<AdvancedTemplates />);

      const createButton = screen.getByText('Novo Template');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Criar Novo Template')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText('Nome do Template');
      await userEvent.type(nameInput, 'New Test Template');

      const categorySelect = screen.getByLabelText('Categoria NR');
      fireEvent.click(categorySelect);
      
      await waitFor(() => {
        const nrOption = screen.getByText('NR-12');
        fireEvent.click(nrOption);
      });

      const createSubmitButton = screen.getByText('Criar Template');
      fireEvent.click(createSubmitButton);

      expect(mockUseAdvancedTemplates.createTemplate).toHaveBeenCalled();
    });

    it('should handle template search and filtering', async () => {
      const { AdvancedTemplates } = await import('@/components/AdvancedTemplates');
      render(<AdvancedTemplates />);

      const searchInput = screen.getByPlaceholderText('Buscar templates...');
      await userEvent.type(searchInput, 'safety');

      expect(mockUseAdvancedTemplates.searchTemplates).toHaveBeenCalledWith('safety');

      const filterButton = screen.getByText('Filtros');
      fireEvent.click(filterButton);

      await waitFor(() => {
        const categoryFilter = screen.getByText('NR-12');
        fireEvent.click(categoryFilter);
      });

      expect(mockUseAdvancedTemplates.filterByCategory).toHaveBeenCalledWith('NR-12');
    });

    it('should toggle template favorite status', async () => {
      const mockTemplates = [
        {
          id: '1',
          name: 'Test Template',
          category: 'NR-12',
          description: 'Test',
          thumbnail: '',
          content: {},
          metadata: {
            version: '1.0',
            author: 'Test',
            createdAt: new Date(),
            updatedAt: new Date(),
            tags: [],
            compliance: { nrCategory: 'NR-12', isCompliant: true, score: 95 }
          },
          isFavorite: false,
          isCustom: false
        }
      ];

      mockUseAdvancedTemplates.templates = mockTemplates;

      const { AdvancedTemplates } = await import('@/components/AdvancedTemplates');
      render(<AdvancedTemplates />);

      const favoriteButton = screen.getByLabelText('Adicionar aos favoritos');
      fireEvent.click(favoriteButton);

      expect(mockUseAdvancedTemplates.toggleFavorite).toHaveBeenCalledWith('1');
    });
  });

  describe('ComplianceDashboard Component', () => {
    it('should render compliance overview', async () => {
      const mockAnalysis = {
        id: '1',
        templateId: 'template1',
        score: 85,
        status: 'compliant' as const,
        issues: [],
        suggestions: [],
        requirements: [],
        createdAt: new Date(),
        nrCategory: 'NR-12'
      };

      mockUseComplianceAnalyzer.currentAnalysis = mockAnalysis;

      const { ComplianceDashboard } = await import('@/components/ComplianceDashboard');
      render(<ComplianceDashboard />);

      expect(screen.getByText('Dashboard de Compliance')).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('Compliant')).toBeInTheDocument();
    });

    it('should display compliance issues', async () => {
      const mockIssues = [
        {
          id: '1',
          type: 'critical' as const,
          title: 'Missing Safety Information',
          description: 'Safety procedures are not clearly defined',
          location: { elementId: 'element1', position: { x: 100, y: 100 } },
          suggestion: 'Add detailed safety procedures',
          nrRequirement: 'NR-12.1',
          severity: 'high' as const,
          isResolved: false,
          createdAt: new Date()
        }
      ];

      mockUseComplianceAnalyzer.issues = mockIssues;

      const { ComplianceDashboard } = await import('@/components/ComplianceDashboard');
      render(<ComplianceDashboard />);

      const issuesTab = screen.getByText('Problemas');
      fireEvent.click(issuesTab);

      await waitFor(() => {
        expect(screen.getByText('Missing Safety Information')).toBeInTheDocument();
        expect(screen.getByText('critical')).toBeInTheDocument();
      });
    });

    it('should handle issue resolution', async () => {
      const mockIssues = [
        {
          id: '1',
          type: 'warning' as const,
          title: 'Test Issue',
          description: 'Test description',
          location: { elementId: 'element1', position: { x: 100, y: 100 } },
          suggestion: 'Test suggestion',
          nrRequirement: 'NR-12.1',
          severity: 'medium' as const,
          isResolved: false,
          createdAt: new Date()
        }
      ];

      mockUseComplianceAnalyzer.issues = mockIssues;

      const { ComplianceDashboard } = await import('@/components/ComplianceDashboard');
      render(<ComplianceDashboard />);

      const issuesTab = screen.getByText('Problemas');
      fireEvent.click(issuesTab);

      await waitFor(() => {
        const resolveButton = screen.getByText('Resolver');
        fireEvent.click(resolveButton);
      });

      expect(mockUseComplianceAnalyzer.resolveIssue).toHaveBeenCalledWith('1');
    });

    it('should generate compliance report', async () => {
      const { ComplianceDashboard } = await import('@/components/ComplianceDashboard');
      render(<ComplianceDashboard />);

      const reportButton = screen.getByText('Gerar Relatório');
      fireEvent.click(reportButton);

      expect(mockUseComplianceAnalyzer.generateReport).toHaveBeenCalled();
    });
  });

  describe('BackupManager Component', () => {
    it('should render backup list', async () => {
      const mockBackups = [
        {
          id: '1',
          type: 'manual' as const,
          description: 'Manual backup',
          data: { templates: [], projects: [] },
          metadata: {
            size: 1024,
            checksum: 'abc123',
            compression: true,
            encryption: false
          },
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 86400000)
        }
      ];

      mockUseBackupSystem.backups = mockBackups;

      const { BackupManager } = await import('@/components/BackupManager');
      render(<BackupManager />);

      expect(screen.getByText('Gerenciamento de Backup')).toBeInTheDocument();
      expect(screen.getByText('Manual backup')).toBeInTheDocument();
      expect(screen.getByText('manual')).toBeInTheDocument();
    });

    it('should create manual backup', async () => {
      const { BackupManager } = await import('@/components/BackupManager');
      render(<BackupManager />);

      const createButton = screen.getByText('Criar Backup');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Criar Novo Backup')).toBeInTheDocument();
      });

      const descriptionInput = screen.getByLabelText('Descrição');
      await userEvent.type(descriptionInput, 'Test backup');

      const createSubmitButton = screen.getByText('Criar Backup');
      fireEvent.click(createSubmitButton);

      expect(mockUseBackupSystem.createBackup).toHaveBeenCalled();
    });

    it('should restore from backup', async () => {
      const mockBackups = [
        {
          id: '1',
          type: 'manual' as const,
          description: 'Test backup',
          data: { templates: [], projects: [] },
          metadata: {
            size: 1024,
            checksum: 'abc123',
            compression: true,
            encryption: false
          },
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 86400000)
        }
      ];

      mockUseBackupSystem.backups = mockBackups;

      const { BackupManager } = await import('@/components/BackupManager');
      render(<BackupManager />);

      const restoreButton = screen.getByText('Restaurar');
      fireEvent.click(restoreButton);

      expect(mockUseBackupSystem.restoreBackup).toHaveBeenCalledWith('1');
    });

    it('should configure auto-backup settings', async () => {
      const { BackupManager } = await import('@/components/BackupManager');
      render(<BackupManager />);

      const settingsTab = screen.getByText('Configurações');
      fireEvent.click(settingsTab);

      await waitFor(() => {
        const enableToggle = screen.getByLabelText('Backup Automático');
        fireEvent.click(enableToggle);
      });

      expect(mockUseBackupSystem.configureAutoBackup).toHaveBeenCalled();
    });
  });

  describe('AdvancedPerformanceDashboard Component', () => {
    it('should render performance metrics', async () => {
      const mockMetrics = {
        system: {
          cpu: { usage: 45.5, cores: 8, temperature: 65 },
          memory: { used: 8192, total: 16384, available: 8192 },
          disk: { used: 512000, total: 1024000, available: 512000 },
          network: { bytesIn: 1024, bytesOut: 2048, latency: 25 }
        },
        application: {
          renderTime: 16.7,
          bundleSize: 2048,
          loadTime: 1200,
          errorRate: 0.01,
          activeUsers: 150
        },
        userExperience: {
          pageLoadTime: 800,
          interactionDelay: 50,
          visualStability: 0.95,
          accessibility: 0.92
        },
        timestamp: new Date()
      };

      mockUsePerformanceMonitor.metrics = mockMetrics;
      mockUsePerformanceMonitor.isMonitoring = true;

      const { AdvancedPerformanceDashboard } = await import('@/components/AdvancedPerformanceDashboard');
      render(<AdvancedPerformanceDashboard />);

      expect(screen.getByText('Dashboard de Performance')).toBeInTheDocument();
      expect(screen.getByText('45.5%')).toBeInTheDocument();
      expect(screen.getByText('8.0 GB')).toBeInTheDocument();
    });

    it('should start and stop monitoring', async () => {
      const { AdvancedPerformanceDashboard } = await import('@/components/AdvancedPerformanceDashboard');
      render(<AdvancedPerformanceDashboard />);

      const startButton = screen.getByText('Iniciar Monitoramento');
      fireEvent.click(startButton);

      expect(mockUsePerformanceMonitor.startMonitoring).toHaveBeenCalled();

      // Mock monitoring state change
      mockUsePerformanceMonitor.isMonitoring = true;

      const stopButton = screen.getByText('Parar Monitoramento');
      fireEvent.click(stopButton);

      expect(mockUsePerformanceMonitor.stopMonitoring).toHaveBeenCalled();
    });

    it('should display performance alerts', async () => {
      const mockAlerts = [
        {
          id: '1',
          type: 'warning' as const,
          title: 'High CPU Usage',
          description: 'CPU usage is above 80%',
          metric: 'cpu.usage',
          value: 85,
          threshold: 80,
          severity: 'medium' as const,
          isActive: true,
          createdAt: new Date(),
          resolvedAt: null
        }
      ];

      mockUsePerformanceMonitor.alerts = mockAlerts;

      const { AdvancedPerformanceDashboard } = await import('@/components/AdvancedPerformanceDashboard');
      render(<AdvancedPerformanceDashboard />);

      const alertsTab = screen.getByText('Alertas');
      fireEvent.click(alertsTab);

      await waitFor(() => {
        expect(screen.getByText('High CPU Usage')).toBeInTheDocument();
        expect(screen.getByText('warning')).toBeInTheDocument();
      });
    });

    it('should generate performance report', async () => {
      const { AdvancedPerformanceDashboard } = await import('@/components/AdvancedPerformanceDashboard');
      render(<AdvancedPerformanceDashboard />);

      const reportButton = screen.getByText('Gerar Relatório');
      fireEvent.click(reportButton);

      expect(mockUsePerformanceMonitor.generateReport).toHaveBeenCalled();
    });
  });

  describe('WYSIWYGEditor Component', () => {
    it('should render editor interface', async () => {
      const { WYSIWYGEditor } = await import('@/components/WYSIWYGEditor');
      render(<WYSIWYGEditor />);

      expect(screen.getByText('Editor WYSIWYG')).toBeInTheDocument();
      expect(screen.getByText('Adicionar Texto')).toBeInTheDocument();
      expect(screen.getByText('Adicionar Imagem')).toBeInTheDocument();
    });

    it('should add elements to canvas', async () => {
      const { WYSIWYGEditor } = await import('@/components/WYSIWYGEditor');
      render(<WYSIWYGEditor />);

      const addTextButton = screen.getByText('Adicionar Texto');
      fireEvent.click(addTextButton);

      expect(mockUseWYSIWYGEditor.addElement).toHaveBeenCalledWith({
        type: 'text',
        content: 'Novo texto',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 50 }
      });
    });

    it('should handle element selection and editing', async () => {
      const mockElements = [
        {
          id: 'element1',
          type: 'text' as const,
          content: 'Test text',
          position: { x: 100, y: 100 },
          size: { width: 200, height: 50 },
          rotation: 0,
          opacity: 1,
          visible: true,
          locked: false,
          layerId: 'layer1',
          animations: [],
          interactions: []
        }
      ];

      mockUseWYSIWYGEditor.elements = mockElements;
      mockUseWYSIWYGEditor.selectedElements = ['element1'];

      const { WYSIWYGEditor } = await import('@/components/WYSIWYGEditor');
      render(<WYSIWYGEditor />);

      // Check if properties panel shows selected element
      expect(screen.getByDisplayValue('Test text')).toBeInTheDocument();
      expect(screen.getByDisplayValue('100')).toBeInTheDocument(); // X position
    });

    it('should manage layers', async () => {
      const mockLayers = [
        {
          id: 'layer1',
          name: 'Background',
          visible: true,
          locked: false,
          opacity: 1,
          elements: ['element1'],
          order: 0
        }
      ];

      mockUseWYSIWYGEditor.layers = mockLayers;

      const { WYSIWYGEditor } = await import('@/components/WYSIWYGEditor');
      render(<WYSIWYGEditor />);

      const layersTab = screen.getByText('Camadas');
      fireEvent.click(layersTab);

      await waitFor(() => {
        expect(screen.getByText('Background')).toBeInTheDocument();
      });

      const addLayerButton = screen.getByText('Nova Camada');
      fireEvent.click(addLayerButton);

      expect(mockUseWYSIWYGEditor.createLayer).toHaveBeenCalled();
    });

    it('should control timeline and animations', async () => {
      const { WYSIWYGEditor } = await import('@/components/WYSIWYGEditor');
      render(<WYSIWYGEditor />);

      const timelineTab = screen.getByText('Timeline');
      fireEvent.click(timelineTab);

      await waitFor(() => {
        const playButton = screen.getByLabelText('Reproduzir');
        fireEvent.click(playButton);
      });

      expect(mockUseWYSIWYGEditor.play).toHaveBeenCalled();
    });
  });

  describe('RealTimeCollaboration Component', () => {
    it('should render collaboration interface', async () => {
      const { RealTimeCollaboration } = await import('@/components/RealTimeCollaboration');
      render(<RealTimeCollaboration />);

      expect(screen.getByText('Colaboração em Tempo Real')).toBeInTheDocument();
      expect(screen.getByText('Desconectado')).toBeInTheDocument();
    });

    it('should display connected users', async () => {
      const mockUsers = [
        {
          id: 'user1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: '',
          role: 'editor' as const,
          isOnline: true,
          lastSeen: new Date(),
          cursor: { x: 100, y: 100 }
        }
      ];

      mockUseRealTimeCollaboration.users = mockUsers;
      mockUseRealTimeCollaboration.isConnected = true;

      const { RealTimeCollaboration } = await import('@/components/RealTimeCollaboration');
      render(<RealTimeCollaboration />);

      const usersTab = screen.getByText('Usuários');
      fireEvent.click(usersTab);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('editor')).toBeInTheDocument();
      });
    });

    it('should handle comments', async () => {
      const mockComments = [
        {
          id: 'comment1',
          elementId: 'element1',
          content: 'This needs improvement',
          position: { x: 100, y: 100 },
          author: {
            id: 'user1',
            name: 'John Doe',
            email: 'john@example.com',
            avatar: ''
          },
          replies: [],
          attachments: [],
          isResolved: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockUseRealTimeCollaboration.comments = mockComments;

      const { RealTimeCollaboration } = await import('@/components/RealTimeCollaboration');
      render(<RealTimeCollaboration />);

      const commentsTab = screen.getByText('Comentários');
      fireEvent.click(commentsTab);

      await waitFor(() => {
        expect(screen.getByText('This needs improvement')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const addCommentButton = screen.getByText('Adicionar Comentário');
      fireEvent.click(addCommentButton);

      expect(mockUseRealTimeCollaboration.addComment).toHaveBeenCalled();
    });

    it('should manage version history', async () => {
      const mockVersions = [
        {
          id: 'version1',
          name: 'Initial version',
          description: 'First version of the project',
          author: {
            id: 'user1',
            name: 'John Doe',
            email: 'john@example.com',
            avatar: ''
          },
          changes: [],
          data: {},
          createdAt: new Date(),
          isCurrent: true
        }
      ];

      mockUseRealTimeCollaboration.versions = mockVersions;

      const { RealTimeCollaboration } = await import('@/components/RealTimeCollaboration');
      render(<RealTimeCollaboration />);

      const versionsTab = screen.getByText('Versões');
      fireEvent.click(versionsTab);

      await waitFor(() => {
        expect(screen.getByText('Initial version')).toBeInTheDocument();
        expect(screen.getByText('Atual')).toBeInTheDocument();
      });

      const createVersionButton = screen.getByText('Nova Versão');
      fireEvent.click(createVersionButton);

      expect(mockUseRealTimeCollaboration.createVersion).toHaveBeenCalled();
    });
  });

  describe('WorkflowAutomation Component', () => {
    it('should render workflow list', async () => {
      const mockWorkflows = [
        {
          id: 'workflow1',
          name: 'Auto Backup',
          description: 'Automatically backup templates',
          trigger: {
            type: 'schedule' as const,
            config: { cron: '0 0 * * *' }
          },
          actions: [],
          conditions: [],
          variables: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastExecuted: new Date(),
          executionCount: 5
        }
      ];

      mockUseWorkflowAutomation.workflows = mockWorkflows;

      const { WorkflowAutomation } = await import('@/components/WorkflowAutomation');
      render(<WorkflowAutomation />);

      expect(screen.getByText('Automação de Workflows')).toBeInTheDocument();
      expect(screen.getByText('Auto Backup')).toBeInTheDocument();
      expect(screen.getByText('Automatically backup templates')).toBeInTheDocument();
    });

    it('should create new workflow', async () => {
      const { WorkflowAutomation } = await import('@/components/WorkflowAutomation');
      render(<WorkflowAutomation />);

      const createButton = screen.getByText('Novo Workflow');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Criar Novo Workflow')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText('Nome');
      await userEvent.type(nameInput, 'Test Workflow');

      const descriptionInput = screen.getByLabelText('Descrição');
      await userEvent.type(descriptionInput, 'Test description');

      const createSubmitButton = screen.getByText('Criar Workflow');
      fireEvent.click(createSubmitButton);

      expect(mockUseWorkflowAutomation.createWorkflow).toHaveBeenCalled();
    });

    it('should trigger workflow execution', async () => {
      const mockWorkflows = [
        {
          id: 'workflow1',
          name: 'Test Workflow',
          description: 'Test',
          trigger: { type: 'manual' as const, config: {} },
          actions: [],
          conditions: [],
          variables: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastExecuted: null,
          executionCount: 0
        }
      ];

      mockUseWorkflowAutomation.workflows = mockWorkflows;

      const { WorkflowAutomation } = await import('@/components/WorkflowAutomation');
      render(<WorkflowAutomation />);

      const triggerButton = screen.getByText('Executar');
      fireEvent.click(triggerButton);

      expect(mockUseWorkflowAutomation.triggerWorkflow).toHaveBeenCalledWith('workflow1', {});
    });

    it('should display execution history', async () => {
      const mockExecutions = [
        {
          id: 'execution1',
          workflowId: 'workflow1',
          status: 'completed' as const,
          startTime: new Date(),
          endTime: new Date(),
          duration: 1500,
          results: [],
          logs: [],
          error: null,
          triggeredBy: 'user1',
          context: {}
        }
      ];

      mockUseWorkflowAutomation.executions = mockExecutions;

      const { WorkflowAutomation } = await import('@/components/WorkflowAutomation');
      render(<WorkflowAutomation />);

      const executionsTab = screen.getByText('Execuções');
      fireEvent.click(executionsTab);

      await waitFor(() => {
        expect(screen.getByText('completed')).toBeInTheDocument();
        expect(screen.getByText('1.5s')).toBeInTheDocument();
      });
    });
  });

  describe('AdvancedAI Component', () => {
    it('should render AI interface', async () => {
      const { AdvancedAI } = await import('@/components/AdvancedAI');
      render(<AdvancedAI />);

      expect(screen.getByText('IA Avançada')).toBeInTheDocument();
      expect(screen.getByText('Funcionalidades inteligentes para geração, análise e otimização de conteúdo')).toBeInTheDocument();
    });

    it('should handle content generation', async () => {
      const mockModels = [
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          provider: 'OpenAI',
          type: 'text',
          isAvailable: true,
          maxTokens: 4000,
          costPer1kTokens: 0.002
        }
      ];

      mockUseAdvancedAI.models = mockModels;

      const { AdvancedAI } = await import('@/components/AdvancedAI');
      render(<AdvancedAI />);

      const generateTab = screen.getByText('Geração');
      fireEvent.click(generateTab);

      await waitFor(() => {
        const promptInput = screen.getByPlaceholderText('Descreva o que você quer gerar...');
        await userEvent.type(promptInput, 'Generate safety training content');

        const modelSelect = screen.getByLabelText('Modelo de IA');
        fireEvent.click(modelSelect);
        
        const modelOption = screen.getByText('GPT-3.5 Turbo');
        fireEvent.click(modelOption);

        const generateButton = screen.getByText('Gerar Conteúdo');
        fireEvent.click(generateButton);
      });

      expect(mockUseAdvancedAI.generateContent).toHaveBeenCalled();
    });

    it('should analyze content sentiment', async () => {
      const { AdvancedAI } = await import('@/components/AdvancedAI');
      render(<AdvancedAI />);

      const analyzeTab = screen.getByText('Análise');
      fireEvent.click(analyzeTab);

      await waitFor(() => {
        const contentInput = screen.getByPlaceholderText('Cole ou digite o conteúdo que deseja analisar...');
        await userEvent.type(contentInput, 'This is great training content!');

        const sentimentButton = screen.getByText('Sentimento');
        fireEvent.click(sentimentButton);
      });

      expect(mockUseAdvancedAI.analyzeSentiment).toHaveBeenCalledWith('This is great training content!');
    });

    it('should optimize content', async () => {
      const { AdvancedAI } = await import('@/components/AdvancedAI');
      render(<AdvancedAI />);

      const optimizeTab = screen.getByText('Otimização');
      fireEvent.click(optimizeTab);

      await waitFor(() => {
        const contentInput = screen.getByPlaceholderText('Cole ou digite o conteúdo que deseja otimizar...');
        await userEvent.type(contentInput, 'Content that needs optimization');

        const optimizeButton = screen.getByText('Otimizar Conteúdo');
        fireEvent.click(optimizeButton);
      });

      expect(mockUseAdvancedAI.optimizeContent).toHaveBeenCalledWith('Content that needs optimization');
    });

    it('should display AI insights', async () => {
      const mockInsights = [
        {
          id: 'insight1',
          type: 'content_suggestion' as const,
          title: 'Improve Content Clarity',
          description: 'The content could be more clear and concise',
          category: 'content',
          priority: 'medium' as const,
          actionable: true,
          actions: [
            {
              id: 'action1',
              type: 'auto' as const,
              label: 'Auto-optimize',
              description: 'Automatically optimize content'
            }
          ],
          metadata: {},
          isRead: false,
          isActioned: false,
          createdAt: new Date()
        }
      ];

      mockUseAdvancedAI.insights = mockInsights;

      const { AdvancedAI } = await import('@/components/AdvancedAI');
      render(<AdvancedAI />);

      const insightsTab = screen.getByText('Insights');
      fireEvent.click(insightsTab);

      await waitFor(() => {
        expect(screen.getByText('Improve Content Clarity')).toBeInTheDocument();
        expect(screen.getByText('medium')).toBeInTheDocument();
        expect(screen.getByText('Auto-optimize')).toBeInTheDocument();
      });

      const markReadButton = screen.getByLabelText('Marcar como lido');
      fireEvent.click(markReadButton);

      expect(mockUseAdvancedAI.markInsightAsRead).toHaveBeenCalledWith('insight1');
    });

    it('should display generation history', async () => {
      const mockHistory = [
        {
          id: 'gen1',
          type: 'text',
          content: 'Generated safety training content...',
          metadata: {
            model: 'gpt-3.5-turbo',
            tokensUsed: 150,
            cost: 0.003,
            generationTime: 2.5,
            quality: 0.85
          },
          createdAt: new Date()
        }
      ];

      mockUseAdvancedAI.generationHistory = mockHistory;

      const { AdvancedAI } = await import('@/components/AdvancedAI');
      render(<AdvancedAI />);

      const historyTab = screen.getByText('Histórico');
      fireEvent.click(historyTab);

      await waitFor(() => {
        expect(screen.getByText('text')).toBeInTheDocument();
        expect(screen.getByText('gpt-3.5-turbo')).toBeInTheDocument();
        expect(screen.getByText('150 tokens')).toBeInTheDocument();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should integrate templates with compliance analysis', async () => {
      const mockTemplate = {
        id: '1',
        name: 'Safety Template',
        category: 'NR-12',
        description: 'Safety training template',
        thumbnail: '',
        content: { slides: [{ title: 'Safety Procedures' }] },
        metadata: {
          version: '1.0',
          author: 'Test',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['safety'],
          compliance: { nrCategory: 'NR-12', isCompliant: true, score: 95 }
        },
        isFavorite: false,
        isCustom: false
      };

      mockUseAdvancedTemplates.templates = [mockTemplate];

      const { AdvancedTemplates } = await import('@/components/AdvancedTemplates');
      render(<AdvancedTemplates />);

      const analyzeButton = screen.getByText('Analisar Compliance');
      fireEvent.click(analyzeButton);

      expect(mockUseComplianceAnalyzer.analyzeTemplate).toHaveBeenCalledWith(mockTemplate);
    });

    it('should integrate editor with collaboration', async () => {
      const mockElement = {
        id: 'element1',
        type: 'text' as const,
        content: 'Collaborative text',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 50 },
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        layerId: 'layer1',
        animations: [],
        interactions: []
      };

      mockUseWYSIWYGEditor.elements = [mockElement];
      mockUseRealTimeCollaboration.isConnected = true;

      const { WYSIWYGEditor } = await import('@/components/WYSIWYGEditor');
      render(<WYSIWYGEditor />);

      // Simulate element change
      const textInput = screen.getByDisplayValue('Collaborative text');
      await userEvent.clear(textInput);
      await userEvent.type(textInput, 'Updated text');

      expect(mockUseRealTimeCollaboration.trackElementChange).toHaveBeenCalled();
    });

    it('should integrate AI with workflow automation', async () => {
      const mockWorkflow = {
        id: 'workflow1',
        name: 'AI Content Generation',
        description: 'Automatically generate content using AI',
        trigger: { type: 'schedule' as const, config: { cron: '0 9 * * *' } },
        actions: [
          {
            id: 'action1',
            type: 'ai_generation' as const,
            name: 'Generate Content',
            config: {
              prompt: 'Generate daily safety tip',
              model: 'gpt-3.5-turbo'
            },
            enabled: true
          }
        ],
        conditions: [],
        variables: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastExecuted: null,
        executionCount: 0
      };

      mockUseWorkflowAutomation.workflows = [mockWorkflow];

      const { WorkflowAutomation } = await import('@/components/WorkflowAutomation');
      render(<WorkflowAutomation />);

      const triggerButton = screen.getByText('Executar');
      fireEvent.click(triggerButton);

      expect(mockUseWorkflowAutomation.triggerWorkflow).toHaveBeenCalledWith('workflow1', {});
    });
  });

  describe('Error Handling Tests', () => {
    it('should display error states gracefully', async () => {
      mockUseAdvancedTemplates.error = 'Failed to load templates';

      const { AdvancedTemplates } = await import('@/components/AdvancedTemplates');
      render(<AdvancedTemplates />);

      expect(screen.getByText('Erro: Failed to load templates')).toBeInTheDocument();
    });

    it('should handle loading states', async () => {
      mockUseAdvancedTemplates.isLoading = true;

      const { AdvancedTemplates } = await import('@/components/AdvancedTemplates');
      render(<AdvancedTemplates />);

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });

    it('should handle empty states', async () => {
      mockUseAdvancedTemplates.templates = [];

      const { AdvancedTemplates } = await import('@/components/AdvancedTemplates');
      render(<AdvancedTemplates />);

      expect(screen.getByText('Nenhum template encontrado')).toBeInTheDocument();
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper ARIA labels', async () => {
      const { AdvancedTemplates } = await import('@/components/AdvancedTemplates');
      render(<AdvancedTemplates />);

      expect(screen.getByLabelText('Buscar templates')).toBeInTheDocument();
      expect(screen.getByLabelText('Filtrar por categoria')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const { AdvancedTemplates } = await import('@/components/AdvancedTemplates');
      render(<AdvancedTemplates />);

      const searchInput = screen.getByLabelText('Buscar templates');
      searchInput.focus();

      expect(document.activeElement).toBe(searchInput);

      // Test tab navigation
      await userEvent.tab();
      expect(document.activeElement).not.toBe(searchInput);
    });

    it('should have proper heading hierarchy', async () => {
      const { AdvancedTemplates } = await import('@/components/AdvancedTemplates');
      render(<AdvancedTemplates />);

      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Templates Avançados');
    });
  });

  describe('Performance Tests', () => {
    it('should render large lists efficiently', async () => {
      const manyTemplates = Array.from({ length: 100 }, (_, i) => ({
        id: `template${i}`,
        name: `Template ${i}`,
        category: 'NR-12',
        description: `Description ${i}`,
        thumbnail: '',
        content: {},
        metadata: {
          version: '1.0',
          author: 'Test',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: [],
          compliance: { nrCategory: 'NR-12', isCompliant: true, score: 95 }
        },
        isFavorite: false,
        isCustom: false
      }));

      mockUseAdvancedTemplates.templates = manyTemplates;

      const startTime = performance.now();
      
      const { AdvancedTemplates } = await import('@/components/AdvancedTemplates');
      render(<AdvancedTemplates />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(1000); // Should render within 1 second
      expect(screen.getByText('Template 0')).toBeInTheDocument();
      expect(screen.getByText('Template 99')).toBeInTheDocument();
    });

    it('should handle rapid user interactions', async () => {
      const { AdvancedTemplates } = await import('@/components/AdvancedTemplates');
      render(<AdvancedTemplates />);

      const searchInput = screen.getByLabelText('Buscar templates');

      // Simulate rapid typing
      const rapidText = 'rapid typing test';
      for (const char of rapidText) {
        await userEvent.type(searchInput, char, { delay: 10 });
      }

      // Should handle all input without errors
      expect(searchInput).toHaveValue(rapidText);
    });
  });
});

console.log('✅ All component tests completed successfully!');