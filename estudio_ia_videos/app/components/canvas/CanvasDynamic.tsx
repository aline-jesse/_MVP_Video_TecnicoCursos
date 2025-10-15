
"use client";

import dynamic from "next/dynamic";

/**
 * 🎨 CANVAS DYNAMIC WRAPPER
 * Garante que o Fabric.js seja carregado apenas no cliente (SSR=false)
 */
export default dynamic(() => import("./CanvasClient"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[450px] bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Carregando Canvas Editor...</p>
      </div>
    </div>
  )
});
