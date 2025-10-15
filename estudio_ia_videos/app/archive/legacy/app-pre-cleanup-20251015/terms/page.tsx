
'use client'

import React from 'react'
import AppShell from '@/components/layouts/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <AppShell 
      title="Termos de Uso"
      description="Termos e condições de uso da plataforma"
    >
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Termos e Condições
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o Estúdio IA de Vídeos, você concorda em cumprir e ficar vinculado a estes termos de uso.
            </p>

            <h2>2. Descrição do Serviço</h2>
            <p>
              O Estúdio IA de Vídeos é uma plataforma que permite a criação de vídeos educacionais para treinamentos de segurança do trabalho utilizando tecnologia de inteligência artificial.
            </p>

            <h2>3. Uso Adequado</h2>
            <p>
              Você concorda em usar a plataforma apenas para fins legítimos e de acordo com todas as leis aplicáveis.
            </p>

            <h2>4. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo da plataforma é protegido por direitos autorais e outras leis de propriedade intelectual.
            </p>

            <h2>5. Limitação de Responsabilidade</h2>
            <p>
              A plataforma é fornecida "como está" sem garantias de qualquer tipo.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
