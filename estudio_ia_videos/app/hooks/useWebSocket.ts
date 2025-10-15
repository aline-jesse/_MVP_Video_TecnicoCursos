'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface UseWebSocketOptions {
  url: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
}

export interface UseWebSocketReturn {
  socket: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  lastMessage: WebSocketMessage | null;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
  connect: () => void;
  disconnect: () => void;
  sendMessage: (type: string, data: any) => void;
  subscribe: (type: string, callback: (data: any) => void) => () => void;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    autoConnect = true,
    reconnectAttempts = 3,
    reconnectInterval = 3000,
    onConnect,
    onDisconnect,
    onMessage,
    onError
  } = options;

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const subscribersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const connect = useCallback(() => {
    // Prevent connection during SSR
    if (typeof window === 'undefined') {
      return;
    }

    if (socket?.readyState === WebSocket.CONNECTING || socket?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setConnectionState('connecting');

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setSocket(ws);
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      ws.onclose = () => {
        setSocket(null);
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionState('disconnected');
        onDisconnect?.();

        // Auto-reconnect logic
        if (reconnectAttemptsRef.current < reconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        setIsConnecting(false);
        setConnectionState('error');
        onError?.(error);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);

          // Notify subscribers
          const subscribers = subscribersRef.current.get(message.type);
          if (subscribers) {
            subscribers.forEach(callback => callback(message.data));
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      setSocket(ws);
    } catch (error) {
      setIsConnecting(false);
      setConnectionState('error');
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [url, reconnectAttempts, reconnectInterval, onConnect, onDisconnect, onMessage, onError, socket]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
      setConnectionState('disconnected');
    }
  }, [socket]);

  const sendMessage = useCallback((type: string, data: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now()
      };
      socket.send(JSON.stringify(message));
    }
  }, [socket]);

  const subscribe = useCallback((type: string, callback: (data: any) => void) => {
    if (!subscribersRef.current.has(type)) {
      subscribersRef.current.set(type, new Set());
    }
    subscribersRef.current.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = subscribersRef.current.get(type);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          subscribersRef.current.delete(type);
        }
      }
    };
  }, []);

  // Auto-connect effect
  useEffect(() => {
    if (autoConnect && typeof window !== 'undefined') {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket,
    isConnected,
    isConnecting,
    lastMessage,
    connectionState,
    connect,
    disconnect,
    sendMessage,
    subscribe
  };
}

// Specialized hooks for different types of notifications
export function useRenderProgress() {
  const [progress, setProgress] = useState<any>(null);
  const [isRendering, setIsRendering] = useState(false);

  const { subscribe } = useWebSocket({
    url: 'ws://localhost:8080',
    autoConnect: typeof window !== 'undefined'
  });

  useEffect(() => {
    const unsubscribeProgress = subscribe('render_progress', (data) => {
      setProgress(data);
      setIsRendering(true);
    });

    const unsubscribeComplete = subscribe('render_complete', (data) => {
      setProgress(data);
      setIsRendering(false);
    });

    const unsubscribeError = subscribe('render_error', (data) => {
      setProgress(data);
      setIsRendering(false);
    });

    return () => {
      unsubscribeProgress();
      unsubscribeComplete();
      unsubscribeError();
    };
  }, [subscribe]);

  return { progress, isRendering };
}

export function useRenderNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const { subscribe } = useWebSocket({
    url: 'ws://localhost:8080',
    autoConnect: typeof window !== 'undefined'
  });

  useEffect(() => {
    const unsubscribe = subscribe('render_notification', (data) => {
      setNotifications(prev => [...prev, data]);
    });

    return unsubscribe;
  }, [subscribe]);

  return { notifications };
}

export function useSystemNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const { subscribe } = useWebSocket({
    url: 'ws://localhost:8080',
    autoConnect: typeof window !== 'undefined'
  });

  useEffect(() => {
    const unsubscribe = subscribe('system_notification', (data) => {
      setNotifications(prev => [...prev, data]);
    });

    return unsubscribe;
  }, [subscribe]);

  return { notifications };
}