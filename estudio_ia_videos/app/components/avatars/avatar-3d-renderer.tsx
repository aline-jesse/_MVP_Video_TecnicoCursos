
/**
 * 🤖 Avatar 3D Renderer Component (Simplified)
 * Renderização simplificada de avatares sem Three.js
 */

'use client';

import React, { useState, useEffect } from 'react';

interface Avatar3DRendererProps {
  avatar: {
    id: string;
    name: string;
    gender: string;
    bodyType: string;
    height: number;
    topWear: string;
    bottomWear: string;
    shoes: string;
    accessories: string[];
    defaultExpression: string;
    skinTone: string;
    hairColor: string;
    eyeColor: string;
    blinkRate: number;
  };
  talkingSession: {
    isPlaying?: boolean;
    currentTime?: number;
    duration?: number;
  };
  animationSpeed: number;
}

export default function Avatar3DRenderer({ 
  avatar, 
  talkingSession, 
  animationSpeed 
}: Avatar3DRendererProps) {
  const [currentExpression, setCurrentExpression] = useState('neutral');
  const [lipSyncIntensity, setLipSyncIntensity] = useState(0);

  // Simulação de sincronização labial
  useEffect(() => {
    if (talkingSession?.isPlaying) {
      const interval = setInterval(() => {
        // Simular intensidade da fala
        const intensity = Math.random() * 0.8 + 0.2;
        setLipSyncIntensity(intensity);
        
        // Variar expressões durante a fala
        const expressions = ['neutral', 'smile', 'talking', 'thinking'];
        if (Math.random() > 0.7) {
          setCurrentExpression(expressions[Math.floor(Math.random() * expressions.length)]);
        }
      }, 100);

      return () => clearInterval(interval);
    } else {
      setLipSyncIntensity(0);
      setCurrentExpression('neutral');
    }
  }, [talkingSession?.isPlaying]);

  return (
    <div className="avatar-3d-container w-full h-full bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
      <div className="avatar-display text-center">
        <div className="avatar-icon mb-4">
          <div 
            className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${
              avatar.gender === 'female' ? 'from-pink-200 to-purple-300' : 'from-blue-200 to-indigo-300'
            } flex items-center justify-center transition-all duration-200`}
            style={{
              transform: `scale(${1 + lipSyncIntensity * 0.1})`,
              boxShadow: talkingSession?.isPlaying ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'
            }}
          >
            <span className="text-4xl">
              {avatar.gender === 'female' ? '👩' : '👨'}
            </span>
          </div>
        </div>
        
        <div className="avatar-info">
          <h3 className="font-semibold text-lg text-gray-800">{avatar.name}</h3>
          <p className="text-sm text-gray-600 capitalize">
            {avatar.bodyType} • {avatar.skinTone} • {avatar.height}cm
          </p>
          <div className="mt-2 text-xs text-gray-500">
            Expressão: {currentExpression}
          </div>
          
          {talkingSession?.isPlaying && (
            <div className="mt-3">
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Falando...</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-green-500 h-1 rounded-full transition-all duration-100"
                  style={{ width: `${lipSyncIntensity * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="avatar-clothing mt-4 text-xs text-gray-500">
          <div>👔 {avatar.topWear} • 👖 {avatar.bottomWear}</div>
          <div>👞 {avatar.shoes}</div>
          {avatar.accessories.length > 0 && (
            <div>✨ {avatar.accessories.join(', ')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
