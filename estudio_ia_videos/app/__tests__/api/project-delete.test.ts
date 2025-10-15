process.env.PRISMA_CLIENT_ENGINE_TYPE = 'binary'
const { PrismaClient } = require('@prisma/client')
const { DELETE, GET } = require('@/app/api/projects/[projectId]/route')

const prisma = new PrismaClient()

describe('/api/projects/[projectId] DELETE', () => {
  const uniqueSuffix = Date.now()
  const userEmail = `project-delete-${uniqueSuffix}@example.com`
  let userId: string
  let projectId: string

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        name: 'Project Delete Test User'
      }
    })
    userId = user.id

    const project = await prisma.project.create({
      data: {
        name: 'Project Delete API Test',
        status: 'COMPLETED',
        userId,
        originalFileName: 'delete-test.pptx',
        pptxUrl: '/uploads/pptx/delete-test.pptx',
        totalSlides: 1,
        slides: {
          create: {
            title: 'Slide 1',
            content: 'Conteúdo para exclusão',
            slideNumber: 1,
            duration: 5
          }
        }
      }
    })
    projectId = project.id
  })

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined)
    }
    await prisma.$disconnect()
  })

  it('remove projeto e slides associados', async () => {
    const response = await DELETE({} as any, { params: { projectId } })
    expect(response.status).toBe(200)

    const payload = await response.json()
    expect(payload.success).toBe(true)

    const slidesCount = await prisma.slide.count({ where: { projectId } })
    expect(slidesCount).toBe(0)

    const projectResponse = await GET({ url: `http://localhost/api/projects/${projectId}` } as any, {
      params: { projectId }
    })
    expect(projectResponse.status).toBe(404)
  })
})
