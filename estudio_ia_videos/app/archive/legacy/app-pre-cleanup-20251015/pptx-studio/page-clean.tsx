'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PPTXStudio() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card>
        <CardHeader>
          <CardTitle>PPTX Studio</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Sistema de conversão PPTX em desenvolvimento...</p>
        </CardContent>
      </Card>
    </div>
  );
}