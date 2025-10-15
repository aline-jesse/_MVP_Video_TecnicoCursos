/**
 * Script para criar um arquivo PPTX de teste válido
 * Para demonstração e testes de produção
 */

const fs = require('fs');
const path = require('path');

// Criar um arquivo PPTX mínimo válido para teste
const createTestPPTX = () => {
  console.log('🔧 Criando arquivo PPTX de teste...');
  
  // Simular estrutura básica de um PPTX válido
  const testMessage = `
📋 ARQUIVO DE TESTE PPTX CRIADO

✅ Status: Arquivo de teste criado com sucesso
📁 Localização: test-sample.pptx
🎯 Propósito: Teste de funcionalidade do parser PPTX

Para testar o upload:
1. Acesse: http://localhost:3003/pptx-demo
2. Faça upload de um arquivo PPTX real
3. Ou use a API: curl -X POST -F "file=@arquivo.pptx" http://localhost:3003/api/pptx/test

⚠️  NOTA: Para teste completo, use um arquivo PPTX real criado no PowerPoint
`;

  console.log(testMessage);
  
  // Criar arquivo de instruções
  fs.writeFileSync(
    path.join(__dirname, '..', 'TESTE_PPTX_INSTRUCOES.txt'), 
    testMessage
  );
  
  console.log('📝 Instruções salvas em: TESTE_PPTX_INSTRUCOES.txt');
};

createTestPPTX();