'use client';

import React, { useState, useEffect, useRef } from 'react';

interface RealTimeRenderingProps {
  audioSource?: string;
  avatarId?: string;
  onRenderComplete?: (videoUrl: string) => void;
  className?: string;
}

export default function RealTimeRendering({
  audioSource,
  avatarId = 'default',
  onRenderComplete,
  className = ''
}: RealTimeRenderingProps) {
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (audioSource && isRendering) {
      simulateRealTimeRendering();
    }
  }, [audioSource, isRendering]);

  const simulateRealTimeRendering = async () => {
    // Simulação de rendering em tempo real
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(i);
    }

    const mockVideoUrl = `/videos/rendered/${avatarId}_${Date.now()}.mp4`;
    setVideoUrl(mockVideoUrl);
    setIsRendering(false);
    
    if (onRenderComplete) {
      onRenderComplete(mockVideoUrl);
    }
  };

  const startRendering = () => {
    setIsRendering(true);
    setProgress(0);
    setVideoUrl(null);
  };

  return (
    <div className={`real-time-rendering ${className}`}>
      <div className="rendering-container">
        <h3 className="text-lg font-semibold mb-4">Real-Time Rendering</h3>
        
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full border rounded-lg bg-gray-900"
        />

        {isRendering && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Renderizando...</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {videoUrl && (
          <div className="mt-4">
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg"
            />
          </div>
        )}

        <button
          onClick={startRendering}
          disabled={isRendering || !audioSource}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isRendering ? 'Renderizando...' : 'Iniciar Rendering'}
        </button>
      </div>
    </div>
  );
}
