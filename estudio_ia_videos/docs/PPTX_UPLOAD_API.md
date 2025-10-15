# 📡 API de Upload de PPTX (Real)

Status: ✅ Produção Ready
Última atualização: 14 de Outubro de 2025

Resumo
- Endpoint: POST /api/pptx/upload
- Autenticação: Sessão do usuário (Supabase)
- Rate limiting: 10 uploads por hora por usuário (headers X-RateLimit-*)
- Processamento: Assíncrono com extração real (PPTXProcessorReal) e geração de thumbnail
- Persistência: Tabelas pptx_uploads e pptx_slides (Supabase/Postgres)

1) Autenticação e Rate Limiting
- Requer usuário autenticado via Supabase (supabase.auth.getUser()).
- Se não autenticado: 401 Não autorizado.
- Rate limiting aplicado com withRateLimit(RATE_LIMITS.UPLOAD, 'user'):
  - Limite: 10 uploads/hora por usuário
  - Headers retornados em sucesso e erro:
    - X-RateLimit-Limit: número máximo permitido
    - X-RateLimit-Remaining: restante na janela
    - X-RateLimit-Reset: timestamp Unix de reset
    - Retry-After: somente quando 429 (em segundos)

2) Requisição
- Content-Type: multipart/form-data
- Campos obrigatórios:
  - file: Arquivo .pptx
  - project_id: UUID do projeto
- Validações:
  - Tamanho máximo: 50MB
  - Tipos permitidos:
    - application/vnd.openxmlformats-officedocument.presentationml.presentation
    - application/vnd.ms-powerpoint
- Permissão: Usuário deve ser owner do projeto ou colaborador (ou projeto público para GET).

3) Resposta (201 Created)
Exemplo:
{
  "upload_id": "f1f44b7a-...",
  "filename": "1739536800000_abcd1234.pptx",
  "original_filename": "Apresentacao.pptx",
  "file_size": 1234567,
  "status": "uploaded",
  "message": "Upload realizado com sucesso. Processamento iniciado."
}
Headers incluídos:
- X-RateLimit-Limit: 10
- X-RateLimit-Remaining: 9
- X-RateLimit-Reset: 1739537400000

Códigos de erro
- 400: Content-Type inválido, arquivo/projeto ausente, tipo de arquivo não permitido, tamanho excedido
- 401: Não autorizado
- 403: Sem permissão para o projeto
- 404: Projeto não encontrado
- 429: Limite de taxa excedido (inclui Retry-After)
- 500: Erro interno (falha ao salvar/ processar)

4) Processamento Assíncrono
- Função: processPPTXAsync(uploadId, filePath, projectId)
- Passos:
  - Atualiza pptx_uploads.status = 'processing' e processing_progress = 10
  - Lê o arquivo para Buffer
  - Extrai dados reais com PPTXProcessorReal.extract(buffer)
    - slides: número, título, conteúdo, notas, imagens, layout, shapes, textBlocks, animações
    - metadata: informações da apresentação
  - Atualiza processing_progress = 50
  - Gera thumbnail do primeiro slide com PPTXProcessorReal.generateThumbnail(buffer, projectId)
    - Salva thumbnail_url no primeiro slide
    - Salva preview_url em pptx_uploads
  - Insere todos os slides em pptx_slides
  - Finaliza pptx_uploads: status = 'completed', processing_progress = 100, slide_count, slides_data, metadata, preview_url, processed_at
  - Em caso de erro: status = 'failed', error_message

5) Consultar uploads
GET /api/pptx/upload?project_id=<UUID>&status=<opcional>
- Autenticado
- Permissões: owner, colaborador ou projeto público
- Retorna lista de uploads do projeto com contagem de slides
Exemplo de resposta:
{
  "uploads": [
    {
      "id": "...",
      "project_id": "...",
      "status": "completed",
      "processing_progress": 100,
      "slide_count": 12,
      "preview_url": "https://s3.../thumbnails/pptx/...jpg",
      "pptx_slides": { "count": 12 },
      "created_at": "2025-10-14T10:00:00Z"
    }
  ]
}

6) Exemplo cURL
Upload
curl -X POST "http://localhost:3001/api/pptx/upload" \
  -H "Authorization: Bearer <token opcional, se necessário>" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@C:/path/Apresentacao.pptx" \
  -F "project_id=00000000-0000-0000-0000-000000000000"

Listagem
curl "http://localhost:3001/api/pptx/upload?project_id=00000000-0000-0000-0000-000000000000"

7) Observações técnicas
- Miniatura: generateThumbnail envia para S3 (via S3StorageService.uploadFile) e retorna URL acessível; em fallback local, retorna URL local.
- Rate limiting: Estratégia sliding-window com Redis; limites configuráveis em app/lib/rate-limiter-real.ts (RATE_LIMITS.UPLOAD).
- Supabase: Persistência em pptx_uploads e pptx_slides; policies definidas em supabase/migrations/20250110000000_video_editor_pptx_schema.sql.
- Tamanho: Limite atual 50MB (MAX_FILE_SIZE); ajuste conforme necessidade.

8) Troubleshooting
- 429 Rate limit: Aguarde o tempo indicado em Retry-After e tente novamente.
- 401 Não autorizado: garanta sessão Supabase válida; o endpoint usa supabase.auth.getUser().
- 403 Permissões: verifique owner_id e colaboradores do projeto.
- 500 Erros internos: consulte logs do servidor; verifique S3/Redis/Supabase.

9) Roadmap
- Progresso em tempo real via websockets
- Pré-visualização dos slides com geração de imagens por slide
- Integração com pipeline de render de vídeo