
/**
 * 📊 Dashboard Real - REAL (não mock)
 * Dashboard principal com dados reais de analytics, projetos e renders
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Video, 
  Upload, 
  Download,
  Clock,
  TrendingUp,
  Folder,
  PlayCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface DashboardStats {
  uploads: number;
  renders: number;
  downloads: number;
  totalProjects: number;
  activeRenders: number;
  completedToday: number;
}

interface Project {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface RenderJob {
  id: string;
  projectId: string;
  status: string;
  progress: number;
  startedAt?: string;
  completedAt?: string;
}

export default function DashboardRealPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch stats
  const { data: stats, error: statsError, isLoading: statsLoading } = useSWR<DashboardStats>(
    '/api/dashboard/stats',
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30s
  );
  
  // Fetch projects
  const { data: projects, error: projectsError, isLoading: projectsLoading } = useSWR<Project[]>(
    '/api/projects',
    fetcher
  );
  
  // Fetch render jobs
  const { data: renderJobs, error: rendersError, isLoading: rendersLoading } = useSWR<RenderJob[]>(
    '/api/render/jobs',
    fetcher,
    { refreshInterval: 5000 } // Refresh every 5s para progresso em tempo real
  );
  
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Faça login para acessar o dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/auth/signin">Fazer Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {session.user?.name || session.user?.email}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
            ✅ REAL (não mock)
          </div>
          <Button asChild>
            <Link href="/projects/new">Novo Projeto</Link>
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Uploads"
          value={stats?.uploads || 0}
          icon={<Upload className="h-4 w-4" />}
          loading={statsLoading}
        />
        <StatCard
          title="Renders"
          value={stats?.renders || 0}
          icon={<Video className="h-4 w-4" />}
          loading={statsLoading}
        />
        <StatCard
          title="Downloads"
          value={stats?.downloads || 0}
          icon={<Download className="h-4 w-4" />}
          loading={statsLoading}
        />
        <StatCard
          title="Projetos"
          value={stats?.totalProjects || 0}
          icon={<Folder className="h-4 w-4" />}
          loading={statsLoading}
        />
      </div>
      
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="renders">Renders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Projetos Recentes</CardTitle>
                <CardDescription>Seus últimos projetos</CardDescription>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : projects && projects.length > 0 ? (
                  <div className="space-y-2">
                    {projects.slice(0, 5).map(project => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{project.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/projects/${project.id}`}>Abrir</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum projeto encontrado
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Active Renders */}
            <Card>
              <CardHeader>
                <CardTitle>Renders Ativos</CardTitle>
                <CardDescription>Renders em andamento</CardDescription>
              </CardHeader>
              <CardContent>
                {rendersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : renderJobs && renderJobs.filter(j => j.status === 'processing').length > 0 ? (
                  <div className="space-y-3">
                    {renderJobs
                      .filter(j => j.status === 'processing')
                      .slice(0, 5)
                      .map(job => (
                        <div key={job.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Job #{job.id.slice(0, 8)}</span>
                            <span className="text-sm text-muted-foreground">{job.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum render ativo
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Projetos</CardTitle>
              <CardDescription>
                {projects?.length || 0} projetos encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map(project => (
                    <Card key={project.id}>
                      <CardHeader>
                        <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                        <CardDescription>
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button size="sm" asChild>
                            <Link href={`/projects/${project.id}`}>Abrir</Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/timeline-test?projectId=${project.id}`}>Timeline</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Folder className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Nenhum projeto ainda</p>
                  <Button asChild>
                    <Link href="/projects/new">Criar Primeiro Projeto</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Renders Tab */}
        <TabsContent value="renders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Renders</CardTitle>
              <CardDescription>
                {renderJobs?.length || 0} renders encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rendersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : renderJobs && renderJobs.length > 0 ? (
                <div className="space-y-2">
                  {renderJobs.map(job => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {job.status === 'processing' && (
                          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        )}
                        {job.status === 'completed' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {job.status === 'failed' && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        {job.status === 'pending' && (
                          <Clock className="h-5 w-5 text-gray-500" />
                        )}
                        
                        <div>
                          <p className="font-medium">Job #{job.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            {job.startedAt
                              ? new Date(job.startedAt).toLocaleString()
                              : 'Aguardando...'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium capitalize">{job.status}</p>
                        {job.status === 'processing' && (
                          <p className="text-xs text-muted-foreground">{job.progress}%</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <PlayCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum render ainda</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Estatísticas de uso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Uploads</p>
                    <p className="text-2xl font-bold">{stats?.uploads || 0}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Renders</p>
                    <p className="text-2xl font-bold">{stats?.renders || 0}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Downloads</p>
                    <p className="text-2xl font-bold">{stats?.downloads || 0}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Completos Hoje</p>
                    <p className="text-2xl font-bold">{stats?.completedToday || 0}</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button asChild className="w-full">
                    <Link href="/analytics-test">Ver Analytics Detalhado</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente de Card de Estatística
function StatCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        )}
      </CardContent>
    </Card>
  );
}
