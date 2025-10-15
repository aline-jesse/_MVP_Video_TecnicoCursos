'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PPTXUploader } from '@/components/pptx/PPTXUploader';
import { ProjectManager } from '@/components/pptx/project-manager-simple';
import {
  Upload,
  Play,
  Download,
  Settings,
  Palette,
  Wand2,
  Video,
  Image,
  FileText,
  Layers,
  Zap,
  Sparkles,
  Crown,
  Star,
  Trophy,
  Rocket,
  Target,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  TrendingUp,
  Award,
  Shield,
  Globe,
  Cpu,
  Database,
  Cloud,
  Smartphone,
  Monitor,
  Headphones,
  Mic,
  Camera,
  Film,
  Music,
  Volume2,
  Eye,
  Heart,
  ThumbsUp,
  Share,
  Bookmark,
  Tag,
  Filter,
  Search,
  Grid,
  List,
  Layout,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Code,
  Quote,
  List as ListIcon,
  Hash,
  AtSign,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock as ClockIcon,
  DollarSign,
  CreditCard,
  ShoppingCart,
  Package,
  Truck,
  Gift,
  Coffee,
  Home,
  Building,
  Factory,
  School,
  Church,
  TreePine,
  Mountain,
  Waves,
  Sun,
  Moon,
  Star as StarIcon,
  Cloud as CloudIcon,
  Wind,
  Thermometer,
  Droplets,
  Flame,
  Zap as ZapIcon,
  Battery,
  Wifi,
  Bluetooth,
  Usb,
  HardDrive,
  Cpu as CpuIcon,
  MemoryStick,
  Monitor as MonitorIcon,
  Keyboard,
  Mouse,
  Printer,
  Camera as CameraIcon,
  Video as VideoIcon,
  Music as MusicIcon,
  Headphones as HeadphonesIcon,
  Mic as MicIcon,
  Volume2 as VolumeIcon,
  Speaker,
  Radio,
  Tv,
  Gamepad2,
  Puzzle,
  Trophy as TrophyIcon,
  Medal,
  Award as AwardIcon,
  Target as TargetIcon,
  Crosshair,
  Swords,
  Shield as ShieldIcon,
  Crown as CrownIcon,
  Gem,
  Diamond,
  Heart as HeartIcon,
  Sparkles as SparklesIcon,
  Flower,
  Leaf,
  TreePine as TreeIcon,
  Mountain as MountainIcon,
  Waves as WavesIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  features: string[];
  premium: boolean;
  rating: number;
  downloads: number;
  tags: string[];
}

interface Project {
  id: string;
  name: string;
  template: Template;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  duration: number;
  slides: number;
  pptxFile?: {
    id: string;
    name: string;
    size: number;
    uploadedAt: string;
  };
  processedData?: any;
  videoUrl?: string;
}

interface PPTXUploadResult {
  success: boolean;
  file?: {
    id: string;
    originalName: string;
    fileName: string;
    size: number;
    uploadedAt: string;
  };
  error?: string;
}

interface PPTXProcessResult {
  success: boolean;
  data?: any;
  error?: string;
}

export default function PPTXStudioEnhanced() {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [aiToolResults, setAiToolResults] = useState<any>({});

  // Templates avançados pré-definidos
  const templates: Template[] = [
    {
      id: 'corporate-professional',
      name: 'Corporate Professional',
      description: 'Template corporativo elegante com animações suaves e design profissional',
      category: 'Business',
      thumbnail: '/templates/corporate.jpg',
      features: ['Animações suaves', 'Paleta corporativa', 'Layout responsivo', 'IA integrada'],
      premium: false,
      rating: 4.8,
      downloads: 1250,
      tags: ['corporate', 'professional', 'business']
    },
    {
      id: 'creative-agency',
      name: 'Creative Agency',
      description: 'Template criativo para agências com efeitos visuais impressionantes',
      category: 'Creative',
      thumbnail: '/templates/creative.jpg',
      features: ['Efeitos 3D', 'Animações complexas', 'Tipografia avançada', 'Transições dinâmicas'],
      premium: true,
      rating: 4.9,
      downloads: 890,
      tags: ['creative', 'agency', 'design']
    },
    {
      id: 'educational-modern',
      name: 'Educational Modern',
      description: 'Template educacional moderno com foco em clareza e engajamento',
      category: 'Education',
      thumbnail: '/templates/education.jpg',
      features: ['Diagramas interativos', 'Animações pedagógicas', 'Layout clean', 'Acessibilidade'],
      premium: false,
      rating: 4.7,
      downloads: 2100,
      tags: ['education', 'modern', 'interactive']
    },
    {
      id: 'tech-startup',
      name: 'Tech Startup',
      description: 'Template para startups de tecnologia com design futurista',
      category: 'Technology',
      thumbnail: '/templates/tech.jpg',
      features: ['Design futurista', 'Animações rápidas', 'Elementos tech', 'Mobile-first'],
      premium: true,
      rating: 4.6,
      downloads: 1450,
      tags: ['tech', 'startup', 'futuristic']
    },
    {
      id: 'marketing-campaign',
      name: 'Marketing Campaign',
      description: 'Template para campanhas de marketing com alto impacto visual',
      category: 'Marketing',
      thumbnail: '/templates/marketing.jpg',
      features: ['Alto impacto', 'Call-to-actions', 'Social media ready', 'Analytics integrado'],
      premium: true,
      rating: 4.8,
      downloads: 980,
      tags: ['marketing', 'campaign', 'impact']
    },
    {
      id: 'product-launch',
      name: 'Product Launch',
      description: 'Template especial para lançamentos de produto com storytelling',
      category: 'Product',
      thumbnail: '/templates/product.jpg',
      features: ['Storytelling', 'Timeline interativo', 'Demo integrado', 'CTA otimizado'],
      premium: true,
      rating: 4.9,
      downloads: 670,
      tags: ['product', 'launch', 'storytelling']
    }
  ];

  // Upload de arquivo PPTX
  const handleFileUpload = useCallback(async (file: File): Promise<PPTXUploadResult> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/pptx/upload-functional', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro no upload');
      }

      setUploadProgress(100);
      return result;
    } catch (error: any) {
      console.error('Erro no upload:', error);
      return { success: false, error: error.message };
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Processamento do PPTX
  const handleFileProcess = useCallback(async (fileId: string, fileName: string): Promise<PPTXProcessResult> => {
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const response = await fetch('/api/pptx/process-functional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId, fileName }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro no processamento');
      }

      setProcessingProgress(100);
      return result;
    } catch (error: any) {
      console.error('Erro no processamento:', error);
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Ferramentas de IA funcionais
  const handleAIGenerateContent = useCallback(async (projectId: string): Promise<any> => {
    try {
      // Simulação de geração de conteúdo com IA
      const generatedContent = {
        title: 'Conteúdo Gerado por IA',
        description: 'Este conteúdo foi gerado automaticamente usando inteligência artificial baseada no seu PPTX.',
        keywords: ['automação', 'IA', 'conteúdo', 'geração'],
        suggestions: [
          'Adicione mais detalhes técnicos',
          'Inclua exemplos práticos',
          'Considere adicionar citações de especialistas'
        ]
      };

      setAiToolResults(prev => ({
        ...prev,
        [projectId]: {
          ...prev[projectId],
          content: generatedContent
        }
      }));

      return generatedContent;
    } catch (error) {
      console.error('Erro na geração de conteúdo:', error);
      throw error;
    }
  }, []);

  const handleAIGenerateImages = useCallback(async (projectId: string, prompt: string) => {
    try {
      // Simulação de geração de imagens
      const generatedImages = [
        { id: 'img1', url: '/generated/image1.jpg', alt: 'Imagem gerada 1' },
        { id: 'img2', url: '/generated/image2.jpg', alt: 'Imagem gerada 2' },
        { id: 'img3', url: '/generated/image3.jpg', alt: 'Imagem gerada 3' }
      ];

      setAiToolResults(prev => ({
        ...prev,
        [projectId]: {
          ...prev[projectId],
          images: generatedImages
        }
      }));

      return generatedImages;
    } catch (error) {
      console.error('Erro na geração de imagens:', error);
      throw error;
    }
  }, []);

  const handleAIGenerateAudio = useCallback(async (projectId: string, text: string) => {
    try {
      // Simulação de geração de áudio
      const audioUrl = '/generated/audio.mp3';

      setAiToolResults(prev => ({
        ...prev,
        [projectId]: {
          ...prev[projectId],
          audio: { url: audioUrl, duration: 45 }
        }
      }));

      return { url: audioUrl, duration: 45 };
    } catch (error) {
      console.error('Erro na geração de áudio:', error);
      throw error;
    }
  }, []);

  const handleVideoExport = useCallback(async (projectId: string) => {
    try {
      // Simulação de export de vídeo
      const videoUrl = '/exports/video.mp4';

      setProjects(prev => prev.map(p =>
        p.id === projectId
          ? { ...p, status: 'completed', videoUrl, progress: 100 }
          : p
      ));

      return videoUrl;
    } catch (error) {
      console.error('Erro no export de vídeo:', error);
      throw error;
    }
  }, []);

  const handleCreateProject = useCallback(async (template: Template) => {
    setIsCreating(true);
    try {
      const newProject: Project = {
        id: `project_${Date.now()}`,
        name: `${template.name} Project`,
        template,
        status: 'draft',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        duration: 0,
        slides: 0
      };

      setProjects(prev => [newProject, ...prev]);
      setSelectedTemplate(template);
      setActiveTab('projects');
    } finally {
      setIsCreating(false);
    }
  }, []);

  // Upload completo (upload + processamento)
  const handleCompleteUpload = useCallback(async (projectId: string, file: File) => {
    try {
      // 1. Upload do arquivo
      const uploadResult = await handleFileUpload(file);
      if (!uploadResult.success || !uploadResult.file) {
        throw new Error(uploadResult.error || 'Falha no upload');
      }

      // 2. Atualizar projeto com arquivo
      setProjects(prev => prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              pptxFile: {
                id: uploadResult.file!.id,
                name: uploadResult.file!.originalName,
                size: uploadResult.file!.size,
                uploadedAt: uploadResult.file!.uploadedAt
              },
              status: 'processing',
              progress: 25
            }
          : p
      ));

      // 3. Processar arquivo
      const processResult = await handleFileProcess(uploadResult.file.id, uploadResult.file.fileName);
      if (!processResult.success || !processResult.data) {
        throw new Error(processResult.error || 'Falha no processamento');
      }

      // 4. Atualizar projeto com dados processados
      setProjects(prev => prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              processedData: processResult.data,
              slides: processResult.data.slides?.length || 0,
              duration: processResult.data.document?.totalDuration || 0,
              status: 'completed',
              progress: 100,
              updatedAt: new Date()
            }
          : p
      ));

    } catch (error: any) {
      console.error('Erro no upload completo:', error);
      setProjects(prev => prev.map(p =>
        p.id === projectId
          ? { ...p, status: 'failed', progress: 0 }
          : p
      ));
    }
  }, [handleFileUpload, handleFileProcess]);

  const TemplateCard = ({ template }: { template: Template }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
      <CardContent className="p-0">
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
            <Layout className="h-12 w-12 text-gray-400" />
          </div>
          {template.premium && (
            <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg">{template.name}</h3>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">{template.rating}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>

          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{template.downloads} downloads</span>
            <Button
              size="sm"
              onClick={() => handleCreateProject(template)}
              disabled={isCreating}
              className="gap-2"
            >
              <Wand2 className="h-4 w-4" />
              Usar Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold">{project.name}</h3>
            <p className="text-sm text-gray-600">{project.template.name}</p>
          </div>
          <Badge variant={
            project.status === 'completed' ? 'default' :
            project.status === 'processing' ? 'secondary' :
            project.status === 'failed' ? 'destructive' : 'outline'
          }>
            {project.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
            {project.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
            {project.status}
          </Badge>
        </div>

        {project.status === 'processing' && (
          <div className="mb-3">
            <Progress value={project.progress} className="h-2" />
            <p className="text-xs text-gray-600 mt-1">{project.progress}% concluído</p>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{project.slides} slides</span>
          <span>{project.duration}s</span>
        </div>

        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          <Button size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PPTX Studio Enhanced
              </h1>
              <p className="text-gray-600">Templates avançados para apresentações profissionais</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span>+1000 Templates</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>50k+ Usuários</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span>IA Integrada</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="templates" className="gap-2">
              <Layout className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <FileText className="h-4 w-4" />
              Projetos
            </TabsTrigger>
            <TabsTrigger value="ai-tools" className="gap-2">
              <Wand2 className="h-4 w-4" />
              IA Tools
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['All', 'Business', 'Creative', 'Education', 'Technology', 'Marketing', 'Product'].map(category => (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            {projects.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum projeto ainda</h3>
                  <p className="text-gray-600 mb-4">Comece criando um projeto a partir de um template</p>
                  <Button onClick={() => setActiveTab('templates')}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Explorar Templates
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai-tools" className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-500" />
                  Upload e Processamento PPTX
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <PPTXUploader
                    onFileSelect={async (file) => {
                      if (selectedProject) {
                        await handleCompleteUpload(selectedProject.id, file);
                      }
                    }}
                    isUploading={isUploading}
                    progress={uploadProgress}
                  />

                  {isUploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-sm text-gray-600">Fazendo upload do arquivo...</p>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress value={processingProgress} className="h-2" />
                      <p className="text-sm text-gray-600">Processando PPTX...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-purple-500" />
                    Geração de Conteúdo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Gere conteúdo automaticamente baseado no seu PPTX usando IA avançada
                  </p>
                  <div className="space-y-3">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um projeto" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.filter(p => p.status === 'completed').map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      className="w-full"
                      onClick={async () => {
                        if (selectedProject) {
                          const result = await handleAIGenerateContent(selectedProject.id);
                          alert(`Conteúdo gerado: ${result.title}`);
                        }
                      }}
                      disabled={!selectedProject}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Gerar Conteúdo
                    </Button>
                  </div>

                  {selectedProject && aiToolResults[selectedProject.id]?.content && (
                    <Alert className="mt-4">
                      <Sparkles className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{aiToolResults[selectedProject.id].content.title}</strong>
                        <br />
                        {aiToolResults[selectedProject.id].content.description}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-blue-500" />
                    Geração de Imagens
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Crie imagens personalizadas para seus slides com IA
                  </p>
                  <div className="space-y-3">
                    <Input placeholder="Descreva a imagem desejada..." />
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={async () => {
                        if (selectedProject) {
                          const images = await handleAIGenerateImages(selectedProject.id, 'prompt');
                          alert(`${images.length} imagens geradas com sucesso!`);
                        }
                      }}
                      disabled={!selectedProject}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Gerar Imagens
                    </Button>
                  </div>

                  {selectedProject && aiToolResults[selectedProject.id]?.images && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {aiToolResults[selectedProject.id].images.map((img: any) => (
                        <div key={img.id} className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                          <Image className="h-6 w-6 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-green-500" />
                    Narração Automática
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Converta texto em narração natural com vozes realistas
                  </p>
                  <div className="space-y-3">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione voz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female-pt">Feminina (Português)</SelectItem>
                        <SelectItem value="male-pt">Masculina (Português)</SelectItem>
                        <SelectItem value="female-en">Feminina (Inglês)</SelectItem>
                        <SelectItem value="male-en">Masculina (Inglês)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={async () => {
                        if (selectedProject) {
                          const audio = await handleAIGenerateAudio(selectedProject.id, 'texto do slide');
                          alert(`Áudio gerado: ${audio.duration} segundos`);
                        }
                      }}
                      disabled={!selectedProject}
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Gerar Áudio
                    </Button>
                  </div>

                  {selectedProject && aiToolResults[selectedProject.id]?.audio && (
                    <Alert className="mt-4">
                      <Volume2 className="h-4 w-4" />
                      <AlertDescription>
                        Áudio gerado com sucesso! Duração: {aiToolResults[selectedProject.id].audio.duration}s
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-red-500" />
                    Edição de Vídeo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Edite vídeos automaticamente com cortes inteligentes
                  </p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Resolução" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="720p">720p</SelectItem>
                          <SelectItem value="1080p">1080p</SelectItem>
                          <SelectItem value="4k">4K</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Formato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp4">MP4</SelectItem>
                          <SelectItem value="webm">WebM</SelectItem>
                          <SelectItem value="mov">MOV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={async () => {
                        if (selectedProject) {
                          const videoUrl = await handleVideoExport(selectedProject.id);
                          alert(`Vídeo exportado com sucesso: ${videoUrl}`);
                        }
                      }}
                      disabled={!selectedProject}
                    >
                      <Film className="h-4 w-4 mr-2" />
                      Exportar Vídeo
                    </Button>
                  </div>

                  {selectedProject && selectedProject.videoUrl && (
                    <Alert className="mt-4">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Vídeo exportado com sucesso! URL: {selectedProject.videoUrl}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Project Manager Integration */}
            {selectedProject && (
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciamento do Projeto</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectManager
                    project={selectedProject.processedData ? {
                      id: selectedProject.id,
                      name: selectedProject.name,
                      status: selectedProject.status,
                      fileName: selectedProject.pptxFile?.name,
                      totalSlides: selectedProject.slides,
                      createdAt: selectedProject.createdAt.toISOString(),
                      updatedAt: selectedProject.updatedAt.toISOString(),
                      stats: {
                        totalDuration: selectedProject.duration,
                        imagesExtracted: selectedProject.processedData?.statistics?.totalImages || 0,
                        autoNarration: false,
                        processingCompletedAt: selectedProject.updatedAt.toISOString()
                      },
                      slides: selectedProject.processedData?.slides?.map((slide: any, index: number) => ({
                        id: slide.id,
                        slideNumber: index + 1,
                        title: slide.title,
                        content: slide.content,
                        duration: slide.duration
                      })) || []
                    } : null}
                    isLoading={selectedProject.status === 'processing'}
                    onRefresh={() => {
                      // Refresh logic
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Projetos Criados</p>
                      <p className="text-2xl font-bold">{projects.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Templates Usados</p>
                      <p className="text-2xl font-bold">{new Set(projects.map(p => p.template.id)).size}</p>
                    </div>
                    <Layout className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tempo Economizado</p>
                      <p className="text-2xl font-bold">24h</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance dos Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {templates.slice(0, 5).map(template => (
                    <div key={template.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded flex items-center justify-center">
                          <Layout className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-gray-600">{template.downloads} downloads</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{template.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
