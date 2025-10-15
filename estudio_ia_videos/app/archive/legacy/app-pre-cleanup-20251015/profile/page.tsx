
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import AppShell from '../../components/layouts/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Separator } from '../../components/ui/separator'
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Building, 
  Crown,
  Edit,
  Save,
  Upload
} from 'lucide-react'

export default function ProfilePage() {
  const { data: session } = useSession() || {}
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: session?.user?.name || 'Usuário Demo',
    email: session?.user?.email || 'usuario@exemplo.com',
    company: 'Empresa Demo Ltda',
    position: 'Coordenador de Segurança',
    location: 'São Paulo, SP',
    phone: '+55 11 99999-9999',
    joinDate: '15 de Janeiro de 2024'
  })

  const handleSave = () => {
    // Aqui implementaria a lógica de salvamento
    setIsEditing(false)
    console.log('Perfil salvo:', profile)
  }

  const userInitials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const stats = [
    { label: 'Vídeos Criados', value: '47', color: 'text-blue-600' },
    { label: 'Horas de Conteúdo', value: '12.5h', color: 'text-green-600' },
    { label: 'Projetos Ativos', value: '8', color: 'text-purple-600' },
    { label: 'Templates Salvos', value: '23', color: 'text-orange-600' }
  ]

  return (
    <AppShell
      title="Perfil do Usuário"
      description="Gerencie suas informações pessoais e configurações"
      showBreadcrumbs={true}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header do Perfil */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback className="text-2xl bg-gradient-primary text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Alterar Foto
                </Button>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                    <p className="text-muted-foreground">{profile.position}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Plano Pro
                      </Badge>
                      <Badge variant="secondary">
                        Membro desde {profile.joinDate}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "default" : "outline"}
                  >
                    {isEditing ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </>
                    )}
                  </Button>
                </div>

                {/* Estatísticas Rápidas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  value={profile.position}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: 'Criou vídeo "Segurança em Máquinas - NR12"',
                  time: '2 horas atrás',
                  type: 'video'
                },
                {
                  action: 'Fez upload de apresentação PPTX',
                  time: '1 dia atrás', 
                  type: 'upload'
                },
                {
                  action: 'Configurou nova voz no TTS Studio',
                  time: '3 dias atrás',
                  type: 'tts'
                },
                {
                  action: 'Exportou projeto "Trabalho em Altura"',
                  time: '1 semana atrás',
                  type: 'export'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
