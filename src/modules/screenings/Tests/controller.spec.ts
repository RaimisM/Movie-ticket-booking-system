import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import express, { Express } from 'express'
import screenings from '../controller'

const mockDb = {
  selectFrom: vi.fn(),
  insertInto: vi.fn(),
  deleteFrom: vi.fn(),
}

function createSelectFromMock(returnValue: any) {
  return {
    select: vi.fn().mockReturnThis(),
    selectAll: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue(returnValue),
    executeTakeFirst: vi.fn().mockResolvedValue(Array.isArray(returnValue) ? returnValue[0] : returnValue),
  }
}
function createInsertIntoMock(returnValue: any) {
  return {
    values: vi.fn().mockReturnThis(),
    returningAll: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue(returnValue),
  }
}
function createDeleteFromMock(returnValue: any) {
  return {
    where: vi.fn().mockReturnThis(),
    returningAll: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue(returnValue),
  }
}

describe('screenings controller', () => {
  let app: Express

  function errorHandler(err: any, _req: any, res: any, _next: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ message: err.message })
    } else {
      res.status(500).json({ message: 'Internal Server Error' })
    }
  }

  beforeEach(() => {
    vi.resetAllMocks()
    app = express()
    app.use(express.json())
    app.use('/screenings', screenings(mockDb as any))
    app.use(errorHandler)
  })

  it('POST /screenings - success', async () => {
    const movieId = 1
    const timestamp = new Date(Date.now() + 100000).toISOString()
    const ticketAllocation = 10

    mockDb.selectFrom.mockReturnValue(createSelectFromMock({ id: movieId }))
    mockDb.insertInto.mockReturnValue(createInsertIntoMock([{ id: 1, movieId, timestamp, ticketAllocation }]))

    const res = await request(app)
      .post('/screenings')
      .send({ movie_id: movieId, timestamp, ticket_allocation: ticketAllocation })

    expect(res.status).toBe(201)
    expect(res.body).toEqual([{ id: 1, movieId, timestamp, ticketAllocation }])
  })

  it('POST /screenings - rejects array body', async () => {
    const res = await request(app)
      .post('/screenings')
      .send([{ movie_id: 1, timestamp: new Date().toISOString(), ticket_allocation: 5 }])

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Expected a single screening object, not an array')
  })

  it('POST /screenings - invalid timestamp', async () => {
    const res = await request(app)
      .post('/screenings')
      .send({ movie_id: 1, timestamp: 'not-a-date', ticket_allocation: 5 })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid timestamp')
  })

  it('POST /screenings - timestamp not in future', async () => {
    const pastTimestamp = new Date(Date.now() - 100000).toISOString()
    const res = await request(app)
      .post('/screenings')
      .send({ movie_id: 1, timestamp: pastTimestamp, ticket_allocation: 5 })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Screening timestamp must be in the future')
  })

  it('POST /screenings - movie not found', async () => {
    mockDb.selectFrom.mockReturnValue(createSelectFromMock(null))

    const futureTimestamp = new Date(Date.now() + 100000).toISOString()
    const res = await request(app)
      .post('/screenings')
      .send({ movie_id: 999, timestamp: futureTimestamp, ticket_allocation: 5 })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('MovieId not in the database')
  })

  it('GET /screenings - success', async () => {
    const screeningsList = [{ id: 1, movieId: 1, timestamp: new Date(Date.now() + 100000).toISOString(), ticketAllocation: 5 }]
    mockDb.selectFrom.mockReturnValue(createSelectFromMock(screeningsList))

    const res = await request(app).get('/screenings')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(screeningsList)
  })

  it('GET /screenings - no screenings found', async () => {
    mockDb.selectFrom.mockReturnValue(createSelectFromMock([]))

    const res = await request(app).get('/screenings')

    expect(res.status).toBe(404)
    expect(res.body.message).toBe('No screenings found')
  })

  it('GET /screenings/:id - success', async () => {
    const screening = { id: 1, movieId: 1, timestamp: new Date(Date.now() + 100000).toISOString(), ticketAllocation: 5 }
    mockDb.selectFrom.mockReturnValue(createSelectFromMock(screening))

    const res = await request(app).get('/screenings/1')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(screening)
  })

  it('GET /screenings/:id - invalid id', async () => {
    const res = await request(app).get('/screenings/abc')

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid screening ID')
  })

  it('GET /screenings/:id - screening not found', async () => {
    mockDb.selectFrom.mockReturnValue(createSelectFromMock(null))

    const res = await request(app).get('/screenings/999')

    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Screening not found')
  })

  it('DELETE /screenings/:id - success', async () => {
    const deletedScreening = { id: 1, movieId: 1, timestamp: new Date(Date.now() + 100000).toISOString(), ticketAllocation: 5 }
    mockDb.deleteFrom.mockReturnValue(createDeleteFromMock([deletedScreening]))

    const res = await request(app).delete('/screenings/1')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(deletedScreening)
  })

  it('DELETE /screenings/:id - invalid id', async () => {
    const res = await request(app).delete('/screenings/abc')

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid screening ID')
  })

  it('DELETE /screenings/:id - screening not found', async () => {
    mockDb.deleteFrom.mockReturnValue(createDeleteFromMock([]))

    const res = await request(app).delete('/screenings/999')

    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Screening not found')
  })
})
