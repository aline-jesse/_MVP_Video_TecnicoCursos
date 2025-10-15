
/**
 * 🧪 Página de Teste do Editor Animaker
 * Teste rápido com dados mock para desenvolvimento
 */

'use client'

import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Play, TestTube } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { AnimakerProject } from '@/lib/pptx-parser-animaker'

export default function TestPPTXAnimaker() {
  const router = useRouter()

  const createMockProject = (): AnimakerProject => {
    return {
      id: `test_project_${Date.now()}`,
      title: 'NR-12 Segurança em Máquinas (Teste)',
      description: 'Projeto de teste para validar o editor Animaker',
      slides: [
        {
          id: 'slide_test_1',
          index: 0,
          title: 'Introdução à NR-12',
          layout: 'title-content',
          background: {
            type: 'gradient',
            value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            opacity: 1
          },
          elements: [
            {
              id: 'title_test_1',
              type: 'text',
              content: 'Segurança em Máquinas e Equipamentos',
              position: { x: 100, y: 150, width: 800, height: 120 },
              style: {
                fontSize: 42,
                fontFamily: 'Arial',
                color: '#ffffff'
              },
              animation: {
                type: 'fadeIn',
                duration: 1200,
                delay: 0,
                easing: 'ease-in-out'
              },
              interactive: { clickable: true },
              metadata: {
                originalIndex: 0,
                slideId: 'slide_test_1',
                elementId: 'title_test_1',
                visible: true,
                locked: false
              }
            },
            {
              id: 'subtitle_test_1',
              type: 'text',
              content: 'Norma Regulamentadora 12 - Requisitos mínimos para operação segura',
              position: { x: 100, y: 300, width: 800, height: 80 },
              style: {
                fontSize: 24,
                fontFamily: 'Arial',
                color: '#e0e0e0'
              },
              animation: {
                type: 'slideIn',
                duration: 1000,
                delay: 500,
                easing: 'ease-out'
              },
              interactive: { clickable: true },
              metadata: {
                originalIndex: 1,
                slideId: 'slide_test_1',
                elementId: 'subtitle_test_1',
                visible: true,
                locked: false
              }
            },
            {
              id: 'image_test_1',
              type: 'image',
              content: '/nr12-intro.jpg',
              position: { x: 950, y: 200, width: 300, height: 250 },
              style: {
                borderRadius: 12
              },
              animation: {
                type: 'zoomIn',
                duration: 800,
                delay: 1000,
                easing: 'ease-in-out'
              },
              interactive: { clickable: true },
              metadata: {
                originalIndex: 2,
                slideId: 'slide_test_1',
                elementId: 'image_test_1',
                visible: true,
                locked: false
              }
            }
          ],
          duration: 12,
          transition: {
            type: 'fade',
            duration: 800
          },
          voiceover: {
            text: 'Bem-vindos ao treinamento sobre a Norma Regulamentadora 12, que estabelece os requisitos mínimos para garantir a segurança no trabalho com máquinas e equipamentos.',
            voice: 'pt-BR-AntonioNeural',
            speed: 1.0,
            pitch: 1.0
          }
        },
        {
          id: 'slide_test_2',
          index: 1,
          title: 'Equipamentos de Proteção',
          layout: 'two-column',
          background: {
            type: 'color',
            value: '#f8f9fa',
            opacity: 1
          },
          elements: [
            {
              id: 'title_test_2',
              type: 'text',
              content: 'Equipamentos de Proteção Individual - EPI',
              position: { x: 50, y: 80, width: 1000, height: 80 },
              style: {
                fontSize: 36,
                fontFamily: 'Arial',
                color: '#2c3e50'
              },
              animation: {
                type: 'slideIn',
                duration: 1000,
                delay: 0,
                easing: 'ease-out'
              },
              interactive: { clickable: true },
              metadata: {
                originalIndex: 0,
                slideId: 'slide_test_2',
                elementId: 'title_test_2',
                visible: true,
                locked: false
              }
            },
            {
              id: 'list_test_2',
              type: 'text',
              content: '• Capacete de segurança\n• Óculos de proteção\n• Protetor auricular\n• Luvas de segurança\n• Calçado de segurança\n• Vestimentas adequadas',
              position: { x: 50, y: 200, width: 500, height: 300 },
              style: {
                fontSize: 22,
                fontFamily: 'Arial',
                color: '#34495e'
              },
              animation: {
                type: 'fadeIn',
                duration: 1500,
                delay: 800,
                easing: 'ease-in-out'
              },
              interactive: { clickable: true },
              metadata: {
                originalIndex: 1,
                slideId: 'slide_test_2',
                elementId: 'list_test_2',
                visible: true,
                locked: false
              }
            },
            {
              id: 'shape_test_2',
              type: 'shape',
              content: '',
              position: { x: 600, y: 200, width: 600, height: 400 },
              style: {
                backgroundColor: '#3498db',
                borderRadius: 16,
                opacity: 0.1
              },
              animation: {
                type: 'bounceIn',
                duration: 1200,
                delay: 1200,
                easing: 'ease-out'
              },
              interactive: { clickable: true },
              metadata: {
                originalIndex: 2,
                slideId: 'slide_test_2',
                elementId: 'shape_test_2',
                visible: true,
                locked: false
              }
            }
          ],
          duration: 15,
          transition: {
            type: 'slide-left',
            duration: 600
          },
          voiceover: {
            text: 'Os Equipamentos de Proteção Individual são fundamentais para a segurança do trabalhador. Cada EPI tem sua função específica e deve ser utilizado conforme as orientações técnicas.',
            voice: 'pt-BR-FranciscaNeural',
            speed: 0.9,
            pitch: 1.0
          }
        }
      ],
      timeline: {
        totalDuration: 27,
        layers: []
      },
      assets: {
        images: [
          {
            id: 'img_nr12_intro',
            name: 'nr12-intro.jpg',
            url: '/nr12-intro.jpg',
            size: 245760
          }
        ],
        videos: [],
        audio: [],
        fonts: ['Arial', 'Helvetica', 'Times New Roman', 'Calibri']
      },
      settings: {
        fps: 30,
        resolution: '1080p',
        aspectRatio: '16:9',
        quality: 'high'
      },
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        author: 'Sistema de Teste',
        version: '1.0-test',
        fileSize: 0
      }
    }
  }

  const handleLoadTestProject = () => {
    const mockProject = createMockProject()
    
    // Salvar no localStorage
    localStorage.setItem(`project_${mockProject.id}`, JSON.stringify(mockProject))
    
    toast.success('Projeto de teste criado!')
    
    // Redirecionar para o editor
    router.push(`/pptx-editor-animaker?projectId=${mockProject.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TestTube className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Teste do Editor Animaker
            </h1>
          </div>
          
          <p className="text-lg text-gray-600 mb-6">
            Carregue um projeto de teste para validar todas as funcionalidades do editor
          </p>
          
          <div className="flex items-center justify-center gap-3">
            <Badge className="bg-blue-100 text-blue-700">
              Projeto Mock NR-12
            </Badge>
            <Badge variant="outline">
              2 slides • 27s • Elementos interativos
            </Badge>
          </div>
        </div>

        {/* Test Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">✅ Funcionalidades Testadas</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Canvas interativo com drag & drop</li>
              <li>• Elementos redimensionáveis</li>
              <li>• Timeline multicamadas</li>
              <li>• Animações e transições</li>
              <li>• Propriedades editáveis</li>
              <li>• Sistema de salvamento</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">🎬 Conteúdo do Teste</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Slide 1: Título com gradiente</li>
              <li>• Slide 2: Layout duas colunas</li>
              <li>• Elementos: texto, imagem, shape</li>
              <li>• Animações: fadeIn, slideIn, zoomIn</li>
              <li>• Narração configurada</li>
              <li>• Assets organizados</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
            onClick={handleLoadTestProject}
          >
            <Play className="h-5 w-5 mr-2" />
            Carregar Projeto de Teste
          </Button>
          
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
            
            <Link href="/pptx-upload-animaker">
              <Button variant="outline">
                Fazer Upload Real
              </Button>
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Este projeto de teste permite validar o editor sem precisar fazer upload de arquivo PPTX.
            <br />
            Ideal para desenvolvimento e demonstrações.
          </p>
        </div>
      </div>
    </div>
  )
}
