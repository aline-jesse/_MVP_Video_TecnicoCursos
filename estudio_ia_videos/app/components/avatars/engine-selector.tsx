
'use client'

/**
 * 🎬 Engine Selector - Vidnoz vs UE5+Audio2Face
 * Permite escolher entre geração rápida (Vidnoz) ou qualidade máxima (UE5)
 */

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Sparkles, Info, Clock, DollarSign, Star } from 'lucide-react'

interface EngineSelectorProps {
  onEngineChange: (engine: 'vidnoz' | 'ue5') => void
  defaultEngine?: 'vidnoz' | 'ue5'
}

export default function EngineSelector({ 
  onEngineChange,
  defaultEngine = 'vidnoz'
}: EngineSelectorProps) {
  const [selectedEngine, setSelectedEngine] = useState<'vidnoz' | 'ue5'>(defaultEngine)
  
  const handleSelect = (engine: 'vidnoz' | 'ue5') => {
    setSelectedEngine(engine)
    onEngineChange(engine)
  }
  
  return (
    <Card className="mb-6 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardContent className="pt-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Selecione o Motor de Renderização
          </h3>
          <p className="text-sm text-gray-600">
            Escolha entre geração rápida com qualidade profissional ou hiper-realismo de Hollywood
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ========================================
              VIDNOZ - RÁPIDO E PROFISSIONAL
              ======================================== */}
          <div
            onClick={() => handleSelect('vidnoz')}
            className={`
              relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
              hover:shadow-lg hover:-translate-y-1
              ${selectedEngine === 'vidnoz' 
                ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-200 shadow-xl' 
                : 'border-gray-300 bg-white hover:border-blue-400'
              }
            `}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <Badge variant="default" className="bg-green-500 text-white">
                Recomendado
              </Badge>
            </div>
            
            {/* Title */}
            <h4 className="font-bold text-xl mb-2 text-gray-900">
              Vidnoz (Rápido)
            </h4>
            <p className="text-sm text-gray-600 mb-5">
              Geração rápida com qualidade profissional. Ideal para produção em escala.
            </p>
            
            {/* Métricas */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Tempo:</span>
                </div>
                <span className="font-semibold text-blue-600">~2 min</span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Qualidade:</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold">8/10</span>
                  <span className="text-yellow-500">⭐⭐⭐⭐</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Custo:</span>
                </div>
                <span className="font-semibold text-green-600">$0.20/vídeo</span>
              </div>
            </div>
            
            {/* Features */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">85% lip sync accuracy</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">30 expressões faciais</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Até 4K de resolução</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Entrega imediata</span>
              </div>
            </div>
            
            {/* Badge de seleção */}
            {selectedEngine === 'vidnoz' && (
              <div className="mt-4 p-3 bg-blue-600 text-white rounded-lg text-center font-semibold">
                ✓ Selecionado
              </div>
            )}
          </div>
          
          {/* ========================================
              UE5 + AUDIO2FACE - ULTRA QUALIDADE
              ======================================== */}
          <div
            onClick={() => handleSelect('ue5')}
            className={`
              relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
              hover:shadow-lg hover:-translate-y-1
              ${selectedEngine === 'ue5' 
                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 ring-4 ring-purple-200 shadow-xl' 
                : 'border-gray-300 bg-white hover:border-purple-400'
              }
            `}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                Ultra HD
              </Badge>
            </div>
            
            {/* Title */}
            <h4 className="font-bold text-xl mb-2 text-gray-900">
              UE5 + Audio2Face
            </h4>
            <p className="text-sm text-gray-600 mb-5">
              Hiper-realismo com tecnologia de Hollywood. MetaHuman + Ray Tracing.
            </p>
            
            {/* Métricas */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600">Tempo:</span>
                </div>
                <span className="font-semibold text-purple-600">~3 min</span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Qualidade:</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold">10/10</span>
                  <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Custo:</span>
                </div>
                <span className="font-semibold text-green-600">$0.07/vídeo</span>
              </div>
            </div>
            
            {/* Features */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">99.5% lip sync accuracy 🔥</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">150+ expressões faciais 🔥</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">Até 8K + Ray Tracing 🔥</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">Física cabelo/roupa 🔥</span>
              </div>
            </div>
            
            {/* Info Box */}
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-purple-700 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-purple-800 leading-relaxed">
                  <strong>Tecnologia NVIDIA:</strong> MetaHuman + Audio2Face oferece 
                  sincronização labial de nível cinematográfico e realismo fotográfico.
                </p>
              </div>
            </div>
            
            {/* Badge de seleção */}
            {selectedEngine === 'ue5' && (
              <div className="mt-4 p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-center font-semibold">
                ✓ Selecionado
              </div>
            )}
          </div>
        </div>
        
        {/* ========================================
            TABELA DE COMPARAÇÃO DETALHADA
            ======================================== */}
        <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
          <h5 className="font-bold text-lg mb-4 flex items-center space-x-2">
            <Info className="h-5 w-5 text-purple-600" />
            <span>Comparação Técnica Detalhada</span>
          </h5>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Característica</th>
                  <th className="text-center py-3 px-4 font-semibold text-blue-700">Vidnoz</th>
                  <th className="text-center py-3 px-4 font-semibold text-purple-700">UE5 + Audio2Face</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">Realismo Visual</td>
                  <td className="text-center py-3 px-4">85%</td>
                  <td className="text-center py-3 px-4 font-bold text-purple-600">99% ⭐</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">Sincronização Labial</td>
                  <td className="text-center py-3 px-4">85%</td>
                  <td className="text-center py-3 px-4 font-bold text-purple-600">99.5% ⭐</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">Expressões Faciais</td>
                  <td className="text-center py-3 px-4">30 expressões</td>
                  <td className="text-center py-3 px-4 font-bold text-purple-600">150+ expressões ⭐</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">Física Cabelo/Roupa</td>
                  <td className="text-center py-3 px-4">Estática</td>
                  <td className="text-center py-3 px-4 font-bold text-purple-600">Dinâmica ⭐</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">Iluminação</td>
                  <td className="text-center py-3 px-4">Pré-definida</td>
                  <td className="text-center py-3 px-4 font-bold text-purple-600">Ray Tracing ⭐</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">Personalização</td>
                  <td className="text-center py-3 px-4">Limitada</td>
                  <td className="text-center py-3 px-4 font-bold text-purple-600">Total ⭐</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">Resolução Máxima</td>
                  <td className="text-center py-3 px-4">4K</td>
                  <td className="text-center py-3 px-4 font-bold text-purple-600">8K ⭐</td>
                </tr>
                <tr className="hover:bg-gray-50 bg-green-50">
                  <td className="py-3 px-4 text-gray-700 font-semibold">Custo por Vídeo</td>
                  <td className="text-center py-3 px-4">$0.20</td>
                  <td className="text-center py-3 px-4 font-bold text-green-600">$0.07 (65% mais barato) ⭐</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* ========================================
            BADGE DE RECOMENDAÇÃO
            ======================================== */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border-2 border-purple-200">
          <div className="flex items-start space-x-3">
            <Sparkles className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <h6 className="font-bold text-gray-900 mb-1">💡 Recomendação Inteligente</h6>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Use Vidnoz</strong> para produção rápida e em volume (treinamentos padrão, onboarding, etc.). 
                <strong className="text-purple-700"> Use UE5</strong> para conteúdo premium que exige máxima qualidade 
                (apresentações executivas, marketing, demonstrações técnicas críticas).
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
