
import { useState, useEffect } from 'react';
import { AnalyticsTracker } from '@/lib/analytics-tracker';

/**
 * ✅ HOOK DE COLABORAÇÃO REAL - Sprint 43
 * Gerenciamento de comentários e versões com APIs reais
 */

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    email?: string;
    avatar: string;
    role?: string;
  };
  timestamp: string;
  status: 'pending' | 'resolved';
  replies: Comment[];
  reactions: any[];
  mentions: string[];
  isPrivate: boolean;
  position?: { x: number; y: number; elementId?: string };
}

export interface ProjectVersion {
  id: string;
  name: string;
  description?: string;
  versionNumber: number;
  author: {
    id: string;
    name: string;
    email?: string;
    avatar: string;
  };
  timestamp: string;
  isCurrent: boolean;
  isActive: boolean;
  fileSize?: number;
  projectData?: any;
  canvasData?: any;
  settings?: any;
}

export function useCollaboration(projectId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar comentários
  const loadComments = async () => {
    try {
      const response = await fetch(`/api/collaboration/comments?projectId=${projectId}`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.comments || []);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar comentários:', err);
      setError('Erro ao carregar comentários');
    }
  };

  // Carregar versões
  const loadVersions = async () => {
    try {
      const response = await fetch(`/api/collaboration/versions?projectId=${projectId}`);
      const data = await response.json();
      
      if (data.success) {
        setVersions(data.versions || []);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar versões:', err);
      setError('Erro ao carregar versões');
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadComments(), loadVersions()]);
      setIsLoading(false);
    };

    if (projectId) {
      loadData();
    }
  }, [projectId]);

  // Adicionar comentário
  const addComment = async (content: string, position?: { x: number; y: number; elementId?: string }) => {
    try {
      const response = await fetch('/api/collaboration/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, content, position })
      });

      const data = await response.json();

      if (data.success) {
        setComments(prev => [data.comment, ...prev]);
        await AnalyticsTracker.trackCollaboration('add_comment', projectId);
        return data.comment;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('❌ Erro ao adicionar comentário:', err);
      throw err;
    }
  };

  // Responder comentário
  const replyComment = async (parentId: string, content: string) => {
    try {
      const response = await fetch('/api/collaboration/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, content, parentId })
      });

      const data = await response.json();

      if (data.success) {
        // Atualizar comentários com a resposta
        await loadComments();
        await AnalyticsTracker.trackCollaboration('reply_comment', projectId);
        return data.comment;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('❌ Erro ao responder comentário:', err);
      throw err;
    }
  };

  // Resolver comentário
  const resolveComment = async (commentId: string) => {
    try {
      const response = await fetch('/api/collaboration/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, action: 'resolve' })
      });

      const data = await response.json();

      if (data.success) {
        setComments(prev => 
          prev.map(c => c.id === commentId ? { ...c, status: 'resolved' as const } : c)
        );
        await AnalyticsTracker.trackCollaboration('resolve_comment', projectId);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('❌ Erro ao resolver comentário:', err);
      throw err;
    }
  };

  // Criar nova versão
  const createVersion = async (name: string, description?: string, projectData?: any) => {
    try {
      const response = await fetch('/api/collaboration/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, name, description, projectData })
      });

      const data = await response.json();

      if (data.success) {
        setVersions(prev => [data.version, ...prev]);
        await AnalyticsTracker.trackCollaboration('create_version', projectId);
        return data.version;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('❌ Erro ao criar versão:', err);
      throw err;
    }
  };

  // Restaurar versão
  const restoreVersion = async (versionId: string) => {
    try {
      const response = await fetch('/api/collaboration/versions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId, action: 'restore' })
      });

      const data = await response.json();

      if (data.success) {
        await loadVersions();
        await AnalyticsTracker.trackCollaboration('restore_version', projectId);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('❌ Erro ao restaurar versão:', err);
      throw err;
    }
  };

  return {
    comments,
    versions,
    isLoading,
    error,
    actions: {
      addComment,
      replyComment,
      resolveComment,
      createVersion,
      restoreVersion,
      refresh: async () => {
        await Promise.all([loadComments(), loadVersions()]);
      }
    }
  };
}
