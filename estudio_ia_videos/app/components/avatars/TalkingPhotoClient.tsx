
"use client";

import React, { useEffect, useRef } from "react";

interface TalkingPhotoClientProps {
  src?: string;
  scriptContent?: string;
  onMount?: () => void;
  className?: string;
}

/**
 * 🎭 TALKING PHOTO CLIENT-ONLY WRAPPER
 * Resolve hydration error isolando scripts/SDKs externos no cliente
 */
export default function TalkingPhotoClient({ 
  src, 
  scriptContent,
  onMount, 
  className 
}: TalkingPhotoClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (src && containerRef.current) {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      containerRef.current.appendChild(script);
    }

    if (scriptContent) {
      const inlineScript = document.createElement("script");
      inlineScript.textContent = scriptContent;
      containerRef.current?.appendChild(inlineScript);
    }

    onMount?.();

    return () => {
      // Cleanup scripts ao desmontar
      if (containerRef.current) {
        containerRef.current.querySelectorAll('script').forEach(s => s.remove());
      }
    };
  }, [src, scriptContent, onMount]);

  return (
    <div 
      ref={containerRef} 
      className={className}
      suppressHydrationWarning
    />
  );
}
