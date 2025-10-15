
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TTSMultiProviderRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para Avatar TTS Studio (que já tem multi-provider)
    router.replace('/avatar-tts-studio');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecionando para TTS Studio...</p>
      </div>
    </div>
  );
}
