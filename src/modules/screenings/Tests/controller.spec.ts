import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import screeningsRouter from '../controller'
import * as repoModule from '../repository'
import * as schemaModule from '../schema'

const mockDb = {
  selectFrom: vi.fn(() => ({
    selectAll: () => ({
      where: () => ({
        executeTakeFirst: vi.fn(),
      }),
    }),
  })),
}

const mockRepo = {
  createScreening: vi.fn(),
  getScreenings: vi.fn(),
  getScreeningById: vi.fn(),
  delete: vi.fn(),
}

function buildApp() {
  vi.spyOn(repoModule, 'default').mockReturnValue(mockRepo)
  const app = express()
  app.use(express.json())
  app.use('/screenings', screeningsRouter(mockDb as any))
  return app
}

describe('Screenings Controller', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('POST /screenings - rejects array body', async () => {
    const app = buildApp()
    const res = await request(app)
      .post('/screenings')
      .send([{ movieId: 1, timestamp: new Date(Date.now() + 1000).toISOString() }])
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Expected a single screening object, not an array')
  })

  it('GET /screenings - returns screenings', async () => {
    const app = buildApp()
    mockRepo.getScreenings.mockResolvedValue([{ id: 1, movieId: 1 }])
    const res = await request(app).get('/screenings')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })

  it('GET /screenings - no screenings found', async () => {
    const app = buildApp()
    mockRepo.getScreenings.mockResolvedValue([])
    const res = await request(app).get('/screenings')
    expect(res.status).toBe(404)
    expect(res.body.message).toBe('No screenings found')
  })

  it('GET /screenings/:id - invalid id', async () => {
    const app = buildApp()
    vi.spyOn(schemaModule, 'parseId').mockImplementation(() => { throw new Error() })
    const res = await request(app).get('/screenings/abc')
    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid screening ID')
  })

  it('GET /screenings/:id - screening found', async () => {
    const app = buildApp()
    vi.spyOn(schemaModule, 'parseId').mockReturnValue(1)
    mockRepo.getScreeningById.mockResolvedValue({ id: 1, movieId: 1 })
    const res = await request(app).get('/screenings/1')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 1 })
  })

  it('GET /screenings/:id - screening not found', async () => {
    const app = buildApp()
    vi.spyOn(schemaModule, 'parseId').mockReturnValue(1)
    mockRepo.getScreeningById.mockResolvedValue(null)
    const res = await request(app).get('/screenings/1')
    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Screening not found')
  })

  it('DELETE /screenings/:id - success', async () => {
    const app = buildApp()
    vi.spyOn(schemaModule, 'parseId').mockReturnValue(1)
    mockRepo.delete.mockResolvedValue({ id: 1 })
    const res = await request(app).delete('/screenings/1')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 1 })
  })
})
