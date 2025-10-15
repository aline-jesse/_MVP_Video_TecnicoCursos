
/**
 * 🧪 Testing Framework Production-Ready
 * Framework completo de testes para produção
 */

import { productionLogger as logger, metricsCollector } from './logger'
import { NextRequest } from 'next/server'

// Tipos de teste
type TestType = 'unit' | 'integration' | 'e2e' | 'load' | 'security'

interface TestResult {
  name: string
  type: TestType
  passed: boolean
  duration: number
  error?: string
  details?: any
}

interface TestSuite {
  name: string
  tests: TestFunction[]
  beforeAll?: () => Promise<void>
  afterAll?: () => Promise<void>
  beforeEach?: () => Promise<void>
  afterEach?: () => Promise<void>
}

type TestFunction = {
  name: string
  type: TestType
  fn: () => Promise<void>
  timeout?: number
}

class TestRunner {
  private suites: Map<string, TestSuite> = new Map()
  private results: TestResult[] = []
  
  // Registrar suite de testes
  registerSuite(name: string, suite: TestSuite) {
    this.suites.set(name, suite)
    logger.info('Test suite registered', { name, testCount: suite.tests.length })
  }
  
  // Executar todos os testes
  async runAll(): Promise<{
    totalTests: number
    passed: number
    failed: number
    duration: number
    results: TestResult[]
  }> {
    const start = Date.now()
    this.results = []
    
    logger.info('Starting test execution', { suites: this.suites.size })
    
    for (const [suiteName, suite] of this.suites.entries()) {
      await this.runSuite(suiteName, suite)
    }
    
    const duration = Date.now() - start
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.length - passed
    
    logger.info('Test execution completed', {
      totalTests: this.results.length,
      passed,
      failed,
      duration
    })
    
    metricsCollector.timing('tests_execution_duration', duration)
    metricsCollector.increment('tests_executed', this.results.length)
    metricsCollector.increment('tests_passed', passed)
    metricsCollector.increment('tests_failed', failed)
    
    return {
      totalTests: this.results.length,
      passed,
      failed,
      duration,
      results: this.results
    }
  }
  
  // Executar suite específica
  async runSuite(suiteName: string, suite: TestSuite): Promise<TestResult[]> {
    const suiteResults: TestResult[] = []
    
    logger.info('Running test suite', { suite: suiteName })
    
    try {
      // beforeAll
      if (suite.beforeAll) {
        await suite.beforeAll()
      }
      
      // Executar cada teste
      for (const test of suite.tests) {
        try {
          // beforeEach
          if (suite.beforeEach) {
            await suite.beforeEach()
          }
          
          const result = await this.runTest(test)
          suiteResults.push(result)
          this.results.push(result)
          
          // afterEach
          if (suite.afterEach) {
            await suite.afterEach()
          }
          
        } catch (error: any) {
          const failedResult: TestResult = {
            name: test.name,
            type: test.type,
            passed: false,
            duration: 0,
            error: error.message
          }
          suiteResults.push(failedResult)
          this.results.push(failedResult)
        }
      }
      
      // afterAll
      if (suite.afterAll) {
        await suite.afterAll()
      }
      
    } catch (error: any) {
      logger.error('Test suite failed', { suite: suiteName, error: error.message })
    }
    
    const passed = suiteResults.filter(r => r.passed).length
    logger.info('Test suite completed', { 
      suite: suiteName, 
      total: suiteResults.length,
      passed,
      failed: suiteResults.length - passed
    })
    
    return suiteResults
  }
  
  // Executar teste individual
  private async runTest(test: TestFunction): Promise<TestResult> {
    const start = Date.now()
    
    try {
      const timeout = test.timeout || 30000 // 30s default
      
      await Promise.race([
        test.fn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), timeout)
        )
      ])
      
      const duration = Date.now() - start
      
      logger.debug('Test passed', { name: test.name, duration })
      
      return {
        name: test.name,
        type: test.type,
        passed: true,
        duration
      }
      
    } catch (error: any) {
      const duration = Date.now() - start
      
      logger.error('Test failed', { name: test.name, error: error.message, duration })
      
      return {
        name: test.name,
        type: test.type,
        passed: false,
        duration,
        error: error.message
      }
    }
  }
  
  // Obter resultados
  getResults(): TestResult[] {
    return this.results
  }
  
  // Limpar resultados
  clearResults(): void {
    this.results = []
  }
}

// Instância global do test runner
export const testRunner = new TestRunner()

// Helper functions para testes
class TestHelpers {
  
  // Assert básico
  static assert(condition: boolean, message: string = 'Assertion failed') {
    if (!condition) {
      throw new Error(message)
    }
  }
  
  // Assert igualdade
  static assertEqual<T>(actual: T, expected: T, message?: string) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, but got ${actual}`)
    }
  }
  
  // Assert não nulo
  static assertNotNull<T>(value: T, message?: string) {
    if (value === null || value === undefined) {
      throw new Error(message || 'Value should not be null or undefined')
    }
  }
  
  // Assert tipo
  static assertType(value: any, expectedType: string, message?: string) {
    if (typeof value !== expectedType) {
      throw new Error(message || `Expected type ${expectedType}, but got ${typeof value}`)
    }
  }
  
  // Assert array contém
  static assertContains<T>(array: T[], item: T, message?: string) {
    if (!array.includes(item)) {
      throw new Error(message || `Array does not contain expected item`)
    }
  }
  
  // Assert lança erro
  static async assertThrows(fn: () => Promise<any> | any, expectedError?: string) {
    try {
      await fn()
      throw new Error('Expected function to throw an error')
    } catch (error: any) {
      if (expectedError && !error.message.includes(expectedError)) {
        throw new Error(`Expected error containing "${expectedError}", but got "${error.message}"`)
      }
    }
  }
  
  // Mock de fetch
  static mockFetch(responses: Array<{ url: string; response: any; status?: number }>) {
    const originalFetch = global.fetch
    
    global.fetch = jest.fn((url: string) => {
      const mock = responses.find(r => url.includes(r.url))
      if (mock) {
        return Promise.resolve({
          ok: (mock.status || 200) >= 200 && (mock.status || 200) < 300,
          status: mock.status || 200,
          json: () => Promise.resolve(mock.response),
          text: () => Promise.resolve(JSON.stringify(mock.response))
        } as Response)
      }
      
      return Promise.reject(new Error(`No mock found for URL: ${url}`))
    }) as jest.MockedFunction<typeof fetch>
    
    return () => {
      global.fetch = originalFetch
    }
  }
  
  // Mock de API request
  static createMockRequest(options: {
    method?: string
    url?: string
    body?: any
    headers?: Record<string, string>
  }): NextRequest {
    const { method = 'GET', url = 'http://localhost:3000', body, headers = {} } = options
    
    return new NextRequest(url, {
      method,
      headers: new Headers(headers),
      body: body ? JSON.stringify(body) : undefined
    })
  }
  
  // Delay para testes assíncronos
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  // Gerar dados de teste
  static generateTestData(type: 'user' | 'video' | 'audio', count: number = 1) {
    const data = []
    
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'user':
          data.push({
            id: `test-user-${i}`,
            email: `test${i}@example.com`,
            name: `Test User ${i}`,
            createdAt: new Date().toISOString()
          })
          break
          
        case 'video':
          data.push({
            id: `test-video-${i}`,
            title: `Test Video ${i}`,
            duration: Math.floor(Math.random() * 300) + 30, // 30-330s
            url: `http://example.com/video${i}.mp4`,
            createdAt: new Date().toISOString()
          })
          break
          
        case 'audio':
          data.push({
            id: `test-audio-${i}`,
            text: `This is test audio number ${i}`,
            voice: 'pt-BR-Neural2-A',
            duration: Math.floor(Math.random() * 60) + 5, // 5-65s
            url: `http://example.com/audio${i}.mp3`,
            createdAt: new Date().toISOString()
          })
          break
      }
    }
    
    return count === 1 ? data[0] : data
  }
}

// Decorador para marcar funções de teste
export function test(name: string, type: TestType = 'unit', timeout?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      logger.debug('Executing test', { name, type })
      return await originalMethod.apply(this, args)
    }
    
    // Adicionar metadados
    descriptor.value.testName = name
    descriptor.value.testType = type
    descriptor.value.timeout = timeout
  }
}

// Suite de testes de exemplo
export const exampleTestSuite: TestSuite = {
  name: 'example-tests',
  tests: [
    {
      name: 'Should pass basic assertion',
      type: 'unit',
      fn: async () => {
        TestHelpers.assert(true, 'This should pass')
        TestHelpers.assertEqual(2 + 2, 4, 'Math should work')
      }
    },
    {
      name: 'Should handle async operations',
      type: 'integration',
      fn: async () => {
        await TestHelpers.delay(100)
        TestHelpers.assert(Date.now() > 0, 'Date should be valid')
      }
    },
    {
      name: 'Should validate API response structure',
      type: 'integration',
      fn: async () => {
        const mockData = TestHelpers.generateTestData('user', 1) as any
        TestHelpers.assertType(mockData.id, 'string')
        TestHelpers.assertType(mockData.email, 'string')
        TestHelpers.assert(mockData.email.includes('@'), 'Email should contain @')
      }
    }
  ],
  beforeAll: async () => {
    logger.info('Setting up example test suite')
  },
  afterAll: async () => {
    logger.info('Cleaning up example test suite')
  }
}

// Registrar suite de exemplo
testRunner.registerSuite('example', exampleTestSuite)

export { testRunner as default, TestRunner, type TestResult, type TestSuite, type TestFunction }
export { TestHelpers }
