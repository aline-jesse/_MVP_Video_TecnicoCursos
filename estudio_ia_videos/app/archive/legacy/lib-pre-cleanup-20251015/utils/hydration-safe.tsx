
/**
 * 🔧 Hydration-Safe Utilities
 * Functions to prevent hydration mismatches
 */

import { useState, useEffect } from 'react';

/**
 * Hook to safely use client-side only values
 * Prevents hydration mismatch by only rendering on client
 */
export function useClientSide() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook for safe date formatting
 * Returns server-safe placeholder until mounted
 */
export function useSafeDate(date: Date | string | null | undefined) {
  const [formattedDate, setFormattedDate] = useState<string>('');
  
  useEffect(() => {
    if (!date) {
      setFormattedDate('');
      return;
    }

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      setFormattedDate(dateObj.toLocaleDateString('pt-BR'));
    } catch (error) {
      console.error('Error formatting date:', error);
      setFormattedDate('');
    }
  }, [date]);

  return formattedDate;
}

/**
 * Hook for safe time formatting
 */
export function useSafeTime(date: Date | string | null | undefined) {
  const [formattedTime, setFormattedTime] = useState<string>('');
  
  useEffect(() => {
    if (!date) {
      setFormattedTime('');
      return;
    }

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      setFormattedTime(dateObj.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    } catch (error) {
      console.error('Error formatting time:', error);
      setFormattedTime('');
    }
  }, [date]);

  return formattedTime;
}

/**
 * Hook for safe relative time (e.g., "2 hours ago")
 */
export function useSafeRelativeTime(date: Date | string | null | undefined) {
  const [relativeTime, setRelativeTime] = useState<string>('');
  
  useEffect(() => {
    if (!date) {
      setRelativeTime('');
      return;
    }

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diff = now.getTime() - dateObj.getTime();
      
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        setRelativeTime(`${days} dia${days > 1 ? 's' : ''} atrás`);
      } else if (hours > 0) {
        setRelativeTime(`${hours} hora${hours > 1 ? 's' : ''} atrás`);
      } else if (minutes > 0) {
        setRelativeTime(`${minutes} minuto${minutes > 1 ? 's' : ''} atrás`);
      } else {
        setRelativeTime('agora');
      }
    } catch (error) {
      console.error('Error formatting relative time:', error);
      setRelativeTime('');
    }
  }, [date]);

  return relativeTime;
}

/**
 * Hook for safe random values
 * Always returns same value on server and client
 */
export function useSafeRandom(seed: string | number = 0) {
  // Use seed to generate deterministic "random" value
  const hash = typeof seed === 'string' 
    ? seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : seed;
  
  return (hash % 100) / 100; // Returns value between 0 and 1
}

/**
 * Component wrapper for client-only rendering
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const isClient = useClientSide();
  return isClient ? <>{children}</> : null;
}

/**
 * Safe localStorage hook
 */
export function useSafeLocalStorage<T>(key: string, initialValue: T): readonly [T, (value: T | ((val: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue, isLoaded];
}

/**
 * Safe window dimensions hook
 */
export function useSafeWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    // Set initial size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
