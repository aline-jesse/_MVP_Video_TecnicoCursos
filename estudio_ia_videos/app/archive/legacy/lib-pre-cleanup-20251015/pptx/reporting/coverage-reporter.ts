/**
 * 📊 Coverage Reporter - Sistema de Relatórios de Cobertura
 * Gera relatórios detalhados sobre a cobertura de funcionalidades
 */

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

export interface CoverageConfig {
  outputDir: string;
  includeTimestamp: boolean;
  format: 'json' | 'html' | 'md';
  includeSourceCode: boolean;
  excludePatterns?: string[];
}

export interface FunctionCoverage {
  name: string;
  file: string;
  lines: {
    total: number;
    covered: number;
    percentage: number;
  };
  branches: {
    total: number;
    covered: number;
    percentage: number;
  };
  calls: {
    total: number;
    covered: number;
    percentage: number;
  };
}

export interface FileCoverage {
  path: string;
  functions: FunctionCoverage[];
  summary: {
    lines: {
      total: number;
      covered: number;
      percentage: number;
    };
    branches: {
      total: number;
      covered: number;
      percentage: number;
    };
    functions: {
      total: number;
      covered: number;
      percentage: number;
    };
  };
}

export interface CoverageReport {
  timestamp: string;
  gitHash?: string;
  files: FileCoverage[];
  summary: {
    files: number;
    functions: number;
    lines: {
      total: number;
      covered: number;
      percentage: number;
    };
    branches: {
      total: number;
      covered: number;
      percentage: number;
    };
    functions: {
      total: number;
      covered: number;
      percentage: number;
    };
  };
}

export class CoverageReporter {
  private config: CoverageConfig;
  private coverageData: Map<string, FileCoverage>;

  constructor(config: CoverageConfig) {
    this.config = {
      includeTimestamp: true,
      format: 'json',
      includeSourceCode: false,
      ...config
    };
    this.coverageData = new Map();
  }

  /**
   * Adiciona cobertura para uma função específica
   */
  addFunctionCoverage(
    file: string,
    functionName: string,
    coverage: Partial<FunctionCoverage>
  ): void {
    let fileCoverage = this.coverageData.get(file);
    
    if (!fileCoverage) {
      fileCoverage = {
        path: file,
        functions: [],
        summary: {
          lines: { total: 0, covered: 0, percentage: 0 },
          branches: { total: 0, covered: 0, percentage: 0 },
          functions: { total: 0, covered: 0, percentage: 0 }
        }
      };
      this.coverageData.set(file, fileCoverage);
    }

    const functionCoverage: FunctionCoverage = {
      name: functionName,
      file,
      lines: {
        total: coverage.lines?.total || 0,
        covered: coverage.lines?.covered || 0,
        percentage: coverage.lines?.percentage || 0
      },
      branches: {
        total: coverage.branches?.total || 0,
        covered: coverage.branches?.covered || 0,
        percentage: coverage.branches?.percentage || 0
      },
      calls: {
        total: coverage.calls?.total || 0,
        covered: coverage.calls?.covered || 0,
        percentage: coverage.calls?.percentage || 0
      }
    };

    fileCoverage.functions.push(functionCoverage);
    this.updateFileSummary(fileCoverage);
  }

  /**
   * Gera o relatório de cobertura
   */
  async generateReport(): Promise<void> {
    const report = this.prepareReport();
    
    switch (this.config.format) {
      case 'json':
        await this.generateJsonReport(report);
        break;
      case 'html':
        await this.generateHtmlReport(report);
        break;
      case 'md':
        await this.generateMarkdownReport(report);
        break;
    }
  }

  private prepareReport(): CoverageReport {
    const summary = {
      files: this.coverageData.size,
      functions: 0,
      lines: { total: 0, covered: 0, percentage: 0 },
      branches: { total: 0, covered: 0, percentage: 0 },
      functions: { total: 0, covered: 0, percentage: 0 }
    };

    const files = Array.from(this.coverageData.values());

    // Calcular totais
    for (const file of files) {
      summary.functions += file.functions.length;
      summary.lines.total += file.summary.lines.total;
      summary.lines.covered += file.summary.lines.covered;
      summary.branches.total += file.summary.branches.total;
      summary.branches.covered += file.summary.branches.covered;
      summary.functions.total += file.summary.functions.total;
      summary.functions.covered += file.summary.functions.covered;
    }

    // Calcular percentagens
    summary.lines.percentage = this.calculatePercentage(
      summary.lines.covered,
      summary.lines.total
    );
    summary.branches.percentage = this.calculatePercentage(
      summary.branches.covered,
      summary.branches.total
    );
    summary.functions.percentage = this.calculatePercentage(
      summary.functions.covered,
      summary.functions.total
    );

    return {
      timestamp: new Date().toISOString(),
      gitHash: this.getGitHash(),
      files,
      summary
    };
  }

  private async generateJsonReport(report: CoverageReport): Promise<void> {
    const outputPath = path.join(this.config.outputDir, 'coverage-report.json');
    await fs.promises.writeFile(
      outputPath,
      JSON.stringify(report, null, 2)
    );
  }

  private async generateHtmlReport(report: CoverageReport): Promise<void> {
    const html = this.generateHtmlContent(report);
    const outputPath = path.join(this.config.outputDir, 'coverage-report.html');
    await fs.promises.writeFile(outputPath, html);
  }

  private async generateMarkdownReport(report: CoverageReport): Promise<void> {
    const markdown = this.generateMarkdownContent(report);
    const outputPath = path.join(this.config.outputDir, 'coverage-report.md');
    await fs.promises.writeFile(outputPath, markdown);
  }

  private generateHtmlContent(report: CoverageReport): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Coverage Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .summary { margin-bottom: 30px; }
    .file { margin-bottom: 20px; }
    .function { margin-left: 20px; }
    .good { color: green; }
    .warning { color: orange; }
    .bad { color: red; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
  </style>
</head>
<body>
  <h1>Coverage Report</h1>
  <div class="summary">
    <h2>Summary</h2>
    <table>
      <tr>
        <th>Metric</th>
        <th>Total</th>
        <th>Covered</th>
        <th>Percentage</th>
      </tr>
      <tr>
        <td>Lines</td>
        <td>${report.summary.lines.total}</td>
        <td>${report.summary.lines.covered}</td>
        <td class="${this.getCoverageClass(report.summary.lines.percentage)}">
          ${report.summary.lines.percentage.toFixed(2)}%
        </td>
      </tr>
      <tr>
        <td>Branches</td>
        <td>${report.summary.branches.total}</td>
        <td>${report.summary.branches.covered}</td>
        <td class="${this.getCoverageClass(report.summary.branches.percentage)}">
          ${report.summary.branches.percentage.toFixed(2)}%
        </td>
      </tr>
      <tr>
        <td>Functions</td>
        <td>${report.summary.functions.total}</td>
        <td>${report.summary.functions.covered}</td>
        <td class="${this.getCoverageClass(report.summary.functions.percentage)}">
          ${report.summary.functions.percentage.toFixed(2)}%
        </td>
      </tr>
    </table>
  </div>

  <div class="files">
    <h2>Files</h2>
    ${report.files.map(file => this.generateFileHtml(file)).join('\n')}
  </div>

  <footer>
    <p>Generated on: ${report.timestamp}</p>
    ${report.gitHash ? `<p>Git Hash: ${report.gitHash}</p>` : ''}
  </footer>
</body>
</html>`;
  }

  private generateMarkdownContent(report: CoverageReport): string {
    return `# Coverage Report

## Summary

| Metric | Total | Covered | Percentage |
|--------|-------|---------|------------|
| Lines | ${report.summary.lines.total} | ${report.summary.lines.covered} | ${report.summary.lines.percentage.toFixed(2)}% |
| Branches | ${report.summary.branches.total} | ${report.summary.branches.covered} | ${report.summary.branches.percentage.toFixed(2)}% |
| Functions | ${report.summary.functions.total} | ${report.summary.functions.covered} | ${report.summary.functions.percentage.toFixed(2)}% |

## Files

${report.files.map(file => this.generateFileMarkdown(file)).join('\n\n')}

---
Generated on: ${report.timestamp}
${report.gitHash ? `Git Hash: ${report.gitHash}` : ''}`;
  }

  private generateFileHtml(file: FileCoverage): string {
    return `
<div class="file">
  <h3>${file.path}</h3>
  <table>
    <tr>
      <th>Function</th>
      <th>Line Coverage</th>
      <th>Branch Coverage</th>
      <th>Call Coverage</th>
    </tr>
    ${file.functions.map(func => `
    <tr>
      <td>${func.name}</td>
      <td class="${this.getCoverageClass(func.lines.percentage)}">
        ${func.lines.percentage.toFixed(2)}%
      </td>
      <td class="${this.getCoverageClass(func.branches.percentage)}">
        ${func.branches.percentage.toFixed(2)}%
      </td>
      <td class="${this.getCoverageClass(func.calls.percentage)}">
        ${func.calls.percentage.toFixed(2)}%
      </td>
    </tr>
    `).join('\n')}
  </table>
</div>`;
  }

  private generateFileMarkdown(file: FileCoverage): string {
    return `### ${file.path}

| Function | Line Coverage | Branch Coverage | Call Coverage |
|----------|---------------|----------------|---------------|
${file.functions.map(func => 
  `| ${func.name} | ${func.lines.percentage.toFixed(2)}% | ${func.branches.percentage.toFixed(2)}% | ${func.calls.percentage.toFixed(2)}% |`
).join('\n')}`;
  }

  private updateFileSummary(file: FileCoverage): void {
    const summary = {
      lines: { total: 0, covered: 0, percentage: 0 },
      branches: { total: 0, covered: 0, percentage: 0 },
      functions: { total: 0, covered: 0, percentage: 0 }
    };

    for (const func of file.functions) {
      summary.lines.total += func.lines.total;
      summary.lines.covered += func.lines.covered;
      summary.branches.total += func.branches.total;
      summary.branches.covered += func.branches.covered;
      summary.functions.total++;
      summary.functions.covered += func.calls.covered > 0 ? 1 : 0;
    }

    summary.lines.percentage = this.calculatePercentage(
      summary.lines.covered,
      summary.lines.total
    );
    summary.branches.percentage = this.calculatePercentage(
      summary.branches.covered,
      summary.branches.total
    );
    summary.functions.percentage = this.calculatePercentage(
      summary.functions.covered,
      summary.functions.total
    );

    file.summary = summary;
  }

  private calculatePercentage(covered: number, total: number): number {
    return total === 0 ? 0 : (covered / total) * 100;
  }

  private getCoverageClass(percentage: number): string {
    if (percentage >= 80) return 'good';
    if (percentage >= 50) return 'warning';
    return 'bad';
  }

  private getGitHash(): string | undefined {
    try {
      // Implementar lógica para obter hash do git
      return undefined;
    } catch {
      return undefined;
    }
  }
}