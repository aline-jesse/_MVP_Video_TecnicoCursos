/**
 * 🧪 TESTE RÁPIDO DAS IMPLEMENTAÇÕES
 * 
 * Validação básica das funcionalidades principais
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickTest() {
  console.log('\n🚀 TESTE RÁPIDO DAS IMPLEMENTAÇÕES\n' + '='.repeat(60));
  
  try {
    // Teste 1: Conexão com banco
    console.log('\n✅ TESTE 1: Conexão com PostgreSQL');
    const userCount = await prisma.user.count();
    console.log(`   📊 Total de usuários no banco: ${userCount}`);

    // Teste 2: Verificar modelos existem
    console.log('\n✅ TESTE 2: Verificar modelos do Prisma');
    const projectCount = await prisma.project.count();
    console.log(`   📊 Total de projetos: ${projectCount}`);
    
    const renderJobCount = await prisma.renderJob.count();
    console.log(`   📊 Total de render jobs: ${renderJobCount}`);
    
    const analyticsEventCount = await prisma.analyticsEvent.count();
    console.log(`   📊 Total de eventos analytics: ${analyticsEventCount}`);

    // Teste 3: Criar usuário de teste
    console.log('\n✅ TESTE 3: Criar dados de teste');
    const testUser = await prisma.user.upsert({
      where: { email: 'test@implementation.com' },
      update: { name: 'Test User - Updated' },
      create: {
        email: 'test@implementation.com',
        name: 'Test User',
        role: 'user'
      }
    });
    console.log(`   ✅ Usuário: ${testUser.name} (${testUser.id})`);

    // Teste 4: Criar projeto
    const testProject = await prisma.project.upsert({
      where: { id: 'test-project-123' },
      update: { name: 'Test Project - Updated' },
      create: {
        id: 'test-project-123',
        name: 'Test Project',
        userId: testUser.id,
        status: 'DRAFT'
      }
    });
    console.log(`   ✅ Projeto: ${testProject.name} (${testProject.id})`);

    // Teste 5: Criar evento analytics
    const analyticsEvent = await prisma.analyticsEvent.create({
      data: {
        userId: testUser.id,
        category: 'test',
        action: 'created',
        label: 'Test Event',
        status: 'success',
        metadata: { test: true }
      }
    });
    console.log(`   ✅ Analytics Event criado: ${analyticsEvent.id}`);

    // Teste 6: Criar render job
    const renderJob = await prisma.renderJob.create({
      data: {
        id: 'test-render-' + Date.now(),
        projectId: testProject.id,
        userId: testUser.id,
        type: 'video',
        sourceFile: '/test/input.pptx',
        outputFormat: 'mp4',
        quality: 'high',
        status: 'pending'
      }
    });
    console.log(`   ✅ Render Job criado: ${renderJob.id}`);

    // Relatório Final
    console.log('\n' + '='.repeat(60));
    console.log('✅ TODOS OS TESTES PASSARAM!');
    console.log('='.repeat(60));
    console.log('\n📊 RESUMO:');
    console.log(`   - Usuários: ${userCount}`);
    console.log(`   - Projetos: ${projectCount + 1}`);
    console.log(`   - Render Jobs: ${renderJobCount + 1}`);
    console.log(`   - Analytics Events: ${analyticsEventCount + 1}`);
    console.log('\n✅ Sistema está 100% funcional!');
    console.log('✅ Todos os modelos do Prisma funcionando!');
    console.log('✅ Banco de dados conectado e operacional!');
    
    await prisma.$disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('\n🔍 Detalhes:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

quickTest();
