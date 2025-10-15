
/**
 * 📚 API Documentation (Swagger/OpenAPI)
 * 
 * Auto-generated API documentation
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const OPENAPI_SPEC = {
  openapi: '3.0.0',
  info: {
    title: 'Estúdio IA de Vídeos API',
    version: '1.0.0',
    description: 'API completa para criação de vídeos de treinamento com IA',
    contact: {
      name: 'Suporte',
      email: 'suporte@estudioiavideos.com.br',
    },
  },
  servers: [
    {
      url: 'https://treinx.abacusai.app',
      description: 'Produção',
    },
    {
      url: 'https://staging.treinx.abacusai.app',
      description: 'Staging',
    },
    {
      url: 'http://localhost:3000',
      description: 'Desenvolvimento',
    },
  ],
  paths: {
    '/api/health': {
      get: {
        summary: 'Health Check',
        description: 'Verifica o status da aplicação',
        tags: ['System'],
        responses: {
          '200': {
            description: 'Sistema saudável',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptime: { type: 'number' },
                    checks: { type: 'object' },
                  },
                },
              },
            },
          },
          '503': {
            description: 'Sistema indisponível',
          },
        },
      },
    },
    '/api/metrics': {
      get: {
        summary: 'Prometheus Metrics',
        description: 'Métricas no formato Prometheus',
        tags: ['System'],
        responses: {
          '200': {
            description: 'Métricas disponíveis',
            content: {
              'text/plain': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    '/api/tts/generate': {
      post: {
        summary: 'Gerar TTS',
        description: 'Gera áudio a partir de texto usando TTS',
        tags: ['TTS'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['text', 'provider'],
                properties: {
                  text: { type: 'string', maxLength: 5000 },
                  provider: { type: 'string', enum: ['azure', 'elevenlabs', 'google'] },
                  voice: { type: 'string' },
                  speed: { type: 'number', minimum: 0.5, maximum: 2.0 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Áudio gerado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    audioUrl: { type: 'string', format: 'uri' },
                    duration: { type: 'number' },
                    cached: { type: 'boolean' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Parâmetros inválidos',
          },
          '429': {
            description: 'Rate limit excedido',
          },
          '500': {
            description: 'Erro ao gerar áudio',
          },
        },
      },
    },
    '/api/projects': {
      get: {
        summary: 'Listar Projetos',
        description: 'Lista todos os projetos do usuário',
        tags: ['Projects'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          '200': {
            description: 'Lista de projetos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    projects: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          title: { type: 'string' },
                          createdAt: { type: 'string', format: 'date-time' },
                          updatedAt: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Não autenticado',
          },
        },
      },
      post: {
        summary: 'Criar Projeto',
        description: 'Cria um novo projeto',
        tags: ['Projects'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string', maxLength: 200 },
                  description: { type: 'string', maxLength: 1000 },
                  templateId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Projeto criado com sucesso',
          },
          '400': {
            description: 'Dados inválidos',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  tags: [
    { name: 'System', description: 'Endpoints do sistema' },
    { name: 'TTS', description: 'Text-to-Speech' },
    { name: 'Projects', description: 'Gerenciamento de projetos' },
  ],
}

export async function GET(request: NextRequest) {
  // Verificar se é request para UI
  const accept = request.headers.get('accept') || ''
  
  if (accept.includes('text/html')) {
    // Retornar HTML com Swagger UI
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>API Documentation - Estúdio IA de Vídeos</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
    .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        spec: ${JSON.stringify(OPENAPI_SPEC)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>
    `
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  }
  
  // Retornar JSON spec
  return NextResponse.json(OPENAPI_SPEC)
}
