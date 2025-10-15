
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface KeyboardNavigationOptions {
  enabled?: boolean
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const router = useRouter()
  const { enabled = true } = options

  useEffect(() => {
    if (!enabled) return

    let gPressed = false
    let timeout: NodeJS.Timeout

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se estiver em input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      // Sequência G + tecla para navegação
      if (e.key === 'g' || e.key === 'G') {
        gPressed = true
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          gPressed = false
        }, 1000)
        return
      }

      if (gPressed) {
        switch (e.key.toLowerCase()) {
          case 'p':
            router.push('/projetos')
            break
          case 't':
            router.push('/templates')
            break
          case 'a':
            router.push('/analytics')
            break
          case 's':
            router.push('/settings')
            break
          case 'c':
            router.push('/collaboration')
            break
          case 'd':
            router.push('/dashboard')
            break
        }
        gPressed = false
      }

      // Ctrl/Cmd + N para novo projeto
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        router.push('/projetos?create=true')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timeout)
    }
  }, [enabled, router])
}
