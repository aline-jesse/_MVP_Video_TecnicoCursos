
/**
 * Web Vitals Tracker - Sprint 40
 * Monitoramento de Core Web Vitals (LCP, CLS, INP)
 */

interface WebVital {
  name: 'LCP' | 'CLS' | 'INP' | 'FCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

interface WebVitalsReport {
  url: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  vitals: WebVital[];
  timestamp: Date;
  userAgent: string;
}

export class WebVitalsTracker {
  // Thresholds para Web Vitals
  private static thresholds = {
    LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
    CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
    INP: { good: 200, poor: 500 },   // Interaction to Next Paint (ms)
    FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
    TTFB: { good: 800, poor: 1800 }, // Time to First Byte (ms)
  };

  // Targets por dispositivo
  private static targets = {
    desktop: {
      LCP: 2500,
      CLS: 0.1,
      INP: 200,
    },
    mobile: {
      LCP: 3000,
      CLS: 0.1,
      INP: 300,
    },
  };

  // Avaliar rating de um vital
  static rateVital(name: WebVital['name'], value: number): WebVital['rating'] {
    const threshold = this.thresholds[name];
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  // Processar medição de vital
  static processVital(
    name: WebVital['name'],
    value: number,
    id: string,
    delta: number = 0,
    navigationType: string = 'navigate'
  ): WebVital {
    return {
      name,
      value,
      rating: this.rateVital(name, value),
      delta,
      id,
      navigationType,
    };
  }

  // Analisar relatório de vitals
  static analyzeReport(report: WebVitalsReport): {
    score: number;
    passing: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    for (const vital of report.vitals) {
      if (vital.rating === 'poor') {
        score -= 20;
        issues.push(`${vital.name} is poor (${vital.value.toFixed(2)})`);
        recommendations.push(...this.getRecommendations(vital.name));
      } else if (vital.rating === 'needs-improvement') {
        score -= 10;
        issues.push(`${vital.name} needs improvement (${vital.value.toFixed(2)})`);
      }
    }

    // Normalize deviceType
    const normalizedDevice = report.deviceType === 'desktop' ? 'desktop' : 'mobile';
    const target = this.targets[normalizedDevice];
    const passing = report.vitals.every(v => {
      if (v.name === 'LCP') return v.value <= target.LCP;
      if (v.name === 'CLS') return v.value <= target.CLS;
      if (v.name === 'INP') return v.value <= target.INP;
      return true;
    });

    return {
      score: Math.max(0, score),
      passing,
      issues,
      recommendations,
    };
  }

  // Obter recomendações por vital
  private static getRecommendations(
    vital: WebVital['name']
  ): string[] {
    const recs: Record<WebVital['name'], string[]> = {
      LCP: [
        'Optimize images with WebP/AVIF format',
        'Implement lazy loading for images',
        'Use CDN for static assets',
        'Preload critical resources',
        'Reduce server response time',
      ],
      CLS: [
        'Set explicit width and height on images',
        'Reserve space for ads and embeds',
        'Avoid inserting content above existing content',
        'Use transform animations instead of layout-triggering properties',
      ],
      INP: [
        'Optimize JavaScript execution time',
        'Break up long tasks',
        'Use web workers for heavy computations',
        'Defer non-critical JavaScript',
        'Implement code splitting',
      ],
      FCP: [
        'Eliminate render-blocking resources',
        'Inline critical CSS',
        'Preconnect to required origins',
        'Reduce server response time',
      ],
      TTFB: [
        'Use a CDN',
        'Optimize database queries',
        'Implement caching strategies',
        'Upgrade server resources',
      ],
    };

    return recs[vital] || [];
  }

  // Calcular score geral
  static calculateOverallScore(vitals: WebVital[]): {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    passing: boolean;
  } {
    let totalScore = 0;
    let count = 0;

    for (const vital of vitals) {
      let vitalScore = 100;
      
      if (vital.rating === 'poor') vitalScore = 0;
      else if (vital.rating === 'needs-improvement') vitalScore = 50;

      totalScore += vitalScore;
      count++;
    }

    const score = count > 0 ? Math.round(totalScore / count) : 0;
    
    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';

    return {
      score,
      grade,
      passing: score >= 75,
    };
  }

  // Comparar com targets
  static compareWithTargets(
    vitals: WebVital[],
    deviceType: 'mobile' | 'desktop'
  ): {
    meetsTargets: boolean;
    gaps: Record<string, number>;
  } {
    // Normalize deviceType (tablet -> mobile)
    const normalizedDevice = deviceType === 'mobile' || deviceType === 'desktop' ? deviceType : 'mobile';
    const targets = this.targets[normalizedDevice];
    const gaps: Record<string, number> = {};
    let meetsTargets = true;

    for (const vital of vitals) {
      if (vital.name === 'LCP' && vital.value > targets.LCP) {
        gaps.LCP = vital.value - targets.LCP;
        meetsTargets = false;
      } else if (vital.name === 'CLS' && vital.value > targets.CLS) {
        gaps.CLS = vital.value - targets.CLS;
        meetsTargets = false;
      } else if (vital.name === 'INP' && vital.value > targets.INP) {
        gaps.INP = vital.value - targets.INP;
        meetsTargets = false;
      }
    }

    return { meetsTargets, gaps };
  }
}
