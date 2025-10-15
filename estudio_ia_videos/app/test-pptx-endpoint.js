// Teste do endpoint /api/pptx/enhanced-analysis
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');

async function testPptxEndpoint() {
  try {
    console.log('🧪 Testando endpoint /api/pptx/enhanced-analysis');
    
    // Criar um arquivo de teste simples
    const testFilePath = path.join(__dirname, 'temp', 'test.pptx');
    
    // Verificar se já existe um arquivo PPTX para teste
    let fileExists = false;
    try {
      await fs.promises.access(testFilePath);
      fileExists = true;
    } catch (err) {
      console.log('Arquivo de teste não encontrado, usando test.pptx na raiz');
      // Tentar usar o arquivo test.pptx na raiz do projeto
      try {
        const rootTestFile = path.join(__dirname, 'test.pptx');
        await fs.promises.access(rootTestFile);
        await fs.promises.copyFile(rootTestFile, testFilePath);
        fileExists = true;
      } catch (err) {
        console.error('Nenhum arquivo PPTX de teste encontrado');
      }
    }
    
    if (!fileExists) {
      console.error('❌ Teste falhou: Nenhum arquivo PPTX disponível para teste');
      return;
    }
    
    // Criar FormData e adicionar o arquivo
    const formData = new FormData();
    const fileStream = fs.createReadStream(testFilePath);
    formData.append('file', fileStream, 'test.pptx');
    
    // Fazer a requisição para o endpoint
    console.log('📤 Enviando requisição para o endpoint...');
    const response = await fetch('http://localhost:3001/api/pptx/enhanced-analysis', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    // Verificar a resposta
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Teste bem-sucedido!');
      console.log('📊 Resultado da análise:', JSON.stringify(result, null, 2));
    } else {
      const errorText = await response.text();
      console.error('❌ Teste falhou com status:', response.status);
      console.error('Detalhes do erro:', errorText);
    }
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testPptxEndpoint();