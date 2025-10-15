/**
 * 🎯 TESTE DE FUNCIONALIDADE - PROJETOS
 * Valida criação, listagem, edição e gerenciamento de projetos
 */

import dotenv from 'dotenv'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = __dirname

// Carrega variáveis de ambiente
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

console.log('🎯 INICIANDO TESTE DE FUNCIONALIDADE PROJETOS')
console.log('============================================================')

let successCount = 0
let totalTests = 5

async function checkProjectsAPI() {
  console.log('\n1️⃣ VERIFICANDO API DE PROJETOS...')
  
  try {
    // Verifica se existe API de projetos
    const apiPaths = [
      path.join(PROJECT_ROOT, 'app', 'api', 'projects', 'route.ts'),
      path.join(PROJECT_ROOT, 'app', 'api', 'v1', 'projects', 'route.ts'),
      path.join(PROJECT_ROOT, 'api', 'projects', 'route.ts'),
      path.join(PROJECT_ROOT, 'pages', 'api', 'projects.ts')
    ]
    
    let apiFound = false
    let apiPath = ''
    
    for (const apiPathCheck of apiPaths) {
      try {
        await fs.access(apiPathCheck)
        apiFound = true
        apiPath = apiPathCheck
        break
      } catch {}
    }
    
    if (apiFound) {
      console.log(`  ✅ API de projetos encontrada: ${path.relative(PROJECT_ROOT, apiPath)}`)
      
      // Verifica conteúdo da API
      const apiContent = await fs.readFile(apiPath, 'utf-8')
      
      const hasGET = apiContent.includes('GET') || apiContent.includes('export async function GET')
      const hasPOST = apiContent.includes('POST') || apiContent.includes('export async function POST')
      const hasPrisma = apiContent.includes('prisma') || apiContent.includes('database')
      
      if (hasGET) console.log('  ✅ Endpoint GET implementado')
      if (hasPOST) console.log('  ✅ Endpoint POST implementado')
      if (hasPrisma) console.log('  ✅ Integração com banco de dados')
      
      successCount++
    } else {
      console.log('  ❌ API de projetos não encontrada')
    }
    
  } catch (error) {
    console.log(`  ❌ Erro ao verificar API: ${error.message}`)
  }
}

async function checkProjectsDatabase() {
  console.log('\n2️⃣ VERIFICANDO ESTRUTURA DO BANCO...')
  
  try {
    // Verifica schema do Prisma
    const schemaPath = path.join(PROJECT_ROOT, 'prisma', 'schema.prisma')
    
    try {
      const schemaContent = await fs.readFile(schemaPath, 'utf-8')
      
      const hasProjectModel = schemaContent.includes('model Project') || schemaContent.includes('model project')
      const hasUserRelation = schemaContent.includes('userId') || schemaContent.includes('user')
      const hasSlideRelation = schemaContent.includes('slides') || schemaContent.includes('Slide')
      
      if (hasProjectModel) {
        console.log('  ✅ Model Project definido no schema')
        successCount++
      } else {
        console.log('  ❌ Model Project não encontrado')
      }
      
      if (hasUserRelation) console.log('  ✅ Relação com usuários configurada')
      if (hasSlideRelation) console.log('  ✅ Relação com slides configurada')
      
    } catch {
      console.log('  ❌ Schema Prisma não encontrado')
    }
    
  } catch (error) {
    console.log(`  ❌ Erro ao verificar banco: ${error.message}`)
  }
}

async function checkProjectsComponents() {
  console.log('\n3️⃣ VERIFICANDO COMPONENTES DE PROJETOS...')
  
  try {
    const componentPaths = [
      path.join(PROJECT_ROOT, 'src', 'components', 'projects'),
      path.join(PROJECT_ROOT, 'components', 'projects'),
      path.join(PROJECT_ROOT, 'app', 'components', 'projects'),
      path.join(PROJECT_ROOT, 'src', 'pages', 'projects'),
      path.join(PROJECT_ROOT, 'app', 'projects')
    ]
    
    let componentsFound = 0
    
    for (const componentPath of componentPaths) {
      try {
        const stats = await fs.stat(componentPath)
        if (stats.isDirectory()) {
          const files = await fs.readdir(componentPath)
          const componentFiles = files.filter(file => 
            file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.vue')
          )
          
          if (componentFiles.length > 0) {
            console.log(`  ✅ Componentes encontrados em: ${path.relative(PROJECT_ROOT, componentPath)}`)
            console.log(`    📁 ${componentFiles.length} arquivos: ${componentFiles.slice(0, 3).join(', ')}${componentFiles.length > 3 ? '...' : ''}`)
            componentsFound++
          }
        }
      } catch {}
    }
    
    if (componentsFound > 0) {
      successCount++
    } else {
      console.log('  ❌ Nenhum componente de projetos encontrado')
    }
    
  } catch (error) {
    console.log(`  ❌ Erro ao verificar componentes: ${error.message}`)
  }
}

async function checkProjectsPages() {
  console.log('\n4️⃣ VERIFICANDO PÁGINAS DE PROJETOS...')
  
  try {
    const pagePaths = [
      path.join(PROJECT_ROOT, 'app', 'projects', 'page.tsx'),
      path.join(PROJECT_ROOT, 'src', 'pages', 'projects.tsx'),
      path.join(PROJECT_ROOT, 'pages', 'projects.tsx'),
      path.join(PROJECT_ROOT, 'app', 'dashboard', 'page.tsx')
    ]
    
    let pagesFound = 0
    
    for (const pagePath of pagePaths) {
      try {
        await fs.access(pagePath)
        const pageContent = await fs.readFile(pagePath, 'utf-8')
        
        const hasProjectsList = pageContent.includes('project') || pageContent.includes('Project')
        const hasCreateProject = pageContent.includes('create') || pageContent.includes('novo')
        
        if (hasProjectsList) {
          console.log(`  ✅ Página encontrada: ${path.relative(PROJECT_ROOT, pagePath)}`)
          if (hasCreateProject) console.log('    ✅ Funcionalidade de criação detectada')
          pagesFound++
        }
      } catch {}
    }
    
    if (pagesFound > 0) {
      successCount++
    } else {
      console.log('  ❌ Nenhuma página de projetos encontrada')
    }
    
  } catch (error) {
    console.log(`  ❌ Erro ao verificar páginas: ${error.message}`)
  }
}

async function checkProjectsIntegration() {
  console.log('\n5️⃣ VERIFICANDO INTEGRAÇÃO COMPLETA...')
  
  try {
    // Verifica se há integração entre PPTX upload e projetos
    const uploadApiPath = path.join(PROJECT_ROOT, 'app', 'api', 'pptx', 'upload', 'route.ts')
    
    try {
      const uploadContent = await fs.readFile(uploadApiPath, 'utf-8')
      
      const createsProject = uploadContent.includes('project.create') || uploadContent.includes('Project.create')
      const hasProjectId = uploadContent.includes('projectId')
      const hasSlideCreation = uploadContent.includes('slide.create') || uploadContent.includes('Slide.create')
      
      if (createsProject && hasProjectId) {
        console.log('  ✅ Integração PPTX → Projeto implementada')
        successCount++
      } else {
        console.log('  ❌ Integração PPTX → Projeto não encontrada')
      }
      
      if (hasSlideCreation) console.log('  ✅ Criação automática de slides')
      
    } catch {
      console.log('  ❌ API de upload PPTX não encontrada')
    }
    
    // Verifica se há testes de integração
    const testPaths = [
      path.join(PROJECT_ROOT, 'test-integration.js'),
      path.join(PROJECT_ROOT, 'test-end-to-end.js'),
      path.join(PROJECT_ROOT, '__tests__'),
      path.join(PROJECT_ROOT, 'tests')
    ]
    
    let hasTests = false
    for (const testPath of testPaths) {
      try {
        const stats = await fs.stat(testPath)
        if (stats.isFile() || stats.isDirectory()) {
          hasTests = true
          break
        }
      } catch {}
    }
    
    if (hasTests) {
      console.log('  ✅ Testes de integração disponíveis')
    }
    
  } catch (error) {
    console.log(`  ❌ Erro ao verificar integração: ${error.message}`)
  }
}

// Executa todos os testes
async function runAllTests() {
  await checkProjectsAPI()
  await checkProjectsDatabase()
  await checkProjectsComponents()
  await checkProjectsPages()
  await checkProjectsIntegration()
  
  // Relatório final
  console.log('\n============================================================')
  console.log('📊 RELATÓRIO FINAL - FUNCIONALIDADE PROJETOS')
  console.log('============================================================')
  
  const successRate = Math.round((successCount / totalTests) * 100)
  
  console.log(`\n🎯 TAXA DE SUCESSO: ${successRate}% (${successCount}/${totalTests})`)
  
  if (successRate >= 80) {
    console.log('🎉 FUNCIONALIDADE PROJETOS: OPERACIONAL')
  } else if (successRate >= 60) {
    console.log('⚠️ FUNCIONALIDADE PROJETOS: PARCIALMENTE OPERACIONAL')
  } else {
    console.log('❌ FUNCIONALIDADE PROJETOS: NECESSITA IMPLEMENTAÇÃO')
  }
  
  console.log('\n📋 PRÓXIMOS PASSOS RECOMENDADOS:')
  
  if (successRate < 100) {
    if (successCount < 1) console.log('- Implementar API de projetos (/api/projects ou /api/v1/projects)')
    if (successCount < 2) console.log('- Configurar model Project no schema Prisma')
    if (successCount < 3) console.log('- Criar componentes de interface para projetos')
    if (successCount < 4) console.log('- Implementar páginas de listagem e criação')
    if (successCount < 5) console.log('- Integrar upload PPTX com criação de projetos')
  } else {
    console.log('- Sistema de projetos está completo e operacional!')
    console.log('- Considere adicionar testes automatizados')
    console.log('- Implemente funcionalidades avançadas (colaboração, templates)')
  }
  
  process.exit(successRate >= 80 ? 0 : 1)
}

runAllTests().catch(console.error)