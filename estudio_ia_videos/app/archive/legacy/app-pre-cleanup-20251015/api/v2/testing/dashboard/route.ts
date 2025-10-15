

/**
 * 🧪 Testing Framework API - Dashboard Data
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    
    // Simular dados de teste realísticos
    const suites = [
      {
        id: 'unit-components',
        name: 'Components Unit Tests',
        type: 'unit' as const,
        status: 'passed' as const,
        coverage: 96,
        duration: 1250,
        tests: 45,
        passed: 44,
        failed: 1,
        skipped: 0
      },
      {
        id: 'unit-services',
        name: 'Services Unit Tests',
        type: 'unit' as const,
        status: 'passed' as const,
        coverage: 94,
        duration: 850,
        tests: 32,
        passed: 31,
        failed: 1,
        skipped: 0
      },
      {
        id: 'integration-api',
        name: 'API Integration Tests',
        type: 'integration' as const,
        status: 'passed' as const,
        coverage: 90,
        duration: 2100,
        tests: 28,
        passed: 26,
        failed: 2,
        skipped: 0
      },
      {
        id: 'e2e-critical',
        name: 'Critical User Flows',
        type: 'e2e' as const,
        status: 'passed' as const,
        coverage: 100,
        duration: 15400,
        tests: 12,
        passed: 12,
        failed: 0,
        skipped: 0
      },
      {
        id: 'performance-load',
        name: 'Load Performance Tests',
        type: 'performance' as const,
        status: 'passed' as const,
        coverage: 88,
        duration: 8900,
        tests: 8,
        passed: 8,
        failed: 0,
        skipped: 0
      },
      {
        id: 'visual-regression',
        name: 'Visual Regression Tests',
        type: 'visual' as const,
        status: 'passed' as const,
        coverage: 92,
        duration: 3200,
        tests: 18,
        passed: 18,
        failed: 0,
        skipped: 0
      }
    ];

    const results = [
      {
        id: '1',
        suite: 'unit-components',
        name: 'VideoEditor Component',
        status: 'passed' as const,
        duration: 125,
        coverage: 98
      },
      {
        id: '2',
        suite: 'unit-components',
        name: 'Dashboard Component',
        status: 'passed' as const,
        duration: 89,
        coverage: 95
      },
      {
        id: '3',
        suite: 'integration-api',
        name: 'PPTX Upload API',
        status: 'passed' as const,
        duration: 234,
        coverage: 92
      },
      {
        id: '4',
        suite: 'e2e-critical',
        name: 'Complete Video Creation Flow',
        status: 'passed' as const,
        duration: 4500,
        coverage: 100
      }
    ];

    return NextResponse.json({
      success: true,
      suites,
      results,
      summary: {
        totalSuites: suites.length,
        totalTests: suites.reduce((sum, suite) => sum + suite.tests, 0),
        totalPassed: suites.reduce((sum, suite) => sum + suite.passed, 0),
        totalFailed: suites.reduce((sum, suite) => sum + suite.failed, 0),
        overallCoverage: Math.round(suites.reduce((sum, suite) => sum + suite.coverage, 0) / suites.length)
      }
    });

  } catch (error) {
    console.error('Testing dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load testing data' },
      { status: 500 }
    );
  }
}

