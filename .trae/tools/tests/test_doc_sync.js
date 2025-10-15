/**
 * Testes automatizados para DocSync
 */
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.join(ROOT, '_Fases_REAL');

const docSync = require('../doc_sync');

function testValidateRequiredDocs() {
  const v = docSync.validateRequiredDocs();
  assert(v.ok, `Documentos obrigatórios ausentes: ${v.missing.join(', ')}`);
  console.log('✓ validateRequiredDocs: OK');
}

function testParseDocsExtractsTasks() {
  const parsed = docSync.parseDocs();
  assert(Array.isArray(parsed.tasks), 'parsed.tasks deve ser array');
  assert(parsed.tasks.length >= 1, 'Deve extrair ao menos 1 tarefa dos documentos');
  console.log(`✓ parseDocs: ${parsed.tasks.length} tarefas extraídas`);
}

function testGeneratePlanAndOutputs() {
  const parsed = docSync.parseDocs();
  const plan = docSync.generatePlan(parsed);
  const outputs = docSync.writeOutputs(plan, parsed);
  assert(fs.existsSync(outputs.jsonPath), 'implementation_plan.json não foi gerado');
  assert(fs.existsSync(outputs.mdPath), 'IMPLEMENTACAO_RESUMO.md não foi gerado');

  const json = JSON.parse(fs.readFileSync(outputs.jsonPath, 'utf8'));
  assert(json.summary && typeof json.summary.total_tasks === 'number', 'Resumo inválido no JSON');
  console.log('✓ generatePlan/writeOutputs: artefatos gerados e válidos');
}

function testRunEndToEnd() {
  return docSync.run().then(({ outputs, plan }) => {
    assert(fs.existsSync(outputs.jsonPath), 'JSON não existe após run');
    assert(fs.existsSync(outputs.mdPath), 'MD não existe após run');
    assert(plan.summary.total_tasks >= 1, 'Plan deve conter ao menos 1 tarefa');
    console.log('✓ run: fluxo E2E concluído');
  });
}

async function main() {
  console.log('🧪 Iniciando Testes DocSync');
  testValidateRequiredDocs();
  testParseDocsExtractsTasks();
  testGeneratePlanAndOutputs();
  await testRunEndToEnd();
  console.log('✅ Todos os testes DocSync passaram');
}

main().catch(err => {
  console.error('❌ Teste falhou:', err.message);
  process.exit(1);
});