
'use client';

/**
 * 🚀 SPRINT 39 - Public Onboarding
 * Onboarding simplificado para novos usuários públicos
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, Sparkles, Video, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function PublicOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Verificar se já completou o onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboarding-completed');
    
    if (!hasCompletedOnboarding) {
      // Mostrar após 1 segundo
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao Estúdio IA! 👋',
      description: 'Crie vídeos profissionais de treinamento em segurança do trabalho usando inteligência artificial. Vamos fazer um tour rápido!',
      icon: <Sparkles className="w-12 h-12 text-blue-500" />,
    },
    {
      id: 'templates',
      title: 'Templates de NRs prontos 📋',
      description: 'Escolha entre dezenas de templates profissionais das Normas Regulamentadoras brasileiras. Personalize com sua marca e conteúdo.',
      icon: <Video className="w-12 h-12 text-purple-500" />,
    },
    {
      id: 'ai-powered',
      title: 'Inteligência Artificial ⚡',
      description: 'Avatares 3D hiper-realistas, narração profissional com TTS premium, e edição simplificada. Tudo automatizado pela IA.',
      icon: <Zap className="w-12 h-12 text-yellow-500" />,
    },
    {
      id: 'compliance',
      title: 'Conformidade garantida ✅',
      description: 'Todos os templates seguem rigorosamente as NRs. Conteúdo verificado e atualizado por especialistas em segurança do trabalho.',
      icon: <Shield className="w-12 h-12 text-green-500" />,
    },
  ];

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
    setIsOpen(false);
    localStorage.setItem('onboarding-completed', 'true');
  };

  const handleComplete = () => {
    setCompleted(true);
    localStorage.setItem('onboarding-completed', 'true');
    
    setTimeout(() => {
      setIsOpen(false);
      // Iniciar tour do editor
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('start-product-tour'));
      }
    }, 1500);
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl mx-4"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-8 shadow-2xl">
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Progress bar */}
            <div className="flex gap-2 mb-8">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index <= currentStep
                      ? 'bg-blue-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {!completed ? (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-6">
                    {currentStepData.icon}
                  </div>

                  <h2 className="text-3xl font-bold mb-4">
                    {currentStepData.title}
                  </h2>

                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    {currentStepData.description}
                  </p>

                  {/* Step indicator */}
                  <div className="text-sm text-gray-500 mb-8">
                    Passo {currentStep + 1} de {steps.length}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold mb-4">
                    Tudo pronto! 🎉
                  </h2>

                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Agora vamos fazer um tour rápido pelo editor...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            {!completed && (
              <div className="flex items-center justify-between mt-8">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-500"
                >
                  Pular tutorial
                </Button>

                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                    >
                      Voltar
                    </Button>
                  )}

                  <Button
                    onClick={handleNext}
                    className="min-w-[120px]"
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        Começar
                        <Check className="ml-2 w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Próximo
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
