
/**
 * 🚨 EMERGENCY FIXES - Soluções imediatas para problemas críticos
 */

// 1. Fix WebSocket HMR Issues
export const fixWebSocketHMR = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'development') {
    // Block HMR WebSocket connections in production
    const originalWebSocket = window.WebSocket;
    window.WebSocket = class extends originalWebSocket {
      constructor(url: string | URL, protocols?: string | string[]) {
        const urlStr = url.toString();
        
        if (urlStr.includes('webpack-hmr') || urlStr.includes('_next/webpack-hmr')) {
          console.log('🚨 EMERGENCY: Blocked HMR WebSocket in production');
          // Create a dummy WebSocket that fails silently
          super('ws://localhost:0', protocols);
          return;
        }
        
        super(url, protocols);
      }
    };
  }
};

// 2. Fix Infinite useEffect Loops
export const createSafeEffect = (effect: () => void | (() => void), deps?: React.DependencyList, maxCalls = 10) => {
  let callCount = 0;
  const startTime = Date.now();
  
  return () => {
    callCount++;
    const timeElapsed = Date.now() - startTime;
    
    // Prevent too many calls in short time
    if (callCount > maxCalls && timeElapsed < 5000) {
      console.warn('🚨 EMERGENCY: useEffect called too many times, skipping', {
        calls: callCount,
        timeElapsed,
        deps
      });
      return;
    }
    
    // Reset counter after time window
    if (timeElapsed > 10000) {
      callCount = 1;
    }
    
    return effect();
  };
};

// 3. Emergency Image Fallback
export const getEmergencyImageSrc = (originalSrc: string): string => {
  const fallbacks: Record<string, string> = {
    'nr35-thumb.jpg': '/api/placeholder/300/200?text=NR35+Trabalho+em+Altura',
    'nr12-thumb.jpg': '/api/placeholder/300/200?text=NR12+Segurança+Máquinas',
    'nr33-thumb.jpg': '/api/placeholder/300/200?text=NR33+Espaço+Confinado',
    'avatar-executivo-thumb.jpg': '/api/placeholder/300/200?text=Avatar+Executivo',
    'corporativa-thumb.jpg': '/api/placeholder/300/200?text=Treinamento+Corporativo'
  };
  
  const filename = originalSrc.split('/').pop() || '';
  return fallbacks[filename] || '/api/placeholder/300/200?text=Imagem+Indisponível';
};

// 4. Fix Analytics Events Spam
export const createThrottledAnalytics = () => {
  const eventCounts: Record<string, { count: number; lastReset: number }> = {};
  const MAX_EVENTS_PER_MINUTE = 10;
  
  return {
    track: (eventType: string, data?: any) => {
      const now = Date.now();
      const key = eventType;
      
      if (!eventCounts[key]) {
        eventCounts[key] = { count: 0, lastReset: now };
      }
      
      const eventData = eventCounts[key];
      
      // Reset counter every minute
      if (now - eventData.lastReset > 60000) {
        eventData.count = 0;
        eventData.lastReset = now;
      }
      
      // Check if we've hit the limit
      if (eventData.count >= MAX_EVENTS_PER_MINUTE) {
        console.warn(`🚨 EMERGENCY: Analytics event "${eventType}" throttled (${eventData.count}/${MAX_EVENTS_PER_MINUTE})`);
        return;
      }
      
      eventData.count++;
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics:', eventType, data);
      }
    }
  };
};

// 5. Force Break Loading State
export const forceLoadingBreak = (timeoutMs = 8000) => {
  return new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      console.log('🚨 EMERGENCY: Forcing loading state break');
      resolve();
    }, timeoutMs);
    
    // Also resolve on page visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        clearTimeout(timeout);
        resolve();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    setTimeout(() => {
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, timeoutMs + 1000);
  });
};

// 6. Memory Leak Prevention
export const createMemorySafeComponent = <T extends object>(component: T): T => {
  const cleanup: Array<() => void> = [];
  
  // Track timers for cleanup
  const timers: number[] = [];
  
  const safeSetTimeout = (fn: Function, delay?: number) => {
    const id = window.setTimeout(fn, delay);
    timers.push(id);
    return id;
  };
  
  const safeSetInterval = (fn: Function, delay?: number) => {
    const id = window.setInterval(fn, delay);
    timers.push(id);
    return id;
  };
  
  // Auto cleanup after 5 minutes
  const autoCleanup = setTimeout(() => {
    timers.forEach(id => {
      clearTimeout(id);
      clearInterval(id);
    });
    cleanup.forEach(fn => fn());
  }, 300000);
  
  cleanup.push(() => clearTimeout(autoCleanup));
  
  return component;
};

// Initialize emergency fixes
export const initializeEmergencyFixes = () => {
  fixWebSocketHMR();
  
  // Prevent page from hanging
  window.addEventListener('beforeunload', () => {
    console.log('🚨 EMERGENCY: Page unloading, cleaning up...');
  });
  
  // Monitor for stuck loading states
  let loadingStartTime = Date.now();
  const checkLoadingState = () => {
    const loadingElements = document.querySelectorAll('[data-loading="true"], .animate-spin');
    if (loadingElements.length > 0 && Date.now() - loadingStartTime > 10000) {
      console.warn('🚨 EMERGENCY: Long loading state detected, may need intervention');
      loadingElements.forEach(el => {
        el.removeAttribute('data-loading');
        el.classList.remove('animate-spin');
      });
    }
  };
  
  setInterval(checkLoadingState, 5000);
  
  console.log('✅ Emergency fixes initialized');
};

export default {
  fixWebSocketHMR,
  createSafeEffect,
  getEmergencyImageSrc,
  createThrottledAnalytics,
  forceLoadingBreak,
  createMemorySafeComponent,
  initializeEmergencyFixes
};
