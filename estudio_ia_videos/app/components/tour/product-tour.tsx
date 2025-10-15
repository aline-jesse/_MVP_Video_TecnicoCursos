
'use client';

/**
 * 🎯 SPRINT 39 - Product Tour
 * Tour guiado interativo do editor
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ProductTourProps {
  steps: TourStep[];
  onComplete?: () => void;
}

export function ProductTour({ steps, onComplete }: ProductTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleStartTour = () => {
      setIsActive(true);
      setCurrentStep(0);
    };

    window.addEventListener('start-product-tour', handleStartTour);
    
    return () => {
      window.removeEventListener('start-product-tour', handleStartTour);
    };
  }, []);

  useEffect(() => {
    if (!isActive || !steps[currentStep]) return;

    const updatePosition = () => {
      const target = document.querySelector(steps[currentStep].target);
      if (!target) return;

      const rect = target.getBoundingClientRect();
      setTargetPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });

      // Scroll to target
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isActive, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    localStorage.setItem('product-tour-completed', 'true');
  };

  const handleComplete = () => {
    setIsActive(false);
    localStorage.setItem('product-tour-completed', 'true');
    onComplete?.();
  };

  if (!isActive || !steps[currentStep]) return null;

  const step = steps[currentStep];

  const getTooltipPosition = () => {
    const padding = 16;

    switch (step.position) {
      case 'top':
        return {
          top: targetPosition.top - padding,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: targetPosition.top + targetPosition.height + padding,
          left: targetPosition.left + targetPosition.width / 2,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left - padding,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: targetPosition.top + targetPosition.height / 2,
          left: targetPosition.left + targetPosition.width + padding,
          transform: 'translate(0, -50%)',
        };
    }
  };

  const tooltipPosition = getTooltipPosition();

  return (
    <AnimatePresence>
      {/* Overlay */}
      <div className="fixed inset-0 z-[60] pointer-events-none">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Highlight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute border-4 border-blue-500 rounded-lg shadow-2xl pointer-events-none"
          style={{
            top: targetPosition.top - 4,
            left: targetPosition.left - 4,
            width: targetPosition.width + 8,
            height: targetPosition.height + 8,
          }}
        />

        {/* Tooltip */}
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute pointer-events-auto"
          style={tooltipPosition}
        >
          <Card className="w-80 p-6 shadow-2xl">
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center font-bold">
                  {currentStep + 1}
                </div>
                <h3 className="font-bold text-lg">{step.title}</h3>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {step.content}
              </p>
            </div>

            {/* Action button (optional) */}
            {step.action && (
              <Button
                onClick={step.action.onClick}
                variant="outline"
                className="w-full mb-4"
              >
                {step.action.label}
              </Button>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {currentStep + 1} de {steps.length}
              </div>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    onClick={handlePrevious}
                    variant="ghost"
                    size="sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Voltar
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  size="sm"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      Concluir
                      <Check className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Editor tour steps
export const editorTourSteps: TourStep[] = [
  {
    id: 'canvas',
    target: '#editor-canvas',
    title: 'Canvas de Edição',
    content: 'Aqui você visualiza e edita seu vídeo em tempo real. Use gestos de pinch para zoom e drag para mover elementos.',
    position: 'right',
  },
  {
    id: 'timeline',
    target: '#editor-timeline',
    title: 'Timeline Profissional',
    content: 'Timeline multi-track com suporte a vídeo, áudio, texto e efeitos. Arraste elementos para reorganizar.',
    position: 'top',
  },
  {
    id: 'sidebar',
    target: '#editor-sidebar',
    title: 'Biblioteca de Recursos',
    content: 'Acesse templates, avatares 3D, narração TTS, imagens e efeitos. Tudo organizado para facilitar sua criação.',
    position: 'left',
  },
  {
    id: 'toolbar',
    target: '#editor-toolbar',
    title: 'Barra de Ferramentas',
    content: 'Ferramentas de edição rápida: texto, formas, animações e transições. Tudo ao seu alcance.',
    position: 'bottom',
  },
  {
    id: 'export',
    target: '#export-button',
    title: 'Exportar Vídeo',
    content: 'Quando terminar, clique aqui para renderizar e baixar seu vídeo em alta qualidade. O processo é rápido e automático!',
    position: 'bottom',
  },
];
