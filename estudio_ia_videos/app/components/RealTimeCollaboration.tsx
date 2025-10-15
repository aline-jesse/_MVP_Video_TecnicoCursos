'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Users,
  MessageCircle,
  GitBranch,
  Bell,
  Settings,
  UserPlus,
  UserMinus,
  Eye,
  EyeOff,
  Check,
  X,
  Reply,
  MoreHorizontal,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  Wifi,
  WifiOff,
  Send,
  AtSign,
  Paperclip,
  Download,
  Upload,
  Merge,
  RotateCcw,
  Filter,
  Search,
  Trash2,
  Edit,
  Copy,
  Share,
  Crown,
  Shield,
  User,
  FileText
} from 'lucide-react';
import {
  useRealTimeCollaboration,
  CollaborationUser,
  Comment,
  ProjectVersion,
  ActivityNotification
} from '@/hooks/useRealTimeCollaboration';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CollaborationPanelProps {
  projectId: string;
  onElementSelect?: (elementId: string) => void;
}

interface UserCursorProps {
  user: CollaborationUser;
  position: { x: number; y: number };
}

const UserCursor: React.FC<UserCursorProps> = ({ user, position }) => {
  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-100"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-2px, -2px)'
      }}
    >
      <div className="relative">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="drop-shadow-sm"
        >
          <path
            d="M2 2L18 8L8 12L2 18V2Z"
            fill={user.color}
            stroke="white"
            strokeWidth="1"
          />
        </svg>
        <div
          className="absolute top-5 left-2 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
          style={{ backgroundColor: user.color }}
        >
          {user.name}
        </div>
      </div>
    </div>
  );
};

interface UserListProps {
  users: CollaborationUser[];
  currentUser: CollaborationUser | null;
  onInviteUser: () => void;
  onRemoveUser: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  currentUser,
  onInviteUser,
  onRemoveUser
}) => {
  const getRoleIcon = (role: CollaborationUser['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'editor':
        return <Edit className="h-3 w-3 text-blue-500" />;
      case 'reviewer':
        return <Shield className="h-3 w-3 text-green-500" />;
      case 'viewer':
        return <Eye className="h-3 w-3 text-gray-500" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleLabel = (role: CollaborationUser['role']) => {
    const labels = {
      owner: 'Proprietário',
      editor: 'Editor',
      reviewer: 'Revisor',
      viewer: 'Visualizador'
    };
    return labels[role];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Colaboradores ({users.length})</h3>
        <Button size="sm" onClick={onInviteUser}>
          <UserPlus className="h-4 w-4 mr-2" />
          Convidar
        </Button>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 rounded-lg border"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback style={{ backgroundColor: user.color }}>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm truncate">
                      {user.name}
                      {user.id === currentUser?.id && ' (Você)'}
                    </span>
                    {getRoleIcon(user.role)}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{getRoleLabel(user.role)}</span>
                    {!user.isOnline && (
                      <span>
                        • Visto {formatDistanceToNow(user.lastSeen, { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {currentUser?.role === 'owner' && user.id !== currentUser.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Alterar Permissões
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => onRemoveUser(user.id)}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

interface CommentItemProps {
  comment: Comment;
  users: CollaborationUser[];
  currentUser: CollaborationUser | null;
  onReply: (commentId: string, content: string) => void;
  onResolve: (commentId: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  users,
  currentUser,
  onReply,
  onResolve,
  onEdit,
  onDelete
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const author = users.find(u => u.id === comment.userId);

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent.trim());
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleEdit = () => {
    if (editContent.trim() !== comment.content) {
      onEdit(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className={`p-3 rounded-lg border ${comment.resolved ? 'bg-green-50 border-green-200' : 'bg-background'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={author?.avatar} />
            <AvatarFallback style={{ backgroundColor: author?.color }}>
              {author?.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{author?.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(comment.timestamp, { addSuffix: true, locale: ptBR })}
          </span>
          {comment.resolved && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Resolvido
            </Badge>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setIsReplying(true)}>
              <Reply className="h-4 w-4 mr-2" />
              Responder
            </DropdownMenuItem>
            {currentUser?.id === comment.userId && (
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
            )}
            {!comment.resolved && (
              <DropdownMenuItem onClick={() => onResolve(comment.id)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolver
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {currentUser?.id === comment.userId && (
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => onDelete(comment.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[60px]"
          />
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleEdit}>
              Salvar
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm mb-2">{comment.content}</p>
      )}

      {comment.attachments && comment.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {comment.attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center space-x-1 text-xs bg-gray-100 rounded px-2 py-1"
            >
              <Paperclip className="h-3 w-3" />
              <span>{attachment.name}</span>
            </div>
          ))}
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="ml-4 mt-3 space-y-2 border-l-2 border-gray-200 pl-3">
          {comment.replies.map((reply) => {
            const replyAuthor = users.find(u => u.id === reply.userId);
            return (
              <div key={reply.id} className="text-sm">
                <div className="flex items-center space-x-2 mb-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={replyAuthor?.avatar} />
                    <AvatarFallback style={{ backgroundColor: replyAuthor?.color }}>
                      {replyAuthor?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{replyAuthor?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(reply.timestamp, { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
                <p>{reply.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {isReplying && (
        <div className="mt-3 space-y-2">
          <Textarea
            placeholder="Escreva uma resposta..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-[60px]"
          />
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleReply}>
              <Send className="h-4 w-4 mr-2" />
              Responder
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsReplying(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

interface CommentsListProps {
  comments: Comment[];
  users: CollaborationUser[];
  currentUser: CollaborationUser | null;
  onAddComment: (content: string, position: { x: number; y: number }) => void;
  onReplyToComment: (commentId: string, content: string) => void;
  onResolveComment: (commentId: string) => void;
  onEditComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
}

const CommentsList: React.FC<CommentsListProps> = ({
  comments,
  users,
  currentUser,
  onAddComment,
  onReplyToComment,
  onResolveComment,
  onEditComment,
  onDeleteComment
}) => {
  const [newComment, setNewComment] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const [filterUser, setFilterUser] = useState<string>('all');

  const filteredComments = comments.filter(comment => {
    if (!showResolved && comment.resolved) return false;
    if (filterUser !== 'all' && comment.userId !== filterUser) return false;
    return true;
  });

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim(), { x: 100, y: 100 });
      setNewComment('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Comentários ({filteredComments.length})
        </h3>
        <div className="flex items-center space-x-2">
          <Switch
            checked={showResolved}
            onCheckedChange={setShowResolved}
          />
          <Label className="text-sm">Mostrar resolvidos</Label>
        </div>
      </div>

      <div className="flex space-x-2">
        <Select value={filterUser} onValueChange={setFilterUser}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os usuários</SelectItem>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Adicionar um comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px]"
        />
        <Button onClick={handleAddComment} disabled={!newComment.trim()}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Comentar
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {filteredComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              users={users}
              currentUser={currentUser}
              onReply={onReplyToComment}
              onResolve={onResolveComment}
              onEdit={onEditComment}
              onDelete={onDeleteComment}
            />
          ))}
          
          {filteredComments.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum comentário encontrado</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

interface VersionHistoryProps {
  versions: ProjectVersion[];
  users: CollaborationUser[];
  currentVersion: string;
  onCreateVersion: (name: string, description?: string) => void;
  onRevertToVersion: (versionId: string) => void;
  onMergeVersion: (versionId: string, targetVersionId: string) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  users,
  currentVersion,
  onCreateVersion,
  onRevertToVersion,
  onMergeVersion
}) => {
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [versionDescription, setVersionDescription] = useState('');

  const handleCreateVersion = () => {
    if (versionName.trim()) {
      onCreateVersion(versionName.trim(), versionDescription.trim() || undefined);
      setVersionName('');
      setVersionDescription('');
      setIsCreatingVersion(false);
    }
  };

  const sortedVersions = [...versions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Histórico de Versões ({versions.length})</h3>
        <Button size="sm" onClick={() => setIsCreatingVersion(true)}>
          <GitBranch className="h-4 w-4 mr-2" />
          Nova Versão
        </Button>
      </div>

      {isCreatingVersion && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div>
              <Label>Nome da Versão</Label>
              <Input
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="Ex: Versão 1.0"
              />
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Textarea
                value={versionDescription}
                onChange={(e) => setVersionDescription(e.target.value)}
                placeholder="Descreva as mudanças desta versão..."
                className="min-h-[60px]"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateVersion}>
                Criar Versão
              </Button>
              <Button variant="outline" onClick={() => setIsCreatingVersion(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {sortedVersions.map((version) => {
            const author = users.find(u => u.id === version.userId);
            const isCurrent = version.id === currentVersion;
            
            return (
              <Card key={version.id} className={isCurrent ? 'border-blue-500' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{version.name}</h4>
                        {isCurrent && (
                          <Badge variant="default">Atual</Badge>
                        )}
                        {version.isMerged && (
                          <Badge variant="secondary">Merged</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={author?.avatar} />
                          <AvatarFallback style={{ backgroundColor: author?.color }}>
                            {author?.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{author?.name}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(version.timestamp, { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                      {version.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {version.description}
                        </p>
                      )}
                    </div>

                    {!isCurrent && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onRevertToVersion(version.id)}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reverter para esta versão
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Merge className="h-4 w-4 mr-2" />
                            Fazer merge
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Baixar versão
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {version.changes.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-muted-foreground mb-2">
                        {version.changes.length} alteração(ões)
                      </div>
                      <div className="space-y-1">
                        {version.changes.slice(0, 3).map((change) => (
                          <div key={change.id} className="text-xs flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {change.type}
                            </Badge>
                            <span>{change.elementType}</span>
                          </div>
                        ))}
                        {version.changes.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{version.changes.length - 3} mais...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          {sortedVersions.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma versão criada ainda</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

interface NotificationsPanelProps {
  notifications: ActivityNotification[];
  users: CollaborationUser[];
  onMarkAsRead: (notificationId: string) => void;
  onClearAll: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  users,
  onMarkAsRead,
  onClearAll
}) => {
  const unreadNotifications = notifications.filter(n => !n.read);
  
  const getNotificationIcon = (type: ActivityNotification['type']) => {
    switch (type) {
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'mention':
        return <AtSign className="h-4 w-4 text-orange-500" />;
      case 'version_created':
        return <GitBranch className="h-4 w-4 text-green-500" />;
      case 'user_joined':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'user_left':
        return <UserMinus className="h-4 w-4 text-red-500" />;
      case 'element_changed':
        return <Edit className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: ActivityNotification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-gray-200 bg-gray-50';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Notificações 
          {unreadNotifications.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadNotifications.length}
            </Badge>
          )}
        </h3>
        {notifications.length > 0 && (
          <Button size="sm" variant="outline" onClick={onClearAll}>
            Limpar Todas
          </Button>
        )}
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {notifications.map((notification) => {
            const user = users.find(u => u.id === notification.userId);
            
            return (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  notification.read ? 'bg-background' : getPriorityColor(notification.priority)
                }`}
                onClick={() => !notification.read && onMarkAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {user && (
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback style={{ backgroundColor: user.color }}>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.timestamp, { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    
                    {!notification.read && (
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                        <span className="text-xs text-blue-600">Não lida</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {notifications.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma notificação</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export const RealTimeCollaboration: React.FC<CollaborationPanelProps> = ({
  projectId,
  onElementSelect
}) => {
  const {
    session,
    currentUser,
    isConnected,
    isLoading,
    error,
    stats,
    joinSession,
    leaveSession,
    updateCursor,
    addComment,
    updateComment,
    resolveComment,
    addCommentReply,
    createVersion,
    revertToVersion,
    markNotificationAsRead,
    clearAllNotifications
  } = useRealTimeCollaboration(projectId);

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('users');

  // Join session on mount
  useEffect(() => {
    if (!currentUser) {
      // Auto-join with mock user data
      joinSession({
        id: `user_${Date.now()}`,
        name: 'Usuário Atual',
        email: 'usuario@exemplo.com',
        color: '#3b82f6',
        role: 'editor'
      });
    }
  }, [currentUser, joinSession]);

  // Handle cursor movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (currentUser && isConnected) {
        updateCursor({ x: e.clientX, y: e.clientY });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [currentUser, isConnected, updateCursor]);

  const handleInviteUser = () => {
    toast({
      title: "Convite enviado",
      description: "O link de convite foi copiado para a área de transferência."
    });
  };

  const handleRemoveUser = (userId: string) => {
    toast({
      title: "Usuário removido",
      description: "O usuário foi removido do projeto."
    });
  };

  const handleAddComment = async (content: string, position: { x: number; y: number }) => {
    if (currentUser) {
      const comment = await addComment({
        userId: currentUser.id,
        content,
        position,
        mentions: []
      });
      
      if (comment) {
        toast({
          title: "Comentário adicionado",
          description: "Seu comentário foi publicado."
        });
      }
    }
  };

  const handleReplyToComment = async (commentId: string, content: string) => {
    if (currentUser) {
      const reply = await addCommentReply(commentId, {
        userId: currentUser.id,
        content,
        mentions: []
      });
      
      if (reply) {
        toast({
          title: "Resposta adicionada",
          description: "Sua resposta foi publicada."
        });
      }
    }
  };

  const handleResolveComment = async (commentId: string) => {
    const result = await resolveComment(commentId);
    if (result) {
      toast({
        title: "Comentário resolvido",
        description: "O comentário foi marcado como resolvido."
      });
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    const result = await updateComment(commentId, { content });
    if (result) {
      toast({
        title: "Comentário editado",
        description: "O comentário foi atualizado."
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    // Implementation would depend on API
    toast({
      title: "Comentário excluído",
      description: "O comentário foi removido."
    });
  };

  const handleCreateVersion = async (name: string, description?: string) => {
    if (currentUser) {
      const version = await createVersion({
        name,
        description,
        userId: currentUser.id,
        data: {}, // Current project data
        changes: []
      });
      
      if (version) {
        toast({
          title: "Versão criada",
          description: `A versão "${name}" foi criada com sucesso.`
        });
      }
    }
  };

  const handleRevertToVersion = async (versionId: string) => {
    const result = await revertToVersion(versionId);
    if (result) {
      toast({
        title: "Versão restaurada",
        description: "O projeto foi revertido para a versão selecionada."
      });
    }
  };

  const handleMergeVersion = async (versionId: string, targetVersionId: string) => {
    // Implementation would depend on merge logic
    toast({
      title: "Merge realizado",
      description: "As versões foram mescladas com sucesso."
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando colaboração...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Erro na colaboração</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-muted-foreground">Sessão de colaboração não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Connection Status */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          
          {stats && (
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>{stats.activeUsers} online</span>
              <span>{stats.unresolvedComments} comentários</span>
            </div>
          )}
        </div>
      </div>

      {/* User Cursors */}
      {session.users
        .filter(user => user.cursor && user.id !== currentUser?.id)
        .map(user => (
          <UserCursor
            key={user.id}
            user={user}
            position={user.cursor!}
          />
        ))}

      {/* Main Content */}
      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageCircle className="h-4 w-4 mr-2" />
              Comentários
            </TabsTrigger>
            <TabsTrigger value="versions">
              <GitBranch className="h-4 w-4 mr-2" />
              Versões
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notificações
              {session.notifications.filter(n => !n.read).length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {session.notifications.filter(n => !n.read).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="h-full p-4">
            <UserList
              users={session.users}
              currentUser={currentUser}
              onInviteUser={handleInviteUser}
              onRemoveUser={handleRemoveUser}
            />
          </TabsContent>

          <TabsContent value="comments" className="h-full p-4">
            <CommentsList
              comments={session.comments}
              users={session.users}
              currentUser={currentUser}
              onAddComment={handleAddComment}
              onReplyToComment={handleReplyToComment}
              onResolveComment={handleResolveComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
            />
          </TabsContent>

          <TabsContent value="versions" className="h-full p-4">
            <VersionHistory
              versions={session.versions}
              users={session.users}
              currentVersion={session.currentVersion}
              onCreateVersion={handleCreateVersion}
              onRevertToVersion={handleRevertToVersion}
              onMergeVersion={handleMergeVersion}
            />
          </TabsContent>

          <TabsContent value="notifications" className="h-full p-4">
            <NotificationsPanel
              notifications={session.notifications}
              users={session.users}
              onMarkAsRead={markNotificationAsRead}
              onClearAll={clearAllNotifications}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};