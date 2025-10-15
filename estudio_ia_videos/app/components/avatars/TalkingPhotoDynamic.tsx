
"use client";

import dynamic from "next/dynamic";

/**
 * 🎭 TALKING PHOTO DYNAMIC WRAPPER (SSR=FALSE)
 * Garante que o componente seja renderizado apenas no cliente
 */
export default dynamic(() => import("./TalkingPhotoClient"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
      <div className="text-center">
        <div className="animate-pulse h-12 w-12 bg-blue-600 rounded-full mx-auto mb-3"></div>
        <p className="text-sm text-gray-600 font-medium">Carregando Talking Photo...</p>
      </div>
    </div>
  )
});
