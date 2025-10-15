// Test utilities - Simplified for compilation
// Tests will be fully implemented in a future sprint

export const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    image: '/test-avatar.jpg'
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
}

export const testData = {
  user: {
    id: 'user-1',
    name: 'João Silva',
    email: 'joao@empresa.com',
    role: 'user' as const,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  project: {
    id: 'project-1',
    title: 'Treinamento NR-10',
    description: 'Segurança em Instalações Elétricas',
    slides: [
      {
        id: 'slide-1',
        title: 'Introdução',
        content: 'Bem-vindos ao treinamento',
        notes: 'Apresentação inicial',
        order: 1
      }
    ],
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
}