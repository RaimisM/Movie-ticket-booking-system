import request from 'supertest'
import express, { Request, Response } from 'express'
import screenings from '@/modules/screenings/controller'
import createTestDatabase from '../Tests/utils/createTestDatabase'
import BadRequest from '@/utils/errors/BadRequest'
import NotFound from '@/utils/errors/NotFound'

let app: express.Express
let db: Awaited<ReturnType<typeof createTestDatabase>>

beforeAll(async () => {
  db = await createTestDatabase()
  app = express()
  app.use(express.json())
  app.use('/screenings', screenings(db))

  // Simple error handling middleware for testing
  app.use((err: Error, _req: Request, res: Response) => {
    if (err instanceof BadRequest) {
      return res.status(400).json({ message: err.message })
    }
    if (err instanceof NotFound) {
      return res.status(404).json({ message: err.message })
    }
    return res.status(500).json({ message: 'Internal server error' })
  })
})

beforeEach(async () => {
  // Reset DB to clean state before each test
  await db.migrate.rollback()
  await db.migrate.latest()
  // Insert a sample movie for foreign key reference
  await db.insertInto('movies').values({ id: 1, title: 'Test Movie' }).execute()
})

afterAll(async () => {
  await db.destroy()
})

describe('POST /screenings', () => {
  it('should create a screening successfully', async () => {
    const futureDate = new Date(Date.now() + 3600 * 1000).toISOString()
    const res = await request(app)
      .post('/screenings')
      .send({
        movie_id: 1,
        timestamp: futureDate,
        ticket_allocation: 100,
      })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.movieId).toBe(1)
    expect(res.body.timestamp).toBe(futureDate)
    expect(res.body.ticketAllocation).toBe(100)
  })

  it('should reject array input', async () => {
    const res = await request(app)
      .post('/screenings')
      .send([
        {
          movie_id: 1,
          timestamp: new Date(Date.now() + 3600 * 1000).toISOString(),
          ticket_allocation: 100,
        },
      ])

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/Expected a single screening object/)
  })

  it('should reject invalid timestamp', async () => {
    const res = await request(app)
      .post('/screenings')
      .send({
        movie_id: 1,
        timestamp: 'not-a-date',
        ticket_allocation: 10,
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/Invalid timestamp/)
  })

  it('should reject past timestamp', async () => {
    const pastDate = new Date(Date.now() - 3600 * 1000).toISOString()
    const res = await request(app)
      .post('/screenings')
      .send({
        movie_id: 1,
        timestamp: pastDate,
        ticket_allocation: 10,
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/must be in the future/)
  })

  it('should reject missing movie', async () => {
    const futureDate = new Date(Date.now() + 3600 * 1000).toISOString()
    const res = await request(app)
      .post('/screenings')
      .send({
        movie_id: 9999,
        timestamp: futureDate,
        ticket_allocation: 10,
      })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/not in the database/)
  })
})

describe('GET /screenings', () => {
  it('should return future screenings', async () => {
    const futureDate = new Date(Date.now() + 3600 * 1000).toISOString()
    await db.insertInto('screenings').values({
      movieId: 1,
      timestamp: futureDate,
      ticketAllocation: 50,
    }).execute()

    const res = await request(app).get('/screenings')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('should return 404 if no screenings', async () => {
    const res = await request(app).get('/screenings')

    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/No screenings found/)
  })
})

describe('GET /screenings/:id', () => {
  it('should return a screening by id', async () => {
    const futureDate = new Date(Date.now() + 3600 * 1000).toISOString()
    const inserted = await db.insertInto('screenings').values({
      movieId: 1,
      timestamp: futureDate,
      ticketAllocation: 50,
    }).returningAll().executeTakeFirst()

    const res = await request(app).get(`/screenings/${inserted!.id}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(inserted!.id)
  })

  it('should return 404 if screening not found', async () => {
    const res = await request(app).get('/screenings/9999')

    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/Screening not found/)
  })
})

describe('DELETE /screenings/:id', () => {
  it('should delete a screening by id', async () => {
    const futureDate = new Date(Date.now() + 3600 * 1000).toISOString()
    const inserted = await db.insertInto('screenings').values({
      movieId: 1,
      timestamp: futureDate,
      ticketAllocation: 50,
    }).returningAll().executeTakeFirst()

    const res = await request(app).delete(`/screenings/${inserted!.id}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(inserted!.id)

    const getRes = await request(app).get(`/screenings/${inserted!.id}`)
    expect(getRes.status).toBe(404)
  })

  it('should return 404 when deleting non-existing screening', async () => {
    const res = await request(app).delete('/screenings/9999')

    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/Screening not found/)
  })
})
