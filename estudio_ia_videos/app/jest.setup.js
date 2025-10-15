jest.mock('next/server', () => ({
  NextResponse: {
    json: (body, init) => ({
      status: init?.status ?? 200,
      json: async () => body,
      body
    })
  }
}))

require('@testing-library/jest-dom')

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.AWS_ACCESS_KEY_ID = 'test-access-key'
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key'
process.env.AWS_REGION = 'us-east-1'
process.env.AWS_S3_BUCKET = 'test-bucket'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.AUDIO2FACE_API_URL = 'http://localhost:8011'
process.env.REDIS_URL = 'redis://localhost:6379'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}


// Mock File and Blob for browser APIs
global.File = class MockFile {
  constructor(parts, filename, properties) {
    this.parts = parts
    this.name = filename
    this.lastModified = Date.now()
    this.size = parts.reduce((acc, part) => acc + (Buffer.isBuffer(part) ? part.length : Buffer.from(part).length), 0)
    this.type = properties?.type || ''
  }

  async arrayBuffer() {
    const buffers = this.parts.map(part => (Buffer.isBuffer(part) ? part : Buffer.from(part)))
    const buffer = Buffer.concat(buffers)
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  }
}


global.Blob = class MockBlob {
  constructor(parts, properties) {
    this.parts = parts
    this.size = parts.reduce((acc, part) => acc + part.length, 0)
    this.type = properties?.type || ''
  }
}

// Mock DOM methods when window is available
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock para WebSocket se necessário
global.WebSocket = jest.fn().mockImplementation(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}))

// Timeout global para testes assíncronos
jest.setTimeout(120000) // 2 minutos

// Cleanup após cada teste
afterEach(() => {
  jest.clearAllMocks()
})
