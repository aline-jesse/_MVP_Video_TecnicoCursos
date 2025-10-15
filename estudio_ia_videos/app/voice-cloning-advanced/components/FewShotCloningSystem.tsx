'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const FewShotCloningSystem: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sistema de Clonagem Few-Shot</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Sistema de clonagem de voz com poucas amostras em desenvolvimento...</p>
      </CardContent>
    </Card>
  );
};