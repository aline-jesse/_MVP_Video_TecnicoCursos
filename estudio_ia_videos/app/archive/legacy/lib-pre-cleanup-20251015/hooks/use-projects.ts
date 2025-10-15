
/**
 * Hook para gerenciamento de projetos
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'draft' | 'rendering' | 'completed' | 'error';
  thumbnailUrl?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
  renderProgress?: number;
  videoUrl?: string;
}

interface UseProjectsOptions {
  status?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useProjects(options: UseProjectsOptions = {}) {
  const { data: session } = useSession() || {};
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.type) params.append('type', options.type);
      if (options.search) params.append('search', options.search);
      if (options.page) params.append('page', String(options.page));
      if (options.limit) params.append('limit', String(options.limit));

      const response = await fetch(`/api/projects?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar projetos');
      }

      const data = await response.json();
      setProjects(data.projects || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, options.status, options.type, options.search, options.page, options.limit]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar projeto');
      }

      await fetchProjects();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar');
      return false;
    }
  }, [fetchProjects]);

  const duplicateProject = useCallback(async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erro ao duplicar projeto');
      }

      await fetchProjects();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao duplicar');
      return false;
    }
  }, [fetchProjects]);

  return {
    projects,
    total,
    isLoading,
    error,
    fetchProjects,
    deleteProject,
    duplicateProject,
  };
}
