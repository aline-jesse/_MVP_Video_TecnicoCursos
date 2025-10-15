
'use client'

import React from 'react'
import AppShell from '@/components/layouts/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <AppShell 
      title="Política de Privacidade"
      description="Política de privacidade e proteção de dados"
    >
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
          <p className="text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Proteção de Dados
            </CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>1. Informações que Coletamos</h2>
            <p>
              Coletamos informações necessárias para fornecer nossos serviços, incluindo dados de conta, arquivos carregados e métricas de uso.
            </p>

            <h2>2. Como Usamos suas Informações</h2>
            <p>
              Utilizamos suas informações para:
            </p>
            <ul>
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Processar seus arquivos e gerar vídeos</li>
              <li>Comunicar atualizações e suporte</li>
              <li>Garantir a segurança da plataforma</li>
            </ul>

            <h2>3. Compartilhamento de Dados</h2>
            <p>
              Não compartilhamos seus dados pessoais com terceiros, exceto quando necessário para fornecer nossos serviços ou quando exigido por lei.
            </p>

            <h2>4. Segurança</h2>
            <p>
              Implementamos medidas de segurança adequadas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>

            <h2>5. Seus Direitos</h2>
            <p>
              Você tem direito de acessar, corrigir, excluir ou solicitar a portabilidade de seus dados pessoais.
            </p>

            <h2>6. Contato</h2>
            <p>
              Para questões sobre privacidade, entre em contato conosco através do suporte técnico.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
