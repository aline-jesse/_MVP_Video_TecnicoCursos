#!/usr/bin/env tsx

/**
 * Script de debug para analisar a estrutura XML do PPTX
 * FASE 1: PPTX Processing Real
 */

import fs from 'fs'
import path from 'path'
import JSZip from 'jszip'
import { parseStringPromise } from 'xml2js'

async function debugPPTXStructure() {
  console.log('🔍 Analisando estrutura XML do PPTX...\n')

  try {
    // Caminho para o arquivo PPTX de teste
    const testPptxPath = path.join(process.cwd(), '..', 'test-presentation.pptx')
    
    if (!fs.existsSync(testPptxPath)) {
      throw new Error(`Arquivo PPTX não encontrado: ${testPptxPath}`)
    }

    // Ler o arquivo PPTX
    const pptxBuffer = fs.readFileSync(testPptxPath)
    const zip = await JSZip.loadAsync(pptxBuffer)

    console.log('📁 ARQUIVOS NO PPTX:')
    Object.keys(zip.files).forEach(filename => {
      console.log(`  - ${filename}`)
    })

    // Analisar slide 1
    console.log('\n🔍 ANALISANDO SLIDE 1:')
    const slide1File = zip.file('ppt/slides/slide1.xml')
    
    if (slide1File) {
      const slide1Xml = await slide1File.async('text')
      console.log('\n📄 XML do Slide 1 (primeiros 1000 caracteres):')
      console.log(slide1Xml.substring(0, 1000) + '...')
      
      // Parse do XML
      const slide1Data = await parseStringPromise(slide1Xml)
      console.log('\n🔧 ESTRUTURA PARSEADA:')
      console.log(JSON.stringify(slide1Data, null, 2).substring(0, 2000) + '...')
      
      // Procurar por texto
      console.log('\n🔍 PROCURANDO TEXTO:')
      const findText = (obj: any, path: string = '') => {
        if (typeof obj !== 'object' || obj === null) return
        
        Object.keys(obj).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key
          
          if (key === 'a:t' && obj[key]) {
            console.log(`  📝 Texto encontrado em ${currentPath}: "${obj[key]}"`)
          }
          
          if (typeof obj[key] === 'object') {
            if (Array.isArray(obj[key])) {
              obj[key].forEach((item: any, index: number) => {
                findText(item, `${currentPath}[${index}]`)
              })
            } else {
              findText(obj[key], currentPath)
            }
          }
        })
      }
      
      findText(slide1Data)
      
      // Procurar por shapes
      console.log('\n🔍 PROCURANDO SHAPES:')
      const findShapes = (obj: any, path: string = '') => {
        if (typeof obj !== 'object' || obj === null) return
        
        Object.keys(obj).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key
          
          if (key === 'p:sp') {
            console.log(`  🔷 Shape encontrado em ${currentPath}`)
            if (obj[key]) {
              const shapes = Array.isArray(obj[key]) ? obj[key] : [obj[key]]
              shapes.forEach((shape: any, index: number) => {
                console.log(`    Shape ${index + 1}:`)
                if (shape['p:txBody']) {
                  console.log(`      - Tem texto body`)
                  findText(shape['p:txBody'], `${currentPath}[${index}].p:txBody`)
                }
                if (shape['p:nvSpPr']) {
                  const nvSpPr = shape['p:nvSpPr']
                  if (nvSpPr['p:cNvPr'] && nvSpPr['p:cNvPr'][0] && nvSpPr['p:cNvPr'][0].$) {
                    console.log(`      - Nome: ${nvSpPr['p:cNvPr'][0].$.name}`)
                  }
                }
              })
            }
          }
          
          if (typeof obj[key] === 'object') {
            if (Array.isArray(obj[key])) {
              obj[key].forEach((item: any, index: number) => {
                findShapes(item, `${currentPath}[${index}]`)
              })
            } else {
              findShapes(obj[key], currentPath)
            }
          }
        })
      }
      
      findShapes(slide1Data)
      
    } else {
      console.log('❌ Slide 1 não encontrado')
    }

    // Verificar content types
    console.log('\n📋 CONTENT TYPES:')
    const contentTypesFile = zip.file('[Content_Types].xml')
    if (contentTypesFile) {
      const contentTypesXml = await contentTypesFile.async('text')
      const contentTypesData = await parseStringPromise(contentTypesXml)
      console.log(JSON.stringify(contentTypesData, null, 2))
    }

  } catch (error) {
    console.error('❌ Erro durante análise:', error)
    process.exit(1)
  }
}

// Executar debug
if (require.main === module) {
  debugPPTXStructure()
    .then(() => {
      console.log('\n✅ Análise de estrutura concluída!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Erro na análise:', error)
      process.exit(1)
    })
}

export { debugPPTXStructure }