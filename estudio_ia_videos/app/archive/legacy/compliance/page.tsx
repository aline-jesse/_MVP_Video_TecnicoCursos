
'use client';

import { useState } from 'react';
import { ComplianceValidator } from '@/components/compliance/compliance-validator';
import { ComplianceDashboard } from '@/components/compliance/compliance-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, BarChart3, CheckSquare } from 'lucide-react';

export default function CompliancePage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Shield className="w-10 h-10 text-blue-600" />
          Compliance NR Inteligente
        </h1>
        <p className="text-muted-foreground">
          Sistema avançado de validação e monitoramento de conformidade com as Normas Regulamentadoras
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="validator" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Validador
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <ComplianceDashboard />
        </TabsContent>

        <TabsContent value="validator" className="space-y-6">
          <div className="grid gap-6 mb-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">NR-11</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">Transporte</p>
                <p className="text-xs text-muted-foreground">Movimentação de materiais</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">NR-12</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">Máquinas</p>
                <p className="text-xs text-muted-foreground">Segurança em equipamentos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">NR-33</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">Confinados</p>
                <p className="text-xs text-muted-foreground">Espaços restritos</p>
              </CardContent>
            </Card>
          </div>

          <ComplianceValidator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
