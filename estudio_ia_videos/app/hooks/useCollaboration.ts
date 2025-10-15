import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, 
  Comment, 
  CommentReply, 
  ProjectVersion, 
  ActivityNotification, 
  CollaborationSession,
  RealTimeEvent,
  ConflictResolution 
} from '@/types/collaboration';
import { getWebSocketService, WebSocketService } from '@/services/websocket';

interface UseCollaborationProps {
  projectId: string;
  userId: string;
  onElementChange?: (elementId: string, changes: any) => void;
  onConflict?: (conflict: ConflictResolution) => void;
}

export function useCollaboration({
  projectId,
  userId,
  onElementChange,
  onConflict
}: UseCollaborationProps) {
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number; lastUpdate: Date }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocketService | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize collaboration session
  const initializeSession = useCallback(async () => {
    try {
      setError(null);
      
      // Get WebSocket service instance
      wsRef.current = getWebSocketService(projectId, userId);
      
      // Set up connection listeners
      wsRef.current.onConnectionChange(setIsConnected);
      
      // Set up event listeners
      wsRef.current.on('user_joined', (user: User) => {
        setActiveUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
        addNotification('User Joined', `${user.name} joined the project`);
      });
      
      wsRef.current.on('user_left', (userId: string) => {
        setActiveUsers(prev => prev.filter(u => u.id !== userId));
      });
      
      wsRef.current.on('cursor_move', ({ userId: cursorUserId, x, y }: { userId: string; x: number; y: number }) => {
        setActiveUsers(prev => prev.map(user => 
          user.id === cursorUserId 
            ? { ...user, cursor: { x, y, elementId: undefined } }
            : user
        ));
      });
      
      wsRef.current.on('element_update', (data: any) => {
        if (onElementChange) {
          onElementChange(data.elementId, data.changes);
        }
      });
      
      wsRef.current.on('comment_added', (comment: Comment) => {
        setComments(prev => [comment, ...prev]);
        addNotification({
          type: 'comment',
          title: 'New Comment',
          message: `${comment.user.name} added a comment`,
          userId: comment.userId,
          projectId,
          commentId: comment.id,
        });
      });
      
      wsRef.current.on('comment_reply', ({ commentId, reply }: { commentId: string; reply: CommentReply }) => {
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, replies: [...comment.replies, reply] }
            : comment
        ));
        addNotification({
          type: 'comment',
          title: 'Comment Reply',
          message: `${reply.user.name} replied to a comment`,
          userId: reply.userId,
          projectId,
          commentId,
        });
      });
      
      wsRef.current.on('comment_resolved', (commentId: string) => {
        setComments(prev => prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, resolved: true }
            : comment
        ));
      });
      
      wsRef.current.on('version_created', (version: ProjectVersion) => {
        setVersions(prev => [version, ...prev]);
        addNotification({
          type: 'version',
          title: 'New Version',
          message: `Version ${version.name} created`,
          userId: version.createdBy,
          projectId,
          versionId: version.id,
        });
      });
      
      // Connect to WebSocket
      await wsRef.current.connect();
      
      // Create mock session for demo
      const mockSession: CollaborationSession = {
        id: `session-${projectId}`,
        projectId,
        users: [
          {
            id: userId,
            name: `User ${userId.slice(-4)}`,
            email: `user${userId.slice(-4)}@example.com`,
            role: 'owner',
            isOnline: true,
            lastSeen: new Date(),
          }
        ],
        activeUsers: [userId],
        comments: [],
        versions: [],
        notifications: [],
        permissions: {
          owner: userId,
          editors: [],
          viewers: [],
          public: false,
          allowComments: true,
          allowVersioning: true,
          requireApproval: false,
        },
        settings: {
          autoSave: true,
          autoSaveInterval: 30000,
          showCursors: true,
          showComments: true,
          enableNotifications: true,
          enableVersioning: true,
          maxVersions: 50,
          conflictResolution: 'manual',
        },
      };

      setSession(mockSession);
      setCurrentUser(mockSession.users[0]);
      setComments(mockSession.comments);
      setVersions(mockSession.versions);
      setNotifications(mockSession.notifications);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize session');
    }
  }, [projectId, userId, onElementChange]);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      // In production, use actual WebSocket URL
      const wsUrl = `ws://localhost:8080/collaboration/${projectId}?userId=${userId}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        
        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: RealTimeEvent = JSON.parse(event.data);
          handleRealTimeEvent(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        
        // Attempt to reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };

      wsRef.current.onerror = (error) => {
        setError('WebSocket connection error');
        console.error('WebSocket error:', error);
      };
    } catch (err) {
      setError('Failed to connect to collaboration server');
    }
  }, [projectId, userId]);

  // Handle real-time events
  const handleRealTimeEvent = useCallback((event: RealTimeEvent) => {
    switch (event.type) {
      case 'user_join':
        setActiveUsers(prev => {
          const exists = prev.find(u => u.id === event.data.user.id);
          if (exists) return prev;
          return [...prev, { ...event.data.user, isOnline: true }];
        });
        break;

      case 'user_leave':
        setActiveUsers(prev => prev.filter(u => u.id !== event.data.userId));
        break;

      case 'cursor_move':
        setActiveUsers(prev => prev.map(user => 
          user.id === event.userId 
            ? { ...user, cursor: event.data.cursor }
            : user
        ));
        break;

      case 'element_change':
        if (onElementChange && event.userId !== userId) {
          onElementChange(event.data.elementId, event.data.changes);
        }
        break;

      case 'comment_add':
        setComments(prev => [...prev, event.data.comment]);
        addNotification({
          type: 'comment',
          title: 'New Comment',
          message: `${event.data.comment.user.name} added a comment`,
          userId: event.userId,
          projectId,
          commentId: event.data.comment.id,
        });
        break;

      case 'comment_update':
        setComments(prev => prev.map(comment =>
          comment.id === event.data.comment.id ? event.data.comment : comment
        ));
        break;

      case 'version_create':
        setVersions(prev => [...prev, event.data.version]);
        addNotification({
          type: 'version',
          title: 'New Version',
          message: `${event.data.version.name} created`,
          userId: event.userId,
          projectId,
          versionId: event.data.version.id,
        });
        break;
    }
  }, [userId, projectId, onElementChange]);

  // Send real-time event
  const sendEvent = useCallback((type: string, payload: any) => {
    if (wsRef.current && wsRef.current.isConnected()) {
      wsRef.current.send(type as any, payload);
    }
  }, []);



  // User management
  const updateCursor = useCallback((x: number, y: number, elementId?: string) => {
    sendEvent('cursor_move', { x, y, elementId });
    
    // Update local cursor state
    setCursors(prev => ({
      ...prev,
      [userId]: { x, y, lastUpdate: new Date() }
    }));
  }, [userId, sendEvent]);

  const inviteUser = useCallback(async (email: string, role: 'editor' | 'viewer') => {
    try {
      // In production, send API request
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        role,
        isOnline: false,
        lastSeen: new Date(),
        cursorColor: '#' + Math.floor(Math.random()*16777215).toString(16)
      };

      setActiveUsers(prev => [...prev, newUser]);

      addNotification({
        type: 'permission',
        title: 'User Invited',
        message: `${email} has been invited as ${role}`,
        userId,
        projectId,
      });
    } catch (err) {
      setError('Failed to invite user');
    }
  }, [userId, projectId, addNotification]);

  // Comment management
  const addComment = useCallback(async (content: string, elementId?: string) => {
    if (!currentUser) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      content,
      userId,
      projectId,
      elementId,
      user: currentUser,
      replies: [],
      resolved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setComments(prev => [comment, ...prev]);

    sendEvent('comment_added', comment);

    return comment;
  }, [currentUser, userId, projectId, sendEvent]);

  const replyToComment = useCallback(async (commentId: string, content: string) => {
    if (!currentUser) return;

    const reply: CommentReply = {
      id: `reply-${Date.now()}`,
      userId,
      user: currentUser,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setComments(prev => prev.map(comment =>
      comment.id === commentId
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    ));

    sendEvent('comment_reply', { commentId, reply });

    return reply;
  }, [currentUser, userId, sendEvent]);

  const resolveComment = useCallback(async (commentId: string) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId
        ? { ...comment, resolved: true, updatedAt: new Date() }
        : comment
    ));

    sendEvent('comment_resolved', commentId);
  }, [sendEvent]);

  // Version management
  const createVersion = useCallback(async (
    name: string, 
    description: string, 
    state: any
  ) => {
    const version: ProjectVersion = {
      id: `version-${Date.now()}`,
      projectId,
      version: `v${versions.length + 1}.0.0`,
      name,
      description,
      createdBy: userId,
      createdAt: new Date(),
      state,
      changes: [],
      isMerged: false,
    };

    setVersions(prev => [...prev, version]);

    sendEvent('version_created', version);

    return version.id;
  }, [projectId, userId, versions.length, sendEvent]);

  const compareVersions = useCallback((versionA: string, versionB: string) => {
    const vA = versions.find(v => v.id === versionA);
    const vB = versions.find(v => v.id === versionB);
    
    if (!vA || !vB) return null;

    // Simple comparison - in production, use proper diff algorithm
    return {
      added: [],
      modified: [],
      removed: [],
      conflicts: [],
    };
  }, [versions]);

  // Notification management
  const addNotification = useCallback((notification: Omit<ActivityNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: ActivityNotification = {
      ...notification,
      id: `notification-${Date.now()}`,
      createdAt: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const markNotificationRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    setUnreadCount(0);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeSession();

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [initializeSession]);

  return {
    // State
    session,
    isConnected,
    error,
    currentUser,
    activeUsers,
    comments,
    versions,
    notifications,
    unreadCount,
    cursors,

    // User management
    updateCursor,
    inviteUser,

    // Comments
    addComment,
    replyToComment,
    resolveComment,

    // Versions
    createVersion,
    compareVersions,

    // Notifications
    markNotificationRead,
    markAllNotificationsRead,

    // Real-time
    sendEvent,
  };
}