

'use client'

/**
 * 🌓 Theme Provider - Professional Theme System
 * Dark, Light, and Pro themes with persistent storage
 * Sprint 22 - Modern UI/UX Overhaul
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export type ThemeMode = 'light' | 'dark' | 'pro' | 'auto'

interface ThemeColors {
  canvas: string
  toolbar: string
  sidebar: string
  accent: string
  text: string
  border: string
  shadow: string
  hover: string
  active: string
  success: string
  warning: string
  error: string
}

interface Theme {
  mode: ThemeMode
  colors: ThemeColors
  animations: {
    duration: string
    easing: string
  }
  shadows: {
    light: string
    medium: string
    heavy: string
  }
}

const themes: Record<ThemeMode, Theme> = {
  light: {
    mode: 'light',
    colors: {
      canvas: '#ffffff',
      toolbar: '#f8f9fa',
      sidebar: '#f1f3f4',
      accent: '#6366f1',
      text: '#1f2937',
      border: '#e5e7eb',
      shadow: 'rgba(0, 0, 0, 0.1)',
      hover: '#f3f4f6',
      active: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    animations: {
      duration: '200ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    shadows: {
      light: '0 1px 3px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
      heavy: '0 10px 15px rgba(0, 0, 0, 0.1)'
    }
  },
  dark: {
    mode: 'dark',
    colors: {
      canvas: '#1a1a1a',
      toolbar: '#2d2d2d',
      sidebar: '#242424',
      accent: '#8b5cf6',
      text: '#ffffff',
      border: '#404040',
      shadow: 'rgba(0, 0, 0, 0.3)',
      hover: '#3a3a3a',
      active: '#4a4a4a',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171'
    },
    animations: {
      duration: '200ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    shadows: {
      light: '0 1px 3px rgba(0, 0, 0, 0.3)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.3)',
      heavy: '0 10px 15px rgba(0, 0, 0, 0.3)'
    }
  },
  pro: {
    mode: 'pro',
    colors: {
      canvas: '#0f0f23',
      toolbar: '#1a1a2e',
      sidebar: '#16213e',
      accent: '#e94560',
      text: '#eeeeeee',
      border: '#0f3460',
      shadow: 'rgba(233, 69, 96, 0.2)',
      hover: '#233e61',
      active: '#16213e',
      success: '#00d4aa',
      warning: '#ff6b35',
      error: '#e94560'
    },
    animations: {
      duration: '300ms',
      easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)'
    },
    shadows: {
      light: '0 2px 4px rgba(233, 69, 96, 0.1)',
      medium: '0 8px 16px rgba(233, 69, 96, 0.15)',
      heavy: '0 16px 32px rgba(233, 69, 96, 0.2)'
    }
  },
  auto: {
    mode: 'auto',
    colors: {
      canvas: '#ffffff',
      toolbar: '#f8f9fa',
      sidebar: '#f1f3f4',
      accent: '#6366f1',
      text: '#1f2937',
      border: '#e5e7eb',
      shadow: 'rgba(0, 0, 0, 0.1)',
      hover: '#f3f4f6',
      active: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    animations: {
      duration: '200ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    shadows: {
      light: '0 1px 3px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
      heavy: '0 10px 15px rgba(0, 0, 0, 0.1)'
    }
  }
}

interface ThemeContextType {
  theme: Theme
  setTheme: (mode: ThemeMode) => void
  toggleTheme: () => void
  isSystemDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useCanvasTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useCanvasTheme must be used within a CanvasThemeProvider')
  }
  return context
}

interface CanvasThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeMode
}

export function CanvasThemeProvider({ children, defaultTheme = 'auto' }: CanvasThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(defaultTheme)
  const [isSystemDark, setIsSystemDark] = useState(false)

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsSystemDark(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('canvas-theme') as ThemeMode
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme)
    }
  }, [])

  // Resolve auto theme
  const resolvedTheme = currentTheme === 'auto' 
    ? (isSystemDark ? 'dark' : 'light')
    : currentTheme

  const theme = themes[resolvedTheme]

  // Apply CSS custom properties
  useEffect(() => {
    const root = document.documentElement
    
    // Apply theme colors as CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--canvas-${key}`, value)
    })
    
    // Apply animation properties
    root.style.setProperty('--canvas-duration', theme.animations.duration)
    root.style.setProperty('--canvas-easing', theme.animations.easing)
    
    // Apply shadow properties
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--canvas-shadow-${key}`, value)
    })
    
    // Apply theme class to body
    document.body.classList.remove('canvas-light', 'canvas-dark', 'canvas-pro')
    document.body.classList.add(`canvas-${resolvedTheme}`)
    
  }, [theme, resolvedTheme])

  const setTheme = (mode: ThemeMode) => {
    setCurrentTheme(mode)
    localStorage.setItem('canvas-theme', mode)
    
    const themeNames = {
      light: 'Tema Claro',
      dark: 'Tema Escuro',  
      pro: 'Tema Profissional',
      auto: 'Sistema'
    }
    
    toast.success(`${themeNames[mode]} ativado`, {
      duration: 2000,
      icon: mode === 'light' ? '☀️' : mode === 'dark' ? '🌙' : mode === 'pro' ? '⚡' : '🔄'
    })
  }

  const toggleTheme = () => {
    const themeOrder: ThemeMode[] = ['light', 'dark', 'pro', 'auto']
    const currentIndex = themeOrder.indexOf(currentTheme)
    const nextIndex = (currentIndex + 1) % themeOrder.length
    setTheme(themeOrder[nextIndex])
  }

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    isSystemDark
  }

  return (
    <ThemeContext.Provider value={value}>
      <div 
        className="canvas-theme-root"
        style={{
          '--canvas-current-theme': resolvedTheme,
          transition: `all ${theme.animations.duration} ${theme.animations.easing}`
        } as React.CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

// Theme utilities
export const ThemeUtils = {
  getThemeIcon: (mode: ThemeMode) => {
    const icons = {
      light: '☀️',
      dark: '🌙',
      pro: '⚡',
      auto: '🔄'
    }
    return icons[mode]
  },
  
  getThemeName: (mode: ThemeMode) => {
    const names = {
      light: 'Claro',
      dark: 'Escuro',
      pro: 'Profissional',
      auto: 'Automático'
    }
    return names[mode]
  },
  
  isHighContrast: (theme: Theme) => {
    return theme.mode === 'pro'
  },
  
  getContrastColor: (theme: Theme, backgroundColor: string) => {
    // Simple contrast calculation
    const rgb = backgroundColor.match(/\d+/g)
    if (!rgb) return theme.colors.text
    
    const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  }
}

