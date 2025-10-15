
"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, MessageCircle, Share2, Clock, Eye, UserPlus, Settings,
  Send, Reply, Heart, Bookmark, MoreHorizontal, Filter, Search
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface Comment {
  id: string
  author: {
    name: string
    avatar: string
    role: string
  }
  content: string
  timestamp: string
  likes: number
  replies: Comment[]
  isResolved?: boolean
}

interface Project {
  id: string
  name: string
  description: string
  status: 'draft' | 'review' | 'approved' | 'published'
  collaborators: Array<{
    name: string
    avatar: string
    role: string
    lastActivity: string
  }>
  comments: Comment[]
  shares: number
  views: number
  lastModified: string
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Treinamento NR-12 - Prensas Hidráulicas',
    description: 'Template de treinamento para operação segura de prensas hidráulicas',
    status: 'review',
    collaborators: [
      {
        name: 'Maria Santos',
        avatar: '/avatars/maria.jpg',
        role: 'Coordenadora de Segurança',
        lastActivity: '2025-09-25T10:30:00Z'
      },
      {
        name: 'João Silva',
        avatar: '/avatars/joao.jpg', 
        role: 'Designer Instrucional',
        lastActivity: '2025-09-25T09:15:00Z'
      },
      {
        name: 'Ana Costa',
        avatar: '/avatars/ana.jpg',
        role: 'Especialista NR',
        lastActivity: '2025-09-25T08:45:00Z'
      }
    ],
    comments: [
      {
        id: '1',
        author: {
          name: 'Maria Santos',
          avatar: '/avatars/maria.jpg',
          role: 'Coordenadora'
        },
        content: 'Excelente trabalho no conteúdo do slide 5! Apenas sugiro adicionar mais informações sobre os dispositivos de segurança específicos para prensas.',
        timestamp: '2025-09-25T09:30:00Z',
        likes: 3,
        replies: [
          {
            id: '2',
            author: {
              name: 'João Silva',
              avatar: '/avatars/joao.jpg',
              role: 'Designer'
            },
            content: 'Obrigado pelo feedback! Vou adicionar uma seção específica sobre sensores de presença e cortinas de luz.',
            timestamp: '2025-09-25T10:15:00Z',
            likes: 1,
            replies: []
          }
        ]
      },
      {
        id: '3',
        author: {
          name: 'Ana Costa',
          avatar: '/avatars/ana.jpg',
          role: 'Especialista'
        },
        content: 'O compliance está em 96%. Para chegar aos 100%, precisamos incluir as atualizações mais recentes da NR-12 de 2024.',
        timestamp: '2025-09-25T08:20:00Z',
        likes: 2,
        replies: [],
        isResolved: false
      }
    ],
    shares: 12,
    views: 245,
    lastModified: '2025-09-25T10:30:00Z'
  }
]

export default function TeamCollaborationHub() {
  const [projects] = useState<Project[]>(mockProjects)
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: 'Você',
        avatar: '/avatars/user.jpg',
        role: 'Colaborador'
      },
      content: newComment,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: []
    }

    setSelectedProject(prev => ({
      ...prev,
      comments: [...prev.comments, comment]
    }))

    setNewComment('')
    toast.success('Comentário adicionado com sucesso!')
  }

  const handleAddReply = (commentId: string) => {
    if (!replyContent.trim()) return

    const reply: Comment = {
      id: Date.now().toString(),
      author: {
        name: 'Você',
        avatar: '/avatars/user.jpg',
        role: 'Colaborador'
      },
      content: replyContent,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: []
    }

    setSelectedProject(prev => ({
      ...prev,
      comments: prev.comments.map(comment =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      )
    }))

    setReplyContent('')
    setReplyingTo(null)
    toast.success('Resposta adicionada!')
  }

  const handleLikeComment = (commentId: string, isReply: boolean = false, parentId?: string) => {
    setSelectedProject(prev => ({
      ...prev,
      comments: prev.comments.map(comment => {
        if (isReply && comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === commentId
                ? { ...reply, likes: reply.likes + 1 }
                : reply
            )
          }
        } else if (!isReply && comment.id === commentId) {
          return { ...comment, likes: comment.likes + 1 }
        }
        return comment
      })
    }))
    toast.success('👍 Curtido!')
  }

  const handleShareProject = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copiado para a área de transferência!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      case 'review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'published': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho'
      case 'review': return 'Em Revisão'  
      case 'approved': return 'Aprovado'
      case 'published': return 'Publicado'
      default: return 'Desconhecido'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <Users className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Hub de Colaboração
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-3xl mx-auto">
            Trabalhe em equipe de forma eficiente com comentários em tempo real, compartilhamento e gestão colaborativa de projetos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Projects Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Projetos
                </CardTitle>
                <CardDescription>
                  Selecione um projeto para colaborar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input placeholder="Buscar projetos..." className="pl-10" />
                </div>

                {/* Project List */}
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border-2 ${
                        selectedProject.id === project.id 
                          ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800' 
                          : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700'
                      }`}
                    >
                      <h3 className="font-medium text-sm">{project.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {project.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <MessageCircle className="w-3 h-3" />
                          {project.comments.length}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="w-full gap-2" variant="outline">
                  <UserPlus className="w-4 h-4" />
                  Novo Projeto
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Collaboration Area */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Project Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{selectedProject.name}</CardTitle>
                    <CardDescription>{selectedProject.description}</CardDescription>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {selectedProject.views} visualizações
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        {selectedProject.shares} compartilhamentos
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Modificado {formatDistanceToNow(new Date(selectedProject.lastModified), { locale: ptBR, addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedProject.status)}>
                      {getStatusText(selectedProject.status)}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={handleShareProject}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Collaboration Tabs */}
            <Tabs defaultValue="comments" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comments">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Comentários ({selectedProject.comments.length})
                </TabsTrigger>
                <TabsTrigger value="team">
                  <Users className="w-4 h-4 mr-2" />
                  Equipe ({selectedProject.collaborators.length})
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Clock className="w-4 h-4 mr-2" />
                  Atividades
                </TabsTrigger>
              </TabsList>

              {/* Comments Tab */}
              <TabsContent value="comments" className="space-y-6">
                
                {/* Add Comment */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src="/avatars/user.jpg" />
                        <AvatarFallback>VC</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-4">
                        <Textarea
                          placeholder="Adicione um comentário, sugestão ou feedback..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-20 resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Bookmark className="w-4 h-4" />
                            Comentários são salvos automaticamente
                          </div>
                          <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                            <Send className="w-4 h-4 mr-2" />
                            Comentar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments List */}
                <div className="space-y-4">
                  {selectedProject.comments.map((comment) => (
                    <Card key={comment.id} className={comment.isResolved === false ? 'border-orange-200 dark:border-orange-800' : ''}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={comment.author.avatar} />
                            <AvatarFallback>{comment.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-3">
                            {/* Comment Header */}
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{comment.author.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {comment.author.role}
                              </Badge>
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                {formatDistanceToNow(new Date(comment.timestamp), { locale: ptBR, addSuffix: true })}
                              </span>
                              {comment.isResolved === false && (
                                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 text-xs">
                                  Pendente
                                </Badge>
                              )}
                            </div>
                            
                            {/* Comment Content */}
                            <p className="text-slate-700 dark:text-slate-300">{comment.content}</p>
                            
                            {/* Comment Actions */}
                            <div className="flex items-center gap-4">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleLikeComment(comment.id)}
                                className="gap-1 text-slate-500 dark:text-slate-400 hover:text-red-500"
                              >
                                <Heart className="w-4 h-4" />
                                {comment.likes > 0 && comment.likes}
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setReplyingTo(comment.id)}
                                className="gap-1 text-slate-500 dark:text-slate-400"
                              >
                                <Reply className="w-4 h-4" />
                                Responder
                              </Button>
                            </div>

                            {/* Reply Form */}
                            {replyingTo === comment.id && (
                              <div className="mt-4 flex items-start gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src="/avatars/user.jpg" />
                                  <AvatarFallback>VC</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-3">
                                  <Textarea
                                    placeholder="Escreva sua resposta..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    className="min-h-16 resize-none"
                                  />
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleAddReply(comment.id)}
                                      disabled={!replyContent.trim()}
                                    >
                                      <Send className="w-4 h-4 mr-1" />
                                      Responder
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        setReplyingTo(null)
                                        setReplyContent('')
                                      }}
                                    >
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Replies */}
                            {comment.replies.length > 0 && (
                              <div className="mt-4 space-y-3 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex items-start gap-3">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={reply.author.avatar} />
                                      <AvatarFallback>{reply.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{reply.author.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {reply.author.role}
                                        </Badge>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                          {formatDistanceToNow(new Date(reply.timestamp), { locale: ptBR, addSuffix: true })}
                                        </span>
                                      </div>
                                      
                                      <p className="text-sm text-slate-700 dark:text-slate-300">{reply.content}</p>
                                      
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleLikeComment(reply.id, true, comment.id)}
                                        className="gap-1 text-slate-500 dark:text-slate-400 hover:text-red-500 text-xs"
                                      >
                                        <Heart className="w-3 h-3" />
                                        {reply.likes > 0 && reply.likes}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Team Tab */}
              <TabsContent value="team" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedProject.collaborators.map((collaborator, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={collaborator.avatar} />
                            <AvatarFallback>{collaborator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold">{collaborator.name}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{collaborator.role}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Ativo {formatDistanceToNow(new Date(collaborator.lastActivity), { locale: ptBR, addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add Member Card */}
                  <Card className="border-dashed border-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <UserPlus className="w-8 h-8 text-slate-400" />
                        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                          Convidar novo colaborador
                        </p>
                        <Button variant="outline" size="sm">
                          Convidar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">Maria Santos</span> adicionou um comentário
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            há 2 horas
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">João Silva</span> atualizou o slide 5
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            há 3 horas
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">Ana Costa</span> alterou o status para "Em Revisão"
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            há 5 horas
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">Sistema</span> projeto criado
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            há 2 dias
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
