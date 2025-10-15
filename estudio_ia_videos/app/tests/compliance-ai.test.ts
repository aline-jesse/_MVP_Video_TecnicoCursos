/**
 * Testes para o Sistema de Compliance com IA
 */

import { checkCompliance } from '@/lib/compliance/nr-engine'
import { analyzeCompleteContent } from '@/lib/compliance/ai-analysis'
import { generateComplianceReport } from '@/lib/compliance/report-generator'

// Mock data for testing
const mockProjectContent = {
  slides: [
    {
      number: 1,
      title: "Introdução à Segurança em Máquinas",
      content: "Este curso aborda os principais aspectos de segurança em máquinas e equipamentos conforme NR-12. Vamos aprender sobre dispositivos de proteção, EPIs necessários e procedimentos de segurança.",
      duration: 300,
      imageUrls: ["https://example.com/epi-image.jpg"],
      audioPath: "/audio/slide1.mp3"
    },
    {
      number: 2,
      title: "Dispositivos de Proteção",
      content: "Os dispositivos de proteção são fundamentais para prevenir acidentes. Incluem proteções fixas, móveis e dispositivos de intertravamento.",
      duration: 240,
      imageUrls: ["https://example.com/protection-device.jpg"],
      audioPath: "/audio/slide2.mp3"
    },
    {
      number: 3,
      title: "Procedimentos de Manutenção",
      content: "A manutenção preventiva deve ser realizada por profissionais qualificados, seguindo procedimentos específicos de bloqueio e etiquetagem.",
      duration: 180,
      imageUrls: [],
      audioPath: "/audio/slide3.mp3"
    }
  ],
  totalDuration: 720,
  imageUrls: ["https://example.com/epi-image.jpg", "https://example.com/protection-device.jpg"],
  audioFiles: ["/audio/slide1.mp3", "/audio/slide2.mp3", "/audio/slide3.mp3"]
}

// Função auxiliar para executar testes manuais
export async function runManualComplianceTest() {
  console.log('🧪 Executando teste manual do sistema de compliance...')
  
  try {
    const result = await checkCompliance('NR-12', mockProjectContent, true)
    
    console.log('📊 Resultado da Análise:')
    console.log(`- Status: ${result.status}`)
    console.log(`- Score Tradicional: ${result.score}%`)
    console.log(`- Score IA: ${result.aiScore}%`)
    console.log(`- Score Final: ${result.finalScore}%`)
    console.log(`- Confiança: ${(result.confidence! * 100).toFixed(1)}%`)
    console.log(`- Requisitos: ${result.requirementsMet}/${result.requirementsTotal}`)
    
    if (result.recommendations.length > 0) {
      console.log('\n💡 Recomendações:')
      result.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`)
      })
    }
    
    return result
  } catch (error) {
    console.error('❌ Erro no teste:', error)
    throw error
  }
}