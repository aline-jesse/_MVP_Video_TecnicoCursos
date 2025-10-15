/**
 * 🧪 Script de Teste - Importação PPTX End-to-End
 * Testa todo o fluxo de processamento PPTX
 */

import fs from 'fs'
import path from 'path'
import { PPTXProcessor } from '../lib/pptx/pptx-processor'

async function testPPTXImport() {
  console.log('🧪 Iniciando teste de importação PPTX...\n')

  try {
    // 1. Verificar se existe arquivo de teste
    const testFilesDir = path.join(process.cwd(), 'test-files')

    if (!fs.existsSync(testFilesDir)) {
      console.log('❌ Diretório test-files não encontrado')
      console.log('💡 Crie o diretório e adicione um arquivo .pptx para teste')
      console.log(`   Caminho esperado: ${testFilesDir}`)
      return
    }

    const pptxFiles = fs.readdirSync(testFilesDir).filter(f => f.endsWith('.pptx'))

    if (pptxFiles.length === 0) {
      console.log('❌ Nenhum arquivo .pptx encontrado em test-files/')
      console.log('💡 Adicione um arquivo .pptx para teste')
      return
    }

    const testFile = pptxFiles[0]
    const testFilePath = path.join(testFilesDir, testFile)

    console.log(`📄 Arquivo de teste: ${testFile}`)
    console.log(`📁 Caminho: ${testFilePath}\n`)

    // 2. Ler arquivo
    const buffer = fs.readFileSync(testFilePath)
    console.log(`✅ Arquivo lido: ${buffer.length} bytes\n`)

    // 3. Validar arquivo PPTX
    console.log('🔍 Validando estrutura do arquivo PPTX...')
    const validation = await PPTXProcessor.validatePPTXFile(buffer)

    if (!validation.isValid) {
      console.log('❌ Arquivo PPTX inválido:')
      validation.errors.forEach(error => console.log(`   - ${error}`))
      return
    }

    console.log('✅ Arquivo PPTX válido')

    if (validation.warnings.length > 0) {
      console.log('⚠️ Avisos:')
      validation.warnings.forEach(warning => console.log(`   - ${warning}`))
    }
    console.log()

    // 4. Processar PPTX
    console.log('🔄 Processando PPTX...\n')

    const startTime = Date.now()
    let lastProgress = 0

    const result = await PPTXProcessor.processFile(
      buffer,
      'test-project-id',
      {
        extractImages: true,
        extractVideos: true,
        extractAudio: true,
        generateThumbnails: false, // Desabilitar para teste rápido
        uploadToS3: false, // Desabilitar upload S3 para teste local
        preserveAnimations: true,
        extractNotes: true,
        detectLayouts: true,
        estimateDurations: true,
        extractHyperlinks: true,
        maxImageSize: 1920,
        imageQuality: 85
      },
      (progress) => {
        if (Math.floor(progress.progress) > lastProgress) {
          lastProgress = Math.floor(progress.progress)
          console.log(`📊 ${progress.stage}: ${lastProgress}% - ${progress.message}`)
        }
      }
    )

    const processingTime = Date.now() - startTime

    // 5. Exibir resultados
    console.log('\n' + '='.repeat(60))
    console.log('✅ PROCESSAMENTO CONCLUÍDO')
    console.log('='.repeat(60) + '\n')

    if (!result.success) {
      console.log('❌ Erro no processamento:')
      console.log(`   ${result.error}\n`)
      return
    }

    console.log('📋 METADADOS:')
    console.log(`   Título: ${result.metadata.title}`)
    console.log(`   Autor: ${result.metadata.author}`)
    console.log(`   Total de slides: ${result.metadata.totalSlides}`)
    console.log(`   Dimensões: ${result.metadata.dimensions.width}x${result.metadata.dimensions.height}`)
    console.log(`   Aplicação: ${result.metadata.application}\n`)

    console.log('📊 ESTATÍSTICAS:')
    console.log(`   Slides processados: ${result.slides.length}`)
    console.log(`   Blocos de texto: ${result.extractionStats.textBlocks}`)
    console.log(`   Imagens: ${result.extractionStats.images}`)
    console.log(`   Formas: ${result.extractionStats.shapes}`)
    console.log(`   Gráficos: ${result.extractionStats.charts}`)
    console.log(`   Tabelas: ${result.extractionStats.tables}`)
    console.log(`   SmartArt: ${result.extractionStats.smartArt}`)
    console.log(`   Vídeos: ${result.extractionStats.videos}`)
    console.log(`   Áudios: ${result.extractionStats.audio}`)
    console.log(`   Animações: ${result.extractionStats.animations}`)
    console.log(`   Hyperlinks: ${result.extractionStats.hyperlinks}\n`)

    console.log('⏱️ PERFORMANCE:')
    console.log(`   Tempo de processamento: ${processingTime}ms`)
    console.log(`   Tempo médio por slide: ${Math.round(processingTime / result.slides.length)}ms\n`)

    console.log('📄 SLIDES:')
    result.slides.forEach((slide, index) => {
      console.log(`\n   Slide ${index + 1}/${result.slides.length}:`)
      console.log(`   ├─ Título: ${slide.title}`)
      console.log(`   ├─ Layout: ${slide.layout}`)
      console.log(`   ├─ Palavras: ${slide.wordCount}`)
      console.log(`   ├─ Caracteres: ${slide.characterCount}`)
      console.log(`   ├─ Imagens: ${slide.images.length}`)
      console.log(`   ├─ Text boxes: ${slide.textBoxes.length}`)
      console.log(`   ├─ Duração estimada: ${slide.duration}ms`)
      console.log(`   └─ Tempo de leitura: ${slide.estimatedReadingTime}s`)

      if (slide.content && slide.content.length > 0) {
        const preview = slide.content.substring(0, 100)
        console.log(`      Preview: "${preview}${slide.content.length > 100 ? '...' : ''}"`)
      }

      if (slide.notes && slide.notes.length > 0) {
        console.log(`      Notas: ${slide.notes.substring(0, 50)}...`)
      }
    })

    console.log('\n' + '='.repeat(60))
    console.log('🎯 TIMELINE:')
    console.log('='.repeat(60) + '\n')

    if (result.timeline) {
      console.log(`   Duração total: ${result.timeline.totalDuration}ms (${Math.round(result.timeline.totalDuration / 1000)}s)`)
      console.log(`   Número de cenas: ${result.timeline.scenes.length}\n`)

      result.timeline.scenes.forEach((scene) => {
        console.log(`   Cena ${scene.slideNumber}:`)
        console.log(`   ├─ ID: ${scene.sceneId}`)
        console.log(`   ├─ Duração: ${scene.duration}ms`)
        console.log(`   ├─ Início: ${scene.startTime}ms`)
        console.log(`   └─ Fim: ${scene.endTime}ms`)
      })
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!')
    console.log('='.repeat(60) + '\n')

    // 6. Salvar resultado em JSON para análise
    const outputPath = path.join(testFilesDir, 'test-result.json')
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))
    console.log(`💾 Resultado salvo em: ${outputPath}\n`)

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error)
    if (error instanceof Error) {
      console.error(`   Mensagem: ${error.message}`)
      console.error(`   Stack: ${error.stack}`)
    }
  }
}

// Executar teste
testPPTXImport()
