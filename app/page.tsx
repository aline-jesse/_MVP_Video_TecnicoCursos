'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona para o dashboard principal da aplicação.
    // A regra de 'rewrites' no next.config.js cuidará de mapear para o diretório correto.
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Carregando a plataforma...
        </h1>
        <p className="text-gray-600">
          Você será redirecionado para o painel principal.
        </p>
      </div>
    </div>
  );
}

