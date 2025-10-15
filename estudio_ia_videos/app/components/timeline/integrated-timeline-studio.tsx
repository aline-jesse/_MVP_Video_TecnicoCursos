'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Layers, 
  Zap, 
  Timer, 
  Download, 
  Save,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Maximize2,
  Navigation,
  Target,
  Sparkles,
  Clock,
  FileVideo,
  AudioLines,
  Grid3X3,
  RotateCcw,
  Bookmark,
  TrendingUp,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

// Importar todos os componentes da timeline profissional
import MultiTrackManager from './multi-track-manager';
import AudioVideoSyncEngine from './audio-video-sync-engine';
import RealTimePreview from './real-time-preview';
import TimelineExportEngine from './timeline-export-engine';
import { KeyframeAnimationSystem } from './keyframe-animation-system';
import { SpeedTimingControls } from './speed-timing-controls';
import { EffectsTransitionsLibrary } from './effects-transitions-library';
import { UndoRedoSystem } from './undo-redo-system';
import { ZoomNavigationControls } from './zoom-navigation-controls';
import { toast } from 'sonner';

// Interfaces para o estúdio integrado
interface StudioState {
  activeModule: string;
  projectName: string;
  lastSaved: Date | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  zoom: number;
  tracks: any[];
  selectedItems: string[];
  previewQuality: 'low' | 'medium' | 'high' | 'ultra';
  renderInProgress: boolean;
  syncStatus: 'synced' | 'syncing' | 'error';
  performanceMetrics: PerformanceMetrics;
}

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
  renderTime: number;
  syncLatency: number;
  activeEffects: number;
  trackCount: number;
}

interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  enabled: boolean;
  shortcut?: string;
}

// Configuração dos módulos
const TIMELINE_MODULES: ModuleConfig[] = [
  {
    id: 'tracks',
    name: 'Multi-Track',
    description: 'Gerenciamento de múltiplas faixas com sincronização',
    icon: <Layers className="w-4 h-4" />,
    component: MultiTrackManager,
    enabled: true,
    shortcut: 'Ctrl+1'
  },
  {
    id: 'sync',
    name: 'Audio/Video Sync',
    description: 'Sincronização precisa de áudio e vídeo',
  icon: <AudioLines className="w-4 h-4" />,
    component: AudioVideoSyncEngine,
    enabled: true,
    shortcut: 'Ctrl+2'
  },
  {
    id: 'preview',
    name: 'Preview Real-Time',
    description: 'Preview em tempo real com scrubbing',
    icon: <Eye className="w-4 h-4" />,
    component: RealTimePreview,
    enabled: true,
    shortcut: 'Ctrl+3'
  },
  {
    id: 'export',
    name: 'Export Engine',
    description: 'Exportação avançada com múltiplos formatos',
    icon: <Download className="w-4 h-4" />,
    component: TimelineExportEngine,
    enabled: true,
    shortcut: 'Ctrl+4'
  },
  {
    id: 'keyframes',
    name: 'Keyframes',
    description: 'Sistema de animação com keyframes',
    icon: <Target className="w-4 h-4" />,
    component: KeyframeAnimationSystem,
    enabled: true,
    shortcut: 'Ctrl+5'
  },
  {
    id: 'timing',
    name: 'Speed & Timing',
    description: 'Controles de velocidade e timing precisos',
    icon: <Timer className="w-4 h-4" />,
    component: SpeedTimingControls,
    enabled: true,
    shortcut: 'Ctrl+6'
  },
  {
    id: 'effects',
    name: 'Effects Library',
    description: 'Biblioteca de efeitos e transições',
    icon: <Sparkles className="w-4 h-4" />,
    component: EffectsTransitionsLibrary,
    enabled: true,
    shortcut: 'Ctrl+7'
  },
  {
    id: 'history',
    name: 'Undo/Redo',
    description: 'Sistema avançado de histórico',
    icon: <RotateCcw className="w-4 h-4" />,
    component: UndoRedoSystem,
    enabled: true,
    shortcut: 'Ctrl+8'
  },
  {
    id: 'navigation',
    name: 'Zoom & Navigation',
    description: 'Controles de zoom e navegação',
    icon: <Navigation className="w-4 h-4" />,
    component: ZoomNavigationControls,
    enabled: true,
    shortcut: 'Ctrl+9'
  }
];

export function IntegratedTimelineStudio() {
  const searchParams = useSearchParams();
  // Estados principais
  const [studioState, setStudioState] = useState<StudioState>({
    activeModule: 'tracks',
    projectName: 'Novo Projeto',
    lastSaved: null,
    isPlaying: false,
    currentTime: 0,
    duration: 300,
    zoom: 1,
    tracks: [],
    selectedItems: [],
    previewQuality: 'high',
    renderInProgress: false,
    syncStatus: 'synced',
    performanceMetrics: {
      fps: 60,
      memoryUsage: 45,
      cpuUsage: 25,
      renderTime: 16.7,
      syncLatency: 2,
      activeEffects: 0,
      trackCount: 0
    }
  });

  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [fullscreenModule, setFullscreenModule] = useState<string | null>(null);

  // Integração com APIs reais
  const [projectId, setProjectId] = useState<string>('');
  // Inicializa projectId pela URL (?projectId=...)
  useEffect(() => {
    const pid = searchParams?.get('projectId') || '';
    if (pid) setProjectId(pid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carregar timeline do backend
  const handleLoadTimeline = useCallback(async () => {
    if (!projectId) {
      toast.error('Informe um Project ID para carregar a timeline.');
      return;
    }
    try {
      const res = await fetch(`/api/v1/timeline/multi-track?projectId=${encodeURIComponent(projectId)}`);
      const json = await res.json();
      if (!res.ok || !json?.success || !json?.data) {
        throw new Error(json?.message || 'Falha ao carregar timeline');
      }
      const { tracks, totalDuration, settings, projectName } = json.data;
      setStudioState(prev => ({
        ...prev,
        tracks: Array.isArray(tracks) ? tracks : [],
        duration: typeof totalDuration === 'number' ? totalDuration : prev.duration,
        lastSaved: new Date(json.data.updatedAt || Date.now()),
        projectName: projectName || prev.projectName,
      }));
      if (settings) {
        setSettings(prev => ({
          ...prev,
          fps: settings.fps ?? prev.fps,
          resolution: settings.resolution ?? prev.resolution,
          format: settings.format ?? prev.format,
          snapToGrid: settings.snapToGrid ?? prev.snapToGrid,
          autoSave: settings.autoSave ?? prev.autoSave,
          zoom: settings.zoom ?? prev.zoom,
        }));
        if (typeof settings.autoSave === 'boolean') setAutoSave(settings.autoSave);
      }
      toast.success('Timeline carregada');
    } catch (err: any) {
      toast.error(`Erro ao carregar: ${err.message || err}`);
    }
  }, [projectId]);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportJobId, setExportJobId] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatus, setExportStatus] = useState<string>('idle');
  const [exportOutputUrl, setExportOutputUrl] = useState<string | null>(null);
  const [exportMetadata, setExportMetadata] = useState<any | null>(null);
  const [exportHistory, setExportHistory] = useState<Array<{id:string;status:string;progress:number;outputUrl?:string|null;error?:string|null;createdAt?:string;updatedAt?:string}>>([]);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [historyStatus, setHistoryStatus] = useState<'all'|'queued'|'processing'|'completed'|'error'>('all');
  const [historyPage, setHistoryPage] = useState({ offset: 0, limit: 10, total: 0, hasNext: false });
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobModalLoading, setJobModalLoading] = useState(false);
  const [jobDetails, setJobDetails] = useState<any | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<'balance'|'quality'|'small'>('balance');

  // Settings (persistidos com a timeline)
  const [settings, setSettings] = useState({
    fps: 30,
    resolution: '1920x1080',
    format: 'mp4',
    quality: 'hd' as 'sd' | 'hd' | 'fhd' | '4k',
    snapToGrid: true,
    autoSave: true,
    zoom: 10,
  });

  // Codec sugerido e validação preventiva
  const suggestCodec = useCallback(() => {
    const fmt = (settings.format || 'mp4').toLowerCase();
    const q = settings.quality || 'hd';
    if (fmt === 'webm') return 'vp9';
    if (fmt === 'mov') return q === '4k' ? 'h265' : 'h264';
    return q === '4k' ? 'h265' : 'h264';
  }, [settings.format, settings.quality]);

  const isCombinationValid = useCallback(() => {
    const validFormats = ['mp4','webm','mov'];
    const validQualities = ['sd','hd','fhd','4k'];
    const validFps = [24,30,60];
    if (!validFormats.includes(settings.format)) return false;
    if (!validQualities.includes(settings.quality)) return false;
    if (!validFps.includes(settings.fps)) return false;
    // Se chegamos aqui, haverá um codec sugerido compatível pelo backend
    return true;
  }, [settings.format, settings.quality, settings.fps]);

  const loadExportHistory = useCallback(async () => {
    if (!projectId) return;
    try {
      const qs = new URLSearchParams();
      qs.set('projectId', projectId);
      if (historyStatus !== 'all') qs.set('status', historyStatus);
      qs.set('limit', String(historyPage.limit));
      qs.set('offset', String(historyPage.offset));
      const res = await fetch(`/api/v1/video/export-real?${qs.toString()}`);
      const json = await res.json();
      if (res.ok && json?.success) {
        if (Array.isArray(json.history)) setExportHistory(json.history);
        if (json.page) setHistoryPage((p) => ({ ...p, total: json.page.total, hasNext: !!json.page.hasNext }));
      }
    } catch (e) {
      // silencioso
    }
  }, [projectId, historyStatus, historyPage.offset, historyPage.limit]);

  const openJobDetails = useCallback(async (jobId: string) => {
    try {
      setShowJobModal(true);
      setJobModalLoading(true);
      setJobDetails(null);
      const res = await fetch(`/api/v1/video/export-real?jobId=${encodeURIComponent(jobId)}`);
      const json = await res.json();
      if (res.ok && json?.success && json?.job) {
        setJobDetails(json.job);
      } else {
        toast.error(json?.error || 'Não foi possível carregar detalhes do job');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Falha ao carregar detalhes');
    } finally {
      setJobModalLoading(false);
    }
  }, []);

  const applyProfile = useCallback((profile: 'balance'|'quality'|'small') => {
    setSelectedProfile(profile);
    if (profile === 'balance') {
      setSettings(prev => ({ ...prev, format: 'mp4', quality: 'hd', fps: 30 }));
    } else if (profile === 'quality') {
      setSettings(prev => ({ ...prev, format: 'mp4', quality: 'fhd', fps: 60 }));
    } else if (profile === 'small') {
      setSettings(prev => ({ ...prev, format: 'webm', quality: 'hd', fps: 24 }));
    }
  }, []);

  // Refs
  const studioRef = useRef<HTMLDivElement>(null);
  const performanceInterval = useRef<NodeJS.Timeout | null>(null);

  // Funções de controle global
  const togglePlayback = useCallback(() => {
    setStudioState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  }, []);

  const stopPlayback = useCallback(() => {
    setStudioState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0
    }));
  }, []);

  const saveProject = useCallback(async () => {
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStudioState(prev => ({
        ...prev,
        lastSaved: new Date()
      }));

      // Toast de sucesso seria aqui
      console.log('Projeto salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
    }
  }, []);

  // Salvar timeline via API real
  const handleSaveTimeline = useCallback(async () => {
    if (!projectId) {
      toast.error('Informe um Project ID para salvar a timeline.');
      return;
    }
    try {
      setIsSaving(true);
      const res = await fetch('/api/v1/timeline/multi-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          tracks: studioState.tracks || [],
          totalDuration: studioState.duration || 0,
          exportSettings: settings
        })
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || 'Falha ao salvar timeline');
      }
      toast.success('Timeline salva com sucesso');
      setStudioState(prev => ({ ...prev, lastSaved: new Date() }));
    } catch (err: any) {
      toast.error(`Erro ao salvar: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  }, [projectId, studioState.tracks, studioState.duration, settings]);

  // Iniciar export via API real
  const handleExport = useCallback(async () => {
    if (!projectId) {
      toast.error('Informe um Project ID para exportar o vídeo.');
      return;
    }
    try {
      setIsExporting(true);
      setExportProgress(0);
      setExportStatus('queued');
      setExportOutputUrl(null);
      const codec = suggestCodec()
      const res = await fetch('/api/v1/video/export-real', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, options: { format: settings.format || 'mp4', quality: settings.quality || 'hd', fps: settings.fps || 30, codec } })
      });
      const json = await res.json();
      if (!res.ok || !json?.success || !json?.jobId) {
        throw new Error(json?.error || 'Falha ao iniciar export');
      }
      setExportJobId(json.jobId);
      toast.success('Exportação iniciada');
      // Atualiza histórico após iniciar
      loadExportHistory();
    } catch (err: any) {
      setIsExporting(false);
      setExportStatus('error');
      toast.error(`Erro ao exportar: ${err.message || err}`);
    }
  }, [projectId, settings, suggestCodec, loadExportHistory]);

  const handleCancelExport = useCallback(async () => {
    if (!exportJobId) return;
    try {
      const res = await fetch(`/api/v1/video/export-real?jobId=${encodeURIComponent(exportJobId)}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Falha ao cancelar exportação');
      setIsExporting(false);
      setExportStatus('idle');
      setExportProgress(0);
      setExportOutputUrl(null);
      setExportJobId(null);
      toast.success('Exportação cancelada');
    } catch (e: any) {
      toast.error(`Erro ao cancelar: ${e.message || e}`);
    }
  }, [exportJobId]);

  // Polling do job de export
  useEffect(() => {
    if (!exportJobId) return;
    let mounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/video/export-real?jobId=${exportJobId}`);
        const json = await res.json();
        if (!mounted) return;
        if (res.ok && json?.success && json?.job) {
          setExportProgress(json.job.progress ?? 0);
          setExportStatus(json.job.status ?? 'processing');
          if (json.job.status === 'completed' || json.job.status === 'error') {
            clearInterval(interval);
            setIsExporting(false);
            if (json.job.status === 'completed') {
              setExportOutputUrl(json.job.outputUrl || null);
              setExportMetadata(json.job.metadata || null);
              toast.success('Exportação concluída!');
              // Atualiza histórico ao concluir
              loadExportHistory();
            } else {
              toast.error(json.job.error || 'Falha na exportação');
            }
          }
        } else if (!res.ok) {
          clearInterval(interval);
          setIsExporting(false);
          setExportStatus('error');
        }
      } catch (e) {
        clearInterval(interval);
        setIsExporting(false);
        setExportStatus('error');
      }
    }, 1500);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [exportJobId, loadExportHistory]);

  // Carregar histórico quando projectId mudar ou ao abrir painel
  useEffect(() => { loadExportHistory(); }, [loadExportHistory]);

  // Carregar timeline do backend deve hidratar settings e autosave
  useEffect(() => {
    // Nada aqui – apenas garantimos que autoSave esteja sincronizado com settings.autoSave
  }, []);

  const switchModule = useCallback((moduleId: string) => {
    setStudioState(prev => ({
      ...prev,
      activeModule: moduleId
    }));
  }, []);

  const toggleFullscreen = useCallback((moduleId?: string) => {
    setFullscreenModule(prev => prev === moduleId ? null : moduleId || null);
  }, []);

  // Monitoramento de performance
  const updatePerformanceMetrics = useCallback(() => {
    setStudioState(prev => ({
      ...prev,
      performanceMetrics: {
        ...prev.performanceMetrics,
        fps: 60 - Math.random() * 10,
        memoryUsage: 40 + Math.random() * 30,
        cpuUsage: 20 + Math.random() * 40,
        renderTime: 16 + Math.random() * 10,
        syncLatency: 1 + Math.random() * 5,
        activeEffects: prev.tracks.reduce((acc, track) => acc + (track.effects?.length || 0), 0),
        trackCount: prev.tracks.length
      }
    }));
  }, []);

  // Auto-save
  useEffect(() => {
    if (!autoSave) return;

    const interval = setInterval(() => {
      if (projectId) {
        // Persistência real quando há projectId
        handleSaveTimeline();
      } else {
        // Fallback para simulado
        saveProject();
      }
    }, 30000); // Auto-save a cada 30 segundos

    return () => clearInterval(interval);
  }, [autoSave, projectId, handleSaveTimeline, saveProject]);

  // Sincronizar autoSave <-> settings.autoSave
  useEffect(() => {
    setSettings(prev => ({ ...prev, autoSave }));
  }, [autoSave]);
  useEffect(() => {
    if (settings.autoSave !== autoSave) setAutoSave(settings.autoSave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.autoSave]);

  // Performance monitoring
  useEffect(() => {
    if (showPerformancePanel) {
      performanceInterval.current = setInterval(updatePerformanceMetrics, 1000);
    } else {
      if (performanceInterval.current) {
        clearInterval(performanceInterval.current);
      }
    }

    return () => {
      if (performanceInterval.current) {
        clearInterval(performanceInterval.current);
      }
    };
  }, [showPerformancePanel, updatePerformanceMetrics]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            saveProject();
            break;
          case ' ':
            e.preventDefault();
            togglePlayback();
            break;
          case 'f':
            e.preventDefault();
            toggleFullscreen(studioState.activeModule);
            break;
          default:
            // Verificar atalhos dos módulos
            const moduleShortcut = TIMELINE_MODULES.find(m => 
              m.shortcut === `Ctrl+${e.key}`
            );
            if (moduleShortcut) {
              e.preventDefault();
              switchModule(moduleShortcut.id);
            }
            break;
        }
      }

      // Atalhos sem Ctrl
      switch (e.key) {
        case 'Escape':
          if (fullscreenModule) {
            setFullscreenModule(null);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveProject, togglePlayback, toggleFullscreen, studioState.activeModule, fullscreenModule, switchModule]);

  // Renderizar módulo ativo
  const renderActiveModule = () => {
    const activeModuleConfig = TIMELINE_MODULES.find(m => m.id === studioState.activeModule);
    if (!activeModuleConfig || !activeModuleConfig.enabled) {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Módulo não encontrado</h3>
            <p>O módulo selecionado não está disponível.</p>
          </div>
        </div>
      );
    }

    const ModuleComponent = activeModuleConfig.component;
    return <ModuleComponent {...studioState} />;
  };

  return (
    <>
    <div 
      ref={studioRef}
      className={`w-full h-screen bg-gray-900 text-white flex flex-col ${
        fullscreenModule ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* Header Global */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          {/* Título e Status */}
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-bold">Timeline Studio Profissional</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>{studioState.projectName}</span>
                <Separator orientation="vertical" className="h-4" />
                <span>
                  {studioState.lastSaved 
                    ? `Salvo ${studioState.lastSaved.toLocaleTimeString()}`
                    : 'Não salvo'
                  }
                </span>
                <Separator orientation="vertical" className="h-4" />
                <Badge 
                  variant={studioState.syncStatus === 'synced' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {studioState.syncStatus === 'synced' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {studioState.syncStatus === 'syncing' && <Activity className="w-3 h-3 mr-1" />}
                  {studioState.syncStatus === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                  {studioState.syncStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Controles Globais + Integração API */}
          <div className="flex items-center space-x-2">
            {/* Controles de Reprodução */}
            <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
              <Button
                onClick={togglePlayback}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {studioState.isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={stopPlayback}
                size="sm"
                variant="outline"
                className="text-gray-300 border-gray-600"
              >
                <Square className="w-4 h-4" />
              </Button>
            </div>

            {/* Tempo Atual */}
            <div className="bg-gray-700 px-3 py-1 rounded text-sm font-mono">
              {Math.floor(studioState.currentTime / 60)}:{(studioState.currentTime % 60).toFixed(1).padStart(4, '0')}
            </div>

            {/* Qualidade do Preview */}
            <Badge variant="outline" className="text-gray-300 border-gray-600">
              {studioState.previewQuality.toUpperCase()}
            </Badge>

            {/* Codec sugerido */}
            <Badge variant={isCombinationValid() ? 'outline' : 'destructive'} className="text-gray-300 border-gray-600">
              Codec: {suggestCodec()}{!isCombinationValid() ? ' (inválido)' : ''}
            </Badge>

            {/* Project ID */}
            <input
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm w-72"
              placeholder="Project ID (obrigatório para salvar/exportar)"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />

                {/* Perfil de Exportação */}
                <select
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  value={selectedProfile}
                  onChange={(e) => applyProfile(e.target.value as any)}
                  title="Perfil de exportação"
                >
                  <option value="balance">Equilíbrio</option>
                  <option value="quality">Alta Qualidade</option>
                  <option value="small">Tamanho Reduzido</option>
                </select>

              {/* Settings rápidos: FPS e Resolução */}
              <select
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                value={settings.fps}
                onChange={(e) => setSettings(prev => ({ ...prev, fps: Number(e.target.value) }))}
                title="FPS"
              >
                <option value={24}>24 FPS</option>
                <option value={30}>30 FPS</option>
                <option value={60}>60 FPS</option>
              </select>
              <select
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                value={settings.resolution}
                onChange={(e) => setSettings(prev => ({ ...prev, resolution: e.target.value }))}
                title="Resolução"
              >
                <option value="1280x720">1280x720</option>
                <option value="1920x1080">1920x1080</option>
                <option value="3840x2160">3840x2160</option>
              </select>
              <select
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                value={settings.quality}
                onChange={(e) => setSettings(prev => ({ ...prev, quality: e.target.value as any }))}
                title="Qualidade"
              >
                <option value="sd">SD</option>
                <option value="hd">HD</option>
                <option value="fhd">Full HD</option>
                <option value="4k">4K</option>
              </select>
              <select
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                value={settings.format}
                onChange={(e) => setSettings(prev => ({ ...prev, format: e.target.value }))}
                title="Formato"
              >
                <option value="mp4">MP4</option>
                <option value="webm">WebM</option>
                <option value="mov">MOV</option>
              </select>

            {/* Botões de Ação */}
            <Button
              onClick={handleSaveTimeline}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              disabled={isSaving || !projectId}
            >
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? 'Salvando...' : 'Salvar Timeline'}
            </Button>

            <Button
              onClick={handleLoadTimeline}
              size="sm"
              variant="outline"
              className="text-gray-300 border-gray-600"
              disabled={!projectId}
            >
              Carregar Timeline
            </Button>

            <Button
              onClick={handleExport}
              size="sm"
              variant="secondary"
              disabled={isExporting || !projectId || !isCombinationValid()}
            >
              {isExporting ? `Exportando (${exportProgress}%)` : 'Exportar Vídeo'}
            </Button>
            <Button
              onClick={() => { setShowHistoryPanel(!showHistoryPanel); if (!showHistoryPanel) loadExportHistory(); }}
              size="sm"
              variant="outline"
              className="text-gray-300 border-gray-600"
              disabled={!projectId}
              title="Mostrar histórico de exports"
            >
              Histórico
            </Button>
            {isExporting && (
              <Button
                onClick={handleCancelExport}
                size="sm"
                variant="outline"
                className="text-gray-300 border-gray-600"
              >
                Cancelar
              </Button>
            )}
            {exportStatus !== 'idle' && (
              <Badge variant={exportStatus === 'error' ? 'destructive' : 'default'}>
                {exportStatus}
              </Badge>
            )}
            {isExporting && (
              <div className="w-40 h-2 bg-gray-700 rounded overflow-hidden">
                <div
                  className="h-2 bg-blue-500 transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, exportProgress))}%` }}
                />
              </div>
            )}
            {exportStatus === 'completed' && exportMetadata && (
              <div className="text-xs text-gray-300 ml-2">
                {exportMetadata.codec && <span className="mr-2">Codec: {exportMetadata.codec}</span>}
                {typeof exportMetadata.duration === 'number' && (
                  <span className="mr-2">Duração: {Math.round(exportMetadata.duration)}s</span>
                )}
                {typeof exportMetadata.sizeBytes === 'number' && (
                  <span className="mr-2">Tamanho: {Math.max(1, Math.round(exportMetadata.sizeBytes / (1024 * 1024)))} MB</span>
                )}
                {typeof exportMetadata.bitrateKbps === 'number' && exportMetadata.bitrateKbps > 0 && (
                  <span className="mr-2">Bitrate: {exportMetadata.bitrateKbps} kbps</span>
                )}
                {typeof exportMetadata.resolution === 'string' && exportMetadata.resolution !== 'unknown' && (
                  <span>Resolução: {exportMetadata.resolution}</span>
                )}
              </div>
            )}

            {exportStatus === 'completed' && exportOutputUrl && (
              <div className="flex items-center space-x-2">
                {(() => {
                  const ext = (settings.format || 'mp4').toLowerCase();
                  const safeDate = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
                  const filename = `${projectId || 'video'}_${safeDate}.${ext}`;
                  return (
                    <a
                      href={exportOutputUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={filename}
                      className="inline-flex items-center px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                    >
                      <Download className="w-4 h-4 mr-1" /> Baixar Vídeo
                    </a>
                  );
                })()}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-gray-300 border-gray-600"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(exportOutputUrl);
                      toast.success('Link copiado para a área de transferência');
                    } catch {
                      toast.error('Não foi possível copiar o link');
                    }
                  }}
                >
                  Copiar link
                </Button>
              </div>
            )}

            <Button
              onClick={() => setShowPerformancePanel(!showPerformancePanel)}
              size="sm"
              variant="outline"
              className="text-gray-300 border-gray-600"
            >
              <Activity className="w-4 h-4" />
            </Button>

            <Button
              onClick={() => toggleFullscreen(studioState.activeModule)}
              size="sm"
              variant="outline"
              className="text-gray-300 border-gray-600"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navegação de Módulos */}
        <div className="mt-4">
          <Tabs value={studioState.activeModule} onValueChange={switchModule}>
            <TabsList className="grid grid-cols-9 bg-gray-700 w-full">
              {TIMELINE_MODULES.map((module) => (
                <TabsTrigger
                  key={module.id}
                  value={module.id}
                  className="flex items-center space-x-1 text-xs"
                  disabled={!module.enabled}
                  title={`${module.description} ${module.shortcut ? `(${module.shortcut})` : ''}`}
                >
                  {module.icon}
                  <span className="hidden lg:inline">{module.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Área Principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Painel de Performance (Lateral) */}
        {showPerformancePanel && (
          <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Activity className="w-3 h-3 mr-1" />
                      FPS
                    </span>
                    <span className="font-mono">{studioState.performanceMetrics.fps.toFixed(1)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Cpu className="w-3 h-3 mr-1" />
                      CPU
                    </span>
                    <span className="font-mono">{studioState.performanceMetrics.cpuUsage.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <HardDrive className="w-3 h-3 mr-1" />
                      Memory
                    </span>
                    <span className="font-mono">{studioState.performanceMetrics.memoryUsage.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Render
                    </span>
                    <span className="font-mono">{studioState.performanceMetrics.renderTime.toFixed(1)}ms</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Wifi className="w-3 h-3 mr-1" />
                      Sync
                    </span>
                    <span className="font-mono">{studioState.performanceMetrics.syncLatency.toFixed(1)}ms</span>
                  </div>
                </div>

                <Separator className="bg-gray-600" />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Tracks Ativas</span>
                    <Badge variant="outline" className="text-xs">
                      {studioState.performanceMetrics.trackCount}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Efeitos Ativos</span>
                    <Badge variant="outline" className="text-xs">
                      {studioState.performanceMetrics.activeEffects}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Módulo Ativo */}
        <div className="flex-1 overflow-hidden relative">
          {renderActiveModule()}

          {/* Painel de Histórico (flutuante) */}
          {showHistoryPanel && (
            <div className="absolute right-4 top-4 w-96 max-h-[60vh] overflow-y-auto bg-gray-800 border border-gray-700 rounded shadow-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Histórico de Exports</div>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" className="text-gray-300 border-gray-600" onClick={loadExportHistory}>Atualizar</Button>
                  <Button size="sm" variant="outline" className="text-gray-300 border-gray-600" onClick={() => setShowHistoryPanel(false)}>Fechar</Button>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <select className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs" value={historyStatus} onChange={(e) => { setHistoryStatus(e.target.value as any); setHistoryPage(p => ({ ...p, offset: 0 })); }}>
                  <option value="all">Todos</option>
                  <option value="queued">Queued</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="error">Error</option>
                </select>
                <div className="space-x-2 text-xs text-gray-300">
                  <Button size="sm" variant="outline" className="text-gray-300 border-gray-600" disabled={historyPage.offset === 0} onClick={() => setHistoryPage(p => ({ ...p, offset: Math.max(0, p.offset - p.limit) }))}>Prev</Button>
                  <Button size="sm" variant="outline" className="text-gray-300 border-gray-600" disabled={!historyPage.hasNext} onClick={() => setHistoryPage(p => ({ ...p, offset: p.offset + p.limit }))}>Next</Button>
                </div>
              </div>
              {exportHistory.length === 0 && (
                <div className="text-sm text-gray-400">Sem exports recentes para este projeto.</div>
              )}
              {exportHistory.map((j) => (
                <div key={j.id} className="border border-gray-700 rounded p-2 bg-gray-900">
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-mono text-xs">{j.id}</div>
                    <Badge variant={j.status === 'error' ? 'destructive' : 'default'}>{j.status}{typeof j.progress === 'number' ? ` (${j.progress}%)` : ''}</Badge>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                    <div>
                      {j.createdAt ? new Date(j.createdAt).toLocaleString() : ''}
                    </div>
                    <div className="space-x-2">
                      {j.outputUrl ? (
                        <a className="underline" href={j.outputUrl} target="_blank" rel="noreferrer">Abrir</a>
                      ) : (
                        <span className="opacity-60">Sem URL</span>
                      )}
                      <button className="underline" onClick={() => openJobDetails(j.id)}>Detalhes</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 p-2 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Módulo: {TIMELINE_MODULES.find(m => m.id === studioState.activeModule)?.name}</span>
          <span>Zoom: {Math.round(studioState.zoom * 100)}%</span>
          <span>Duração: {Math.floor(studioState.duration / 60)}:{(studioState.duration % 60).toFixed(0).padStart(2, '0')}</span>
          <span>Itens Selecionados: {studioState.selectedItems.length}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>Auto-save: {autoSave ? 'ON' : 'OFF'}</span>
          <span>Qualidade: {studioState.previewQuality}</span>
          {studioState.renderInProgress && (
            <span className="text-yellow-400 flex items-center">
              <Activity className="w-3 h-3 mr-1 animate-spin" />
              Renderizando...
            </span>
          )}
        </div>
      </div>
    </div>

    {/* Modal Detalhes do Job */}
    {showJobModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={() => setShowJobModal(false)} />
        <div className="relative bg-gray-900 border border-gray-700 rounded-lg w-[640px] max-w-[95vw] max-h-[80vh] overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-semibold">Detalhes do Job</div>
            <Button size="sm" variant="outline" className="text-gray-300 border-gray-600" onClick={() => setShowJobModal(false)}>Fechar</Button>
          </div>
          {jobModalLoading && <div className="text-sm text-gray-400">Carregando...</div>}
          {!jobModalLoading && jobDetails && (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">ID</span>
                <span className="font-mono">{jobDetails.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status</span>
                <Badge variant={jobDetails.status === 'error' ? 'destructive' : 'default'}>{jobDetails.status} {typeof jobDetails.progress === 'number' ? `(${jobDetails.progress}%)` : ''}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Início</span>
                <span>{jobDetails.startedAt ? new Date(jobDetails.startedAt).toLocaleString() : '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Término</span>
                <span>{jobDetails.completedAt ? new Date(jobDetails.completedAt).toLocaleString() : '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Link</span>
                <span className="flex items-center space-x-2">
                  {jobDetails.outputUrl ? (
                    <a className="underline" href={jobDetails.outputUrl} target="_blank" rel="noreferrer">Abrir</a>
                  ) : (
                    <span className="opacity-60">Sem URL</span>
                  )}
                  {jobDetails.outputUrl && (
                    <Button size="sm" variant="outline" className="text-gray-300 border-gray-600" onClick={async () => { try { await navigator.clipboard.writeText(jobDetails.outputUrl); toast.success('Link copiado'); } catch { toast.error('Falha ao copiar'); } }}>Copiar</Button>
                  )}
                </span>
              </div>
              {jobDetails.metadata && (
                <>
                  <Separator className="bg-gray-700" />
                  <div className="font-semibold">Metadata</div>
                  <div className="grid grid-cols-2 gap-2">
                    {jobDetails.metadata.codec && <div><span className="text-gray-400">Codec: </span>{jobDetails.metadata.codec}</div>}
                    {typeof jobDetails.metadata.duration === 'number' && <div><span className="text-gray-400">Duração: </span>{Math.round(jobDetails.metadata.duration)}s</div>}
                    {typeof jobDetails.metadata.fps === 'number' && <div><span className="text-gray-400">FPS: </span>{jobDetails.metadata.fps}</div>}
                    {jobDetails.metadata.resolution && <div><span className="text-gray-400">Resolução: </span>{jobDetails.metadata.resolution}</div>}
                    {typeof jobDetails.metadata.bitrateKbps === 'number' && <div><span className="text-gray-400">Bitrate: </span>{jobDetails.metadata.bitrateKbps} kbps</div>}
                    {typeof jobDetails.metadata.sizeBytes === 'number' && <div><span className="text-gray-400">Tamanho: </span>{Math.max(1, Math.round(jobDetails.metadata.sizeBytes / (1024 * 1024)))} MB</div>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}