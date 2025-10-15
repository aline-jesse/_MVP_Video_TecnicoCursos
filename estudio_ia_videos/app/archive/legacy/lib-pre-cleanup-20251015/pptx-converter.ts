
// Importação condicional do mammoth
let mammoth: any = null;
try {
  mammoth = require('mammoth');
} catch (error) {
  console.warn('⚠️ mammoth não instalado. Conversão DOCX→PPTX desabilitada.');
}

import { SlideData } from './ai-services'

export interface PPTXSlide {
  slideNumber: number
  title: string
  content: string
  images: string[]
  notes: string
}

export class PPTXConverter {
  
  // Converter arquivo PPTX para dados de slides
  static async convertPPTXToSlides(buffer: Buffer): Promise<SlideData[]> {
    try {
      // Para o MVP, vamos simular a conversão
      // Em produção, usaria bibliotecas mais robustas como node-pptx ou python-pptx via API
      
      console.log('Iniciando conversão PPTX...')
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Dados simulados baseados em um PPTX de NR-12
      const mockSlides: SlideData[] = [
        {
          id: '1',
          title: 'NR-12: Segurança de Máquinas e Equipamentos',
          content: 'Bem-vindos ao treinamento sobre a Norma Regulamentadora 12. Esta norma é fundamental para garantir a segurança dos trabalhadores que operam máquinas e equipamentos industriais.',
          duration: 20,
          imageUrl: '/images/nr12-intro.jpg'
        },
        {
          id: '2',
          title: 'Objetivos da NR-12',
          content: 'A NR-12 tem como objetivo principal estabelecer referências técnicas e medidas de proteção para garantir a saúde e integridade física dos trabalhadores, estabelecendo requisitos mínimos de segurança.',
          duration: 18,
          imageUrl: '/images/nr12-objetivos.jpg'
        },
        {
          id: '3',
          title: 'Arranjo Físico e Instalações',
          content: 'As máquinas devem ser projetadas e instaladas de forma que sua operação, manutenção e inspeção possam ser realizadas com segurança. O arranjo físico deve considerar espaços adequados para circulação.',
          duration: 22,
          imageUrl: '/images/nr12-arranjo.jpg'
        },
        {
          id: '4',
          title: 'Instalações e Dispositivos Elétricos',
          content: 'As instalações elétricas das máquinas devem estar em conformidade com a NR-10. Todos os circuitos elétricos devem possuir proteções contra sobrecorrente, sobretensão e falta de fase.',
          duration: 19,
          imageUrl: '/images/nr12-eletrico.jpg'
        },
        {
          id: '5',
          title: 'Dispositivos de Partida, Acionamento e Parada',
          content: 'As máquinas devem ser equipadas com dispositivos de partida e parada que garantam operação segura. Os comandos de partida devem possuir proteção contra acionamento acidental.',
          duration: 21,
          imageUrl: '/images/nr12-partida.jpg'
        },
        {
          id: '6',
          title: 'Sistemas de Segurança',
          content: 'Implementação obrigatória de proteções físicas fixas e móveis, dispositivos de segurança interligados, sistemas de parada de emergência e monitoramento contínuo.',
          duration: 24,
          imageUrl: '/images/nr12-seguranca.jpg'
        },
        {
          id: '7',
          title: 'Capacitação e Treinamento',
          content: 'É obrigatória a capacitação adequada dos operadores. O treinamento deve abordar riscos, medidas de proteção, procedimentos seguros de trabalho e situações de emergência.',
          duration: 20,
          imageUrl: '/images/nr12-treinamento.jpg'
        },
        {
          id: '8',
          title: 'Procedimentos de Trabalho e Segurança',
          content: 'Devem ser elaborados procedimentos de trabalho específicos, contemplando instruções de segurança, métodos de trabalho e medidas preventivas para todas as atividades.',
          duration: 18,
          imageUrl: '/images/nr12-procedimentos.jpg'
        }
      ]
      
      return mockSlides
      
    } catch (error) {
      console.error('Erro na conversão PPTX:', error)
      throw new Error('Falha na conversão do arquivo PPTX')
    }
  }

  // Extrair texto de documento Word (para testes)
  static async extractTextFromDOCX(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    } catch (error) {
      console.error('Erro na extração de texto DOCX:', error)
      throw new Error('Falha na extração de texto')
    }
  }

  // Validar arquivo PPTX
  static validatePPTXFile(fileName: string, fileSize: number): boolean {
    const validExtensions = ['.pptx', '.ppt']
    const maxSize = 50 * 1024 * 1024 // 50MB
    
    const hasValidExtension = validExtensions.some(ext => 
      fileName.toLowerCase().endsWith(ext)
    )
    
    const isValidSize = fileSize <= maxSize
    
    return hasValidExtension && isValidSize
  }

  // Gerar metadados do arquivo
  static generateFileMetadata(fileName: string, fileSize: number) {
    return {
      fileName,
      fileSize,
      uploadedAt: new Date().toISOString(),
      fileId: `pptx_${Date.now()}`,
      status: 'uploaded'
    }
  }
}
