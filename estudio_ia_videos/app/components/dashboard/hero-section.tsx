
'use client'

import { Button } from '@/components/ui/button'
import { PlusCircle, Upload, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HeroSectionProps {
  userName?: string
}

export function HeroSection({ userName = 'Usuário' }: HeroSectionProps) {
  const router = useRouter()

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            👋 Bem-vindo, {userName}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Crie vídeos profissionais de treinamento em segurança do trabalho com IA
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            size="lg" 
            className="gap-2"
            onClick={() => router.push('/editor-canvas')}
          >
            <PlusCircle className="h-5 w-5" />
            Novo Vídeo
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="gap-2"
            onClick={() => router.push('/pptx-upload')}
          >
            <Upload className="h-5 w-5" />
            Upload PPTX
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="gap-2"
            onClick={() => router.push('/templates')}
          >
            <FileText className="h-5 w-5" />
            Templates
          </Button>
        </div>
      </div>
    </div>
  )
}
