/**
 * SpecValidator – Valida documentos em .trae/documents e gera relatórios:
 * - spec_validation_report.json
 * - SPEC_VALIDATION_RESUMO.md
 * Saídas são gravadas em _Fases_REAL
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS_DIR = path.join(ROOT, '.trae', 'documents');
const OUTPUT_DIR = path.join(ROOT, '_Fases_REAL');

function read(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
}

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function hasHeading(md, heading) {
  const re = new RegExp(`^#{1,4}\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm');
  return re.test(md);
}

function validatePRD() {
  const prdPath = path.join(DOCS_DIR, 'PRD_SISTEMA_INTEGRADO_UNIFICADO.md');
  const content = read(prdPath);
  const checks = {
    exists: content.trim().length > 0,
    minLength: content.length > 500,
    headings: {
      'Product Overview': hasHeading(content, '🎯 PRD - Sistema Integrado Unificado de Criação de Vídeos') || hasHeading(content, 'Product Overview'),
      'Core Features': /##\s+2\.\s+Core Features/.test(content),
      'Core Process': /##\s+3\.\s+Core Process/.test(content),
      'User Interface Design': /##\s+4\.\s+User Interface Design/.test(content),
    },
  };
  const ok = checks.exists && checks.minLength && Object.values(checks.headings).every(Boolean);
  return { doc: 'PRD_SISTEMA_INTEGRADO_UNIFICADO.md', ok, checks };
}

function validateArchitecture() {
  const files = [
    'ARQUITETURA_TECNICA_IMPLEMENTACAO.md',
    'ESPECIFICACOES_TECNICAS_DETALHADAS.md',
    'Plano_Implementacao_Funcionalidades_Reais.md',
  ];
  return files.map(name => {
    const p = path.join(DOCS_DIR, name);
    const c = read(p);
    const ok = c.trim().length > 300;
    const hasArquitetura = /(Arquitetura|Architecture)/i.test(c);
    const hasSec = /(Segurança|Security|Auth|Autenticação)/i.test(c);
    const hasTest = /(Teste|Tests|Validação|QA)/i.test(c);
    const checks = { exists: c.trim().length > 0, minLength: ok, hasArquitetura, hasSec, hasTest };
    return { doc: name, ok: Object.values(checks).every(Boolean), checks };
  });
}

function writeOutputs(report) {
  ensureOutputDir();
  const jsonPath = path.join(OUTPUT_DIR, 'spec_validation_report.json');
  const mdPath = path.join(OUTPUT_DIR, 'SPEC_VALIDATION_RESUMO.md');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');

  const lines = [];
  lines.push('# ✅ Validação de Especificações');
  lines.push(`- Documentos validados: ${report.items.length}`);
  lines.push(`- Conformidade geral: ${report.overall_ok ? 'OK' : 'Parcial'}`);
  lines.push('');
  lines.push('## Itens');
  report.items.forEach(it => {
    lines.push(`- ${it.doc}: ${it.ok ? 'OK' : 'Falhas'}`);
  });
  fs.writeFileSync(mdPath, lines.join('\n'), 'utf8');
  return { jsonPath, mdPath };
}

function run() {
  const prd = validatePRD();
  const arch = validateArchitecture();
  const items = [prd, ...arch];
  const overall_ok = items.every(i => i.ok);
  const report = { generated_at: new Date().toISOString(), overall_ok, items };
  const outputs = writeOutputs(report);
  return { report, outputs };
}

if (require.main === module) {
  run();
  console.log('✅ SpecValidator: relatórios gerados em _Fases_REAL');
}

module.exports = { run, validatePRD, validateArchitecture };