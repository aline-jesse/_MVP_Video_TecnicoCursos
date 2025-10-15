
/**
 * 👥 COLABORAÇÃO EM TEMPO REAL - PÁGINA DEMO
 * Demonstração das funcionalidades reais de colaboração
 */

'use client'

import React, { useState, useEffect } from 'react'
import AppShell from '@/components/layouts/AppShell'
import { useCollaboration } from '@/lib/socket-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Users,
  MessageCircle,
  Wifi,
  WifiOff,
  Send,
  Eye,
  Clock,
  Zap,
  CheckCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function CollaborationRealTimePage() {
  const [projectId] = useState('demo-project-collaboration')
  const [userId] = useState(`user-${Date.now()}`)
  const [userName] = useState(`Usuário ${Math.floor(Math.random() * 1000)}`)
  const [commentText, setCommentText] = useState('')

  const {
    isConnected,
    users,
    comments,
    versions,
    addComment,
    saveVersion
  } = useCollaboration(projectId, userId, userName)

  const [canvasData, setCanvasData] = useState<{
    objects: Array<{
      id: number
      type: string
      x: number
      y: number
      width: number
      height: number
      color: string
    }>
    background: string
    lastUpdate: number
  }>({
    objects: [],
    background: '#ffffff',
    lastUpdate: Date.now()
  })

  useEffect(() => {
    if (isConnected) {
      toast.success('Conectado à colaboração em tempo real!')
    }
  }, [isConnected])

  const handleAddComment = () => {
    if (!commentText.trim()) return
    
    addComment(commentText, { x: Math.random() * 400, y: Math.random() * 300 })
    setCommentText('')
  }

  const handleSaveVersion = () => {
    const versionName = `Versão ${versions.length + 1}`
    saveVersion(versionName, {
      canvas: canvasData,
      timestamp: Date.now(),
      description: 'Versão salva automaticamente'
    })
    toast.success(`${versionName} salva!`)
  }

  const simulateCanvasUpdate = () => {
    const newData = {
      ...canvasData,
      objects: [...canvasData.objects, {
        id: Date.now(),
        type: 'rectangle',
        x: Math.random() * 300,
        y: Math.random() * 200,
        width: 50 + Math.random() * 100,
        height: 30 + Math.random() * 60,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      }],
      lastUpdate: Date.now()
    }
    setCanvasData(newData)
    toast.success('Canvas atualizado!')
  }

  return (
    <AppShell
      title="Colaboração em Tempo Real"
      description="Sistema real de colaboração simultânea com WebSocket"
    >
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Status de Conexão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Wifi className="h-5 w-5 text-green-500" />
                  <span className="text-green-600">Colaboração Ativa</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-red-500" />
                  <span className="text-red-600">Conectando...</span>
                </>
              )}
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isConnected ? 'Online' : 'Offline'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{users.length + 1}</div>
                <div className="text-sm text-muted-foreground">Usuários Online</div>
              </div>
              
              <div className="text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{comments.length}</div>
                <div className="text-sm text-muted-foreground">Comentários</div>
              </div>
              
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{versions.length}</div>
                <div className="text-sm text-muted-foreground">Versões Salvas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Canvas de Demonstração */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Canvas Colaborativo
                </span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={simulateCanvasUpdate}>
                    <Zap className="h-4 w-4 mr-2" />
                    Simular Edição
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleSaveVersion}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Salvar Versão
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="relative w-full h-96 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                style={{ backgroundColor: canvasData.background }}
              >
                {/* Objetos do Canvas */}
                {canvasData.objects.map((obj: any) => (
                  <div
                    key={obj.id}
                    className="absolute rounded shadow-lg cursor-move"
                    style={{
                      left: obj.x,
                      top: obj.y,
                      width: obj.width,
                      height: obj.height,
                      backgroundColor: obj.color
                    }}
                    title={`Objeto criado em ${new Date(obj.id).toLocaleTimeString()}`}
                  />
                ))}
                
                {/* Cursores dos outros usuários */}
                {users.map((user) => (
                  user.cursor && (
                    <div
                      key={`cursor-${user.id}`}
                      className="absolute pointer-events-none z-10"
                      style={{ left: user.cursor.x, top: user.cursor.y }}
                    >
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded mt-1">
                        {user.name}
                      </div>
                    </div>
                  )
                ))}
                
                {canvasData.objects.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Canvas colaborativo</p>
                      <p className="text-sm">Clique "Simular Edição" para adicionar elementos</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                Última atualização: {new Date(canvasData.lastUpdate).toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>

          {/* Painel Lateral */}
          <div className="space-y-4">
            
            {/* Usuários Online */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usuários Online</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Usuário atual */}
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{userName} (você)</span>
                    <Badge variant="outline" className="ml-auto">Host</Badge>
                  </div>
                  
                  {/* Outros usuários */}
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-green-500 text-white">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                      <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" title="Online" />
                    </div>
                  ))}
                  
                  {users.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Você está sozinho no projeto</p>
                      <p className="text-xs">Convide outros colaboradores!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comentários */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comentários</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48 mb-4">
                  <div className="space-y-2">
                    {comments.map((comment) => (
                      <div key={comment.id} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="font-medium text-blue-600">{comment.userName}</div>
                        <div className="text-gray-900">{comment.content}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(comment.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                    
                    {comments.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum comentário ainda</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar comentário..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Versões */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Versões</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="space-y-1">
                    {versions.map((version) => (
                      <div key={version.id} className="p-2 hover:bg-gray-50 rounded text-sm cursor-pointer">
                        <div className="font-medium">{version.name}</div>
                        <div className="text-xs text-gray-500">
                          {version.userName} • {new Date(version.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    
                    {versions.length === 0 && (
                      <div className="text-center py-2 text-gray-500">
                        <Clock className="h-6 w-6 mx-auto mb-1 opacity-50" />
                        <p className="text-xs">Nenhuma versão salva</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instruções */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <h3 className="font-medium mb-1">Colaboração Real</h3>
                <p className="text-gray-600">
                  WebSocket em tempo real para sincronização instantânea entre usuários
                </p>
              </div>
              
              <div className="text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-medium mb-1">Comentários Persistentes</h3>
                <p className="text-gray-600">
                  Sistema real de comentários salvos no banco de dados
                </p>
              </div>
              
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <h3 className="font-medium mb-1">Controle de Versões</h3>
                <p className="text-gray-600">
                  Histórico completo de mudanças com snapshots automáticos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
