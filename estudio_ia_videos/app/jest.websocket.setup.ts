/**
 * Setup para testes WebSocket
 * 
 * Configura timeout e cleanup global
 */

// Aumentar timeout para testes WebSocket
jest.setTimeout(15000)

// Cleanup global após cada teste
afterEach(() => {
  // Aguardar um pouco para garantir que todas conexões foram fechadas
  return new Promise(resolve => setTimeout(resolve, 100))
})

// Mock para NextAuth durante testes
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve({
    user: {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com'
    }
  }))
}))

// Suppress console.log durante testes (opcional)
global.console = {
  ...console,
  log: jest.fn(), // Comentar esta linha para ver logs durante testes
}
