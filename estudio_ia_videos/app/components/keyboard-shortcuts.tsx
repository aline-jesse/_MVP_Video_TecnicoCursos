
'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Command } from 'lucide-react'
import { cn } from '../lib/utils'

interface Shortcut {
  keys: string[]
  description: string
  category: string
}

const shortcuts: Shortcut[] = [
  // Navegação
  { keys: ['Cmd/Ctrl', 'K'], description: 'Busca global', category: 'Navegação' },
  { keys: ['Cmd/Ctrl', '/'], description: 'Ver atalhos de teclado', category: 'Navegação' },
  { keys: ['G', 'P'], description: 'Ir para Projetos', category: 'Navegação' },
  { keys: ['G', 'T'], description: 'Ir para Templates', category: 'Navegação' },
  { keys: ['G', 'A'], description: 'Ir para Analytics', category: 'Navegação' },
  { keys: ['G', 'S'], description: 'Ir para Configurações', category: 'Navegação' },
  
  // Ações
  { keys: ['Cmd/Ctrl', 'N'], description: 'Novo projeto', category: 'Ações' },
  { keys: ['Cmd/Ctrl', 'S'], description: 'Salvar', category: 'Ações' },
  { keys: ['Cmd/Ctrl', 'Z'], description: 'Desfazer', category: 'Ações' },
  { keys: ['Cmd/Ctrl', 'Shift', 'Z'], description: 'Refazer', category: 'Ações' },
  
  // Editor
  { keys: ['Space'], description: 'Play/Pause', category: 'Editor' },
  { keys: ['←', '→'], description: 'Navegar frames', category: 'Editor' },
  { keys: ['Delete'], description: 'Excluir seleção', category: 'Editor' },
  { keys: ['Cmd/Ctrl', 'D'], description: 'Duplicar', category: 'Editor' },
]

const KeyboardShortcut = ({ shortcut }: { shortcut: Shortcut }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
    <span className="text-sm">{shortcut.description}</span>
    <div className="flex gap-1">
      {shortcut.keys.map((key, i) => (
        <span key={i}>
          <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium opacity-100">
            {key === 'Cmd/Ctrl' ? (
              <span className="flex items-center gap-1">
                <Command className="w-3 h-3" />/<span>Ctrl</span>
              </span>
            ) : (
              key
            )}
          </kbd>
          {i < shortcut.keys.length - 1 && <span className="mx-1 text-muted-foreground">+</span>}
        </span>
      ))}
    </div>
  </div>
)

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const categories = Array.from(new Set(shortcuts.map(s => s.category)))

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-muted-foreground"
      >
        <Command className="w-4 h-4 mr-2" />
        Atalhos
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="w-5 h-5" />
              Atalhos de Teclado
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                  {category}
                </h3>
                <div className="space-y-1">
                  {shortcuts
                    .filter((s) => s.category === category)
                    .map((shortcut, i) => (
                      <KeyboardShortcut key={i} shortcut={shortcut} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
