/**
 * Testes para SpecValidator
 */
const fs = require('fs');
const path = require('path');
const validator = require('../spec_validator');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, '_Fases_REAL');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

async function main() {
  console.log('🧪 Iniciando testes SpecValidator');
  const { report, outputs } = validator.run();
  assert(outputs && fs.existsSync(outputs.jsonPath), 'spec_validation_report.json não foi gerado');
  assert(fs.existsSync(outputs.mdPath), 'SPEC_VALIDATION_RESUMO.md não foi gerado');
  assert(Array.isArray(report.items) && report.items.length >= 1, 'Itens de relatório inválidos');
  console.log('✓ SpecValidator: relatórios gerados com sucesso');
}

main().catch(err => { console.error('❌ Falha SpecValidator:', err.message); process.exit(1); });