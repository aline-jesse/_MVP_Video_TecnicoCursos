'use client';

import { useEffect } from 'react';

export default function DashboardPage() {
  useEffect(() => {
    // Redirecionar para o arquivo HTML estático
    window.location.replace('/dashboard-ultra.html');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Carregando Dashboard
        </h1>
        <p className="text-gray-600">
          Redirecionando para dashboard-ultra.html...
        </p>
      </div>
    </div>
  );
}