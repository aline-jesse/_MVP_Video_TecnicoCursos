
/**
 * Hook para importação PPTX → Timeline
 */
'use client';

import { useState, useCallback } from 'react';
import type { 
  PPTXImportStep, 
  SlidePreview, 
  ImportConfig, 
  ConversionResult,
  ImportProgress 
} from '../types/import';

const IMPORT_STEPS: PPTXImportStep[] = [
  { id: 1, title: 'Upload', description: 'Enviar arquivo PPTX', status: 'pending' },
  { id: 2, title: 'Análise', description: 'Analisar slides', status: 'pending' },
  { id: 3, title: 'Configuração', description: 'Configurar importação', status: 'pending' },
  { id: 4, title: 'Conversão', description: 'Converter para timeline', status: 'pending' },
  { id: 5, title: 'Finalização', description: 'Criar projeto', status: 'pending' },
];

export function usePPTXImport() {
  const [steps, setSteps] = useState<PPTXImportStep[]>(IMPORT_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [slides, setSlides] = useState<SlidePreview[]>([]);
  const [config, setConfig] = useState<ImportConfig>({
    slideDuration: 5,
    transition: 'fade',
    transitionDuration: 0.5,
    addAudio: false,
    audioType: 'none',
  });
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const updateStepStatus = useCallback((stepId: number, status: PPTXImportStep['status']) => {
    setSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, status } : step
      )
    );
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      updateStepStatus(steps[stepIndex].id, 'active');
    }
  }, [steps, updateStepStatus]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      updateStepStatus(steps[currentStep].id, 'completed');
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      updateStepStatus(steps[nextIndex].id, 'active');
    }
  }, [currentStep, steps, updateStepStatus]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      updateStepStatus(steps[currentStep].id, 'pending');
      const prevIndex = currentStep - 1;
      setCurrentStep(prevIndex);
      updateStepStatus(steps[prevIndex].id, 'active');
    }
  }, [currentStep, steps, updateStepStatus]);

  // STEP 1: Upload PPTX
  const uploadPPTX = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);
      updateStepStatus(1, 'active');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/pptx/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro no upload');
      }

      const data = await response.json();
      
      updateStepStatus(1, 'completed');
      nextStep();
      
      return data;
    } catch (error) {
      updateStepStatus(1, 'error');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [nextStep, updateStepStatus]);

  // STEP 2: Analisar slides
  const analyzeSlides = useCallback(async (pptxId: string) => {
    try {
      setIsProcessing(true);
      updateStepStatus(2, 'active');

      const response = await fetch(`/api/pptx/analyze/${pptxId}`);
      
      if (!response.ok) {
        throw new Error('Erro na análise');
      }

      const data = await response.json();
      
      // Converter para SlidePreview
      const slidePreviews: SlidePreview[] = data.slides.map((slide: any, index: number) => ({
        slideNumber: index + 1,
        thumbnailUrl: slide.thumbnail || '/placeholder-slide.png',
        title: slide.title || `Slide ${index + 1}`,
        duration: config.slideDuration,
        selected: true,
        notes: slide.notes,
      }));

      setSlides(slidePreviews);
      updateStepStatus(2, 'completed');
      nextStep();
      
      return slidePreviews;
    } catch (error) {
      updateStepStatus(2, 'error');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [config.slideDuration, nextStep, updateStepStatus]);

  // STEP 3: Configurar (usuário ajusta config)
  const updateConfig = useCallback((newConfig: Partial<ImportConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const toggleSlideSelection = useCallback((slideNumber: number) => {
    setSlides(prev =>
      prev.map(slide =>
        slide.slideNumber === slideNumber
          ? { ...slide, selected: !slide.selected }
          : slide
      )
    );
  }, []);

  const updateSlideDuration = useCallback((slideNumber: number, duration: number) => {
    setSlides(prev =>
      prev.map(slide =>
        slide.slideNumber === slideNumber
          ? { ...slide, duration }
          : slide
      )
    );
  }, []);

  // STEP 4: Converter para timeline
  const convertToTimeline = useCallback(async (pptxId: string, projectName: string) => {
    try {
      setIsProcessing(true);
      updateStepStatus(4, 'active');

      const selectedSlides = slides.filter(s => s.selected);

      const response = await fetch('/api/import/pptx-to-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pptxId,
          projectName,
          slides: selectedSlides,
          config,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na conversão');
      }

      const data = await response.json();
      
      updateStepStatus(4, 'completed');
      nextStep();
      
      setResult({
        success: true,
        projectId: data.projectId,
        timelineId: data.timelineId,
        clipsCreated: data.clipsCreated,
      });

      return data;
    } catch (error) {
      updateStepStatus(4, 'error');
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [slides, config, nextStep, updateStepStatus]);

  // Reset para nova importação
  const reset = useCallback(() => {
    setSteps(IMPORT_STEPS);
    setCurrentStep(0);
    setSlides([]);
    setConfig({
      slideDuration: 5,
      transition: 'fade',
      transitionDuration: 0.5,
      addAudio: false,
      audioType: 'none',
    });
    setProgress(null);
    setIsProcessing(false);
    setResult(null);
  }, []);

  return {
    // State
    steps,
    currentStep,
    slides,
    config,
    progress,
    isProcessing,
    result,

    // Actions
    goToStep,
    nextStep,
    prevStep,
    uploadPPTX,
    analyzeSlides,
    updateConfig,
    toggleSlideSelection,
    updateSlideDuration,
    convertToTimeline,
    reset,
  };
}
