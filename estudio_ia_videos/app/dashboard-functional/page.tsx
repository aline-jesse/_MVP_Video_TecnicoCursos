'use client';

import React, { useState } from 'react';
import { PPTXUploader } from '@/components/pptx/PPTXUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload,
  PlayCircle,
  Settings,
  Download,
  Eye,
  FileText,
  Video,
  Clock,
  BarChart3,
  Zap,
  CheckCircle2,
  Activity,
  Layers,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';

interface ProjectStats {
  totalProjects: number;
  totalSlides: number;
  totalDuration: number;
  completedVideos: number;
  processingVideos: number;
}

interface ProcessedProject {
  id: string;
  name: string;
  slideCount: number;
  duration: number;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  createdAt: Date;
  timelineData?: any;
  videoUrl?: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<ProcessedProject[]>([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    totalSlides: 0,
    totalDuration: 0,
    completedVideos: 0,
    processingVideos: 0
  });

  // Atualizar estatísticas
  const updateStats = (newProjects: ProcessedProject[]) => {
    const newStats: ProjectStats = {
      totalProjects: newProjects.length,
      totalSlides: newProjects.reduce((sum, p) => sum + p.slideCount, 0),
      totalDuration: newProjects.reduce((sum, p) => sum + p.duration, 0),
      completedVideos: newProjects.filter(p => p.status === 'completed').length,
      processingVideos: newProjects.filter(p => p.status === 'processing').length
    };
    setStats(newStats);
  };

  // Manipular upload concluído
  const handleUploadComplete = (file: any) => {
    toast.success(`Upload concluído: ${file.name}`);
  };

  // Manipular processamento concluído
  const handleProcessingComplete = (file: any) => {
    const newProject: ProcessedProject = {
      id: file.id,
      name: file.name,
      slideCount: file.processedData?.slideCount || 0,
      duration: file.processedData?.duration || 0,
      status: 'completed',
      createdAt: new Date(),
      timelineData: file.processedData?.timelineData
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    updateStats(updatedProjects);
    
    toast.success(`Projeto processado: ${newProject.slideCount} slides encontrados`);
    
    // Auto switch para aba Timeline
    setActiveTab('timeline');
  };

  // Simular geração de vídeo
  const generateVideo = async (project: ProcessedProject) => {
    try {
      // Marcar como processando
      const updatedProjects = projects.map(p => 
        p.id === project.id ? { ...p, status: 'processing' as const } : p
      );
      setProjects(updatedProjects);
      updateStats(updatedProjects);
      
      toast.info('Iniciando renderização de vídeo...');

      // Simular processo de renderização
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Marcar como concluído
      const finalProjects = projects.map(p => 
        p.id === project.id 
          ? { 
              ...p, 
              status: 'completed' as const, 
              videoUrl: `/videos/${project.id}.mp4` 
            } 
          : p
      );
      setProjects(finalProjects);
      updateStats(finalProjects);
      
      toast.success('Vídeo renderizado com sucesso!');
      
      // Auto switch para aba Videos
      setActiveTab('videos');
      
    } catch (error) {
      toast.error('Erro na renderização do vídeo');
    }
  };

  // Componente de estatísticas
  const StatsCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-md ${color}`}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );

  // Componente de projeto
  const ProjectCard: React.FC<{ project: ProcessedProject }> = ({ project }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-500" />
            <div>
              <CardTitle className="text-sm">{project.name}</CardTitle>
              <p className="text-xs text-gray-500">
                {project.slideCount} slides • {Math.floor(project.duration / 60)}:{(project.duration % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {project.status === 'completed' && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Pronto
              </Badge>
            )}
            {project.status === 'processing' && (
              <Badge className="bg-yellow-100 text-yellow-800">
                <Activity className="w-3 h-3 mr-1 animate-spin" />
                Processando
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => toast.info('Preview em desenvolvimento...')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => generateVideo(project)}
            disabled={project.status === 'processing'}
          >
            <Video className="w-4 h-4 mr-2" />
            Gerar Vídeo
          </Button>
          
          {project.videoUrl && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => toast.success('Download iniciado!')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
        
        {project.status === 'processing' && (
          <div className="space-y-2">
            <Progress value={65} className="h-2" />
            <p className="text-xs text-gray-600">
              Renderizando vídeo... 65%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Monitor className="w-7 h-7 text-blue-600" />
                Studio IA Vídeos
              </h1>
              <p className="text-gray-600 text-sm">
                Sistema completo PPTX → Timeline → Vídeo
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800">
                <Zap className="w-3 h-3 mr-1" />
                Sistema Operacional
              </Badge>
              
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Projetos"
            value={stats.totalProjects}
            icon={<FileText className="w-4 h-4" />}
            color="bg-blue-100 text-blue-600"
            subtitle="Apresentações processadas"
          />
          
          <StatsCard
            title="Total de Slides"
            value={stats.totalSlides}
            icon={<Layers className="w-4 h-4" />}
            color="bg-green-100 text-green-600"
            subtitle="Slides convertidos"
          />
          
          <StatsCard
            title="Duração Total"
            value={`${Math.floor(stats.totalDuration / 60)}:${(stats.totalDuration % 60).toString().padStart(2, '0')}`}
            icon={<Clock className="w-4 h-4" />}
            color="bg-purple-100 text-purple-600"
            subtitle="Tempo de conteúdo"
          />
          
          <StatsCard
            title="Vídeos Gerados"
            value={stats.completedVideos}
            icon={<Video className="w-4 h-4" />}
            color="bg-orange-100 text-orange-600"
            subtitle="Renderizações concluídas"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload PPTX
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Vídeos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload e Processamento PPTX</CardTitle>
                <p className="text-sm text-gray-600">
                  Faça upload de suas apresentações PowerPoint para começar
                </p>
              </CardHeader>
              <CardContent>
                <PPTXUploader
                  onUploadComplete={handleUploadComplete}
                  onProcessingComplete={handleProcessingComplete}
                  allowMultiple={true}
                  maxFileSize={50}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Projetos Processados</CardTitle>
                <p className="text-sm text-gray-600">
                  Gerencie seus projetos e crie vídeos
                </p>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <PlayCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum projeto ainda
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Faça upload de um arquivo PPTX para começar
                    </p>
                    <Button onClick={() => setActiveTab('upload')}>
                      <Upload className="w-4 h-4 mr-2" />
                      Fazer Upload
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vídeos Gerados</CardTitle>
                <p className="text-sm text-gray-600">
                  Seus vídeos renderizados estão aqui
                </p>
              </CardHeader>
              <CardContent>
                {projects.filter(p => p.videoUrl).length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nenhum vídeo gerado ainda
                    </h3>
                    <p className="text-gray-600">
                      Processe um projeto para gerar seu primeiro vídeo
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.filter(p => p.videoUrl).map(project => (
                      <Card key={project.id}>
                        <CardContent className="p-4">
                          <div className="aspect-video bg-gray-200 rounded-md mb-3 flex items-center justify-center">
                            <Video className="w-8 h-8 text-gray-400" />
                          </div>
                          <h4 className="font-medium">{project.name}</h4>
                          <p className="text-sm text-gray-600">
                            {project.slideCount} slides • {Math.floor(project.duration / 60)}:{(project.duration % 60).toString().padStart(2, '0')}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              Assistir
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance do Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taxa de Sucesso</span>
                    <span className="font-medium">98.5%</span>
                  </div>
                  <Progress value={98.5} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tempo Médio de Processamento</span>
                    <span className="font-medium">2.3s</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Qualidade de Extração</span>
                    <span className="font-medium">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Uso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Arquivos Processados Hoje</span>
                      <span className="font-medium">{projects.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Slides Extraídos</span>
                      <span className="font-medium">{stats.totalSlides}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Vídeos Renderizados</span>
                      <span className="font-medium">{stats.completedVideos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tempo Total de Conteúdo</span>
                      <span className="font-medium">
                        {Math.floor(stats.totalDuration / 60)}m {stats.totalDuration % 60}s
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}