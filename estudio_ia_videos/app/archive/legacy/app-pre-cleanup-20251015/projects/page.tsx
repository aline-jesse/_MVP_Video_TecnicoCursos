
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Video, 
  Edit, 
  Film, 
  Download, 
  Trash2, 
  MoreVertical,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

type Project = {
  id: string;
  name: string;
  status: 'draft' | 'rendering' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  duration?: number;
  videoUrl?: string;
  timeline?: any;
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Carregar projetos
  useEffect(() => {
    loadProjects();
  }, []);

  // Filtrar projetos
  useEffect(() => {
    let filtered = projects;

    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchQuery, statusFilter]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast.error('Erro ao carregar projetos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Deseja realmente excluir este projeto?')) return;

    try {
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      toast.success('Projeto excluído');
      loadProjects();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir projeto');
    }
  };

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100"><Clock className="w-3 h-3 mr-1" /> Rascunho</Badge>;
      case 'rendering':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Renderizando</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Completo</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Falhou</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Meus Projetos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os seus projetos de vídeo
            </p>
          </div>
          <Button 
            size="lg"
            onClick={() => router.push('/studio')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Projeto
          </Button>
        </div>

        {/* Filtros e Busca */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar projetos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar: {statusFilter === 'all' ? 'Todos' : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('draft')}>
                Rascunhos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('rendering')}>
                Renderizando
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                Completos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Lista de Projetos */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground mb-6">
              {projects.length === 0 
                ? 'Comece criando seu primeiro projeto de vídeo'
                : 'Nenhum projeto corresponde aos filtros aplicados'
              }
            </p>
            {projects.length === 0 && (
              <Button onClick={() => router.push('/studio')}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Projeto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-100">
                {project.thumbnail ? (
                  <Image
                    src={project.thumbnail}
                    alt={project.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Video className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(project.status)}
                </div>
              </div>

              {/* Content */}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Atualizado {formatDate(project.updatedAt)}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/timeline-edit?projectId=${project.id}`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      {project.status === 'draft' && (
                        <DropdownMenuItem onClick={() => router.push(`/studio?projectId=${project.id}&step=render`)}>
                          <Film className="w-4 h-4 mr-2" />
                          Renderizar
                        </DropdownMenuItem>
                      )}
                      {project.videoUrl && (
                        <DropdownMenuItem onClick={() => window.open(project.videoUrl, '_blank')}>
                          <Download className="w-4 h-4 mr-2" />
                          Baixar Vídeo
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDelete(project.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/timeline-edit?projectId=${project.id}`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  {project.status === 'draft' && (
                    <Button
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => router.push(`/studio?projectId=${project.id}&step=render`)}
                    >
                      <Film className="w-4 h-4 mr-2" />
                      Renderizar
                    </Button>
                  )}
                  {project.videoUrl && (
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => window.open(project.videoUrl, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
