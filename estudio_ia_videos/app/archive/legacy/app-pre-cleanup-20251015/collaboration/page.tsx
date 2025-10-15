
/**
 * 🤝 Estúdio IA de Vídeos - Sprint 10
 * Página de Colaboração em Tempo Real
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  MessageCircle,
  Video,
  Share,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Play,
  Pause,
  Send,
  ThumbsUp,
  Star,
  Award,
  Target,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Room, OnlineUser, ChatMessage, ProjectReview } from '@/types/sprint10';

export default function CollaborationPage() {
  const [activeRooms, setActiveRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [projectReviews, setProjectReviews] = useState<ProjectReview[]>([]);

  useEffect(() => {
    loadActiveRooms();
    loadOnlineUsers();
    loadProjectReviews();
  }, []);

  const loadActiveRooms = async () => {
    // Simular salas colaborativas ativas
    setActiveRooms([
      {
        id: 'room-1',
        name: 'NR-35 - Trabalho em Altura',
        participants: 8,
        status: 'active',
        project: 'Treinamento Andaimes',
        lastActivity: new Date(Date.now() - 300000),
        creator: 'Marina Silva'
      },
      {
        id: 'room-2', 
        name: 'NR-10 - Segurança Elétrica',
        participants: 12,
        status: 'active',
        project: 'Procedimentos Energizados',
        lastActivity: new Date(Date.now() - 120000),
        creator: 'João Santos'
      },
      {
        id: 'room-3',
        name: 'NR-12 - Máquinas Industriais',
        participants: 6,
        status: 'recording',
        project: 'Operação Segura',
        lastActivity: new Date(Date.now() - 600000),
        creator: 'Ana Costa'
      }
    ]);
  };

  const loadOnlineUsers = async () => {
    setOnlineUsers([
      { id: 'user-1', name: 'Marina Silva', role: 'Especialista NR-35', avatar: '/avatar-1.jpg', status: 'online' },
      { id: 'user-2', name: 'João Santos', role: 'Engenheiro Elétrico', avatar: '/avatar-2.jpg', status: 'online' },
      { id: 'user-3', name: 'Ana Costa', role: 'Técnico Segurança', avatar: '/avatar-3.jpg', status: 'busy' },
      { id: 'user-4', name: 'Carlos Lima', role: 'Supervisor HSE', avatar: '/avatar-4.jpg', status: 'away' },
      { id: 'user-5', name: 'Lucia Ferreira', role: 'Instrutora', avatar: '/avatar-5.jpg', status: 'online' }
    ]);
  };

  const loadProjectReviews = async () => {
    setProjectReviews([
      {
        id: 'review-1',
        project: 'NR-35 Módulo Básico',
        reviewer: 'Marina Silva',
        status: 'approved',
        rating: 4.8,
        comment: 'Excelente conteúdo, muito didático!',
        timestamp: new Date(Date.now() - 1800000)
      },
      {
        id: 'review-2',
        project: 'NR-10 Procedimentos',
        reviewer: 'João Santos', 
        status: 'pending',
        rating: undefined,
        comment: 'Aguardando revisão técnica...',
        timestamp: new Date(Date.now() - 3600000)
      }
    ]);
  };

  const joinRoom = async (roomId: string) => {
    const room = activeRooms.find(r => r.id === roomId);
    if (!room) return;
    
    setCurrentRoom(room);
    toast.success(`Você entrou na sala "${room.name}"`);
    
    // Simular carregamento de mensagens do chat
    setChatMessages([
      {
        id: 'msg-1',
        user: 'Marina Silva',
        message: 'Vamos revisar o módulo sobre ancoragem?',
        timestamp: new Date(Date.now() - 600000),
        type: 'message' as const
      },
      {
        id: 'msg-2',
        user: 'Carlos Lima',
        message: 'Perfeito! Já tenho algumas sugestões.',
        timestamp: new Date(Date.now() - 480000),
        type: 'message' as const
      },
      {
        id: 'msg-3',
        user: 'Sistema',
        message: 'Ana Costa iniciou a gravação do projeto',
        timestamp: new Date(Date.now() - 300000),
        type: 'system' as const
      }
    ]);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      user: 'Você',
      message: newMessage,
      timestamp: new Date(),
      type: 'message' as const
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage('');
    toast.success('Mensagem enviada!');
  };

  const createRoom = () => {
    const roomName = prompt('Nome da nova sala colaborativa:');
    if (!roomName) return;

    const newRoom = {
      id: `room-${Date.now()}`,
      name: roomName,
      participants: 1,
      status: 'active',
      project: 'Novo Projeto',
      lastActivity: new Date(),
      creator: 'Você'
    };

    setActiveRooms([...activeRooms, newRoom]);
    toast.success(`Sala "${roomName}" criada com sucesso!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500'; 
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoomStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      recording: 'bg-red-100 text-red-800',
      paused: 'bg-yellow-100 text-yellow-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const approveProject = (reviewId: string) => {
    setProjectReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, status: 'approved', rating: 5.0 }
          : review
      )
    );
    toast.success('Projeto aprovado com sucesso!');
  };

  const reviewProject = (reviewId: string) => {
    const review = projectReviews.find(r => r.id === reviewId);
    if (review) {
      toast.success(`Iniciando revisão do projeto "${review.project}"`);
      // Simular abertura de modal de revisão
      setProjectReviews(prev => 
        prev.map(r => 
          r.id === reviewId 
            ? { ...r, status: 'under_review' }
            : r
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Colaboração em Tempo Real
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Trabalhe em equipe na criação de treinamentos de segurança com chat, revisões e edição colaborativa
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Salas Ativas */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Salas Colaborativas</h3>
              <Button onClick={createRoom} size="sm" className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Nova Sala</span>
              </Button>
            </div>
            
            <div className="space-y-3">
              {activeRooms.map((room) => (
                <Card key={room.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Video className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-semibold">{room.name}</h4>
                          <p className="text-sm text-gray-600">{room.project}</p>
                        </div>
                      </div>
                      <Badge className={getRoomStatusBadge(room.status)}>
                        {room.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{room.participants}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{room.lastActivity.toLocaleTimeString()}</span>
                        </span>
                      </div>
                      <Button 
                        onClick={() => joinRoom(room.id)}
                        size="sm"
                        variant="outline"
                      >
                        Entrar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Usuários Online */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Usuários Online ({onlineUsers.length})</h3>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {onlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat da Sala Atual */}
          <div className="space-y-4">
            {currentRoom ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Chat - {currentRoom.name}</h3>
                  <Badge variant="outline">{currentRoom.participants} participantes</Badge>
                </div>
                
                <Card>
                  <CardContent className="p-0">
                    <ScrollArea className="h-64 p-4">
                      <div className="space-y-3">
                        {chatMessages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.user === 'Você' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs px-3 py-2 rounded-lg ${
                              msg.type === 'system' 
                                ? 'bg-gray-100 text-gray-600 text-center text-xs'
                                : msg.user === 'Você'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100'
                            }`}>
                              {msg.type !== 'system' && (
                                <p className="text-xs font-medium mb-1">{msg.user}</p>
                              )}
                              <p className="text-sm">{msg.message}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {msg.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <div className="border-t p-3">
                      <div className="flex space-x-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Digite sua mensagem..."
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={sendMessage} size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Selecione uma sala para iniciar o chat</p>
              </div>
            )}
          </div>
        </div>

        {/* Revisões de Projeto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Revisões e Aprovações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{review.project}</h4>
                    <Badge variant={review.status === 'approved' ? 'default' : 'secondary'}>
                      {review.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback>{review.reviewer.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">{review.reviewer}</span>
                    {review.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{review.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600">{review.comment}</p>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-gray-500">
                      {review.timestamp.toLocaleString()}
                    </span>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => approveProject(review.id)}
                        size="sm" 
                        variant="outline"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button 
                        onClick={() => reviewProject(review.id)}
                        size="sm" 
                        variant="outline"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Revisar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
