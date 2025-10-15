/**
 * Testes para FeatureCoverage
 */
const fs = require('fs');
const path = require('path');
const coverage = require('../feature_coverage');

const ROOT = path.resolve(__dirname, '..', '..');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

async function main() {
  console.log('🧪 Iniciando testes FeatureCoverage');
  const result = coverage.run();
  assert(fs.existsSync(result.jsonPath), 'feature_coverage_report.json não foi gerado');
  assert(fs.existsSync(result.mdPath), 'FEATURE_COVERAGE_RESUMO.md não foi gerado');
  assert(typeof result.coverage_total === 'number', 'Cobertura total deve ser número');
  assert(result.coverage_total >= 0 && result.coverage_total <= 100, 'Cobertura fora do intervalo 0-100');
  console.log(`✓ FeatureCoverage: cobertura ${result.coverage_total}% válida`);
}

main().catch(err => { console.error('❌ Falha FeatureCoverage:', err.message); process.exit(1); });