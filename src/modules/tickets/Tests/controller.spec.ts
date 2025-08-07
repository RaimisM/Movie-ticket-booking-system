import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import type { Database } from '@/database'
import controller from '../controller'

const mockRepo = {
  getTicketsByUserId: vi.fn(),
  createTicket: vi.fn(),
  countTicketsByScreeningId: vi.fn(),
}

const mockQueryBuilder = {
  selectAll: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  executeTakeFirst: vi.fn(),
}

const mockDb = {
  selectFrom: vi.fn().mockReturnValue(mockQueryBuilder),
} as unknown as Database

vi.mock('@/utils/middleware', () => ({
  jsonRoute: (handler: any) => async (req: any, res: any, next: any) => {
    try {
      await handler(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}))

describe('Tickets Controller', () => {
  let app: express.Application

  beforeEach(() => {
    vi.clearAllMocks()

    app = express()
    app.use(express.json())

    app.use('/tickets', controller(mockDb, mockRepo as any))

    app.use((err: any, req: any, res: any, _next: any) => {
      res.status(500).json({ error: err.message })
    })
  })

  describe('GET /', () => {
    it('should get tickets for valid userId', async () => {
      const mockTickets = [
        { id: 1, userId: 1, screeningId: 123 },
        { id: 2, userId: 1, screeningId: 456 }
      ]
      mockRepo.getTicketsByUserId.mockResolvedValue(mockTickets)

      const response = await request(app)
        .get('/tickets?userId=1')
        .expect(200)

      expect(mockRepo.getTicketsByUserId).toHaveBeenCalledWith(1)
      expect(response.body).toEqual(mockTickets)
    })

    it('should return 400 for invalid userId query param', async () => {
      const response = await request(app)
        .get('/tickets?userId=-1')
        .expect(400)

      expect(response.body).toMatchObject({
        message: 'Invalid userId',
        errors: expect.any(Object)
      })
    })

    it('should return 400 for missing userId query param', async () => {
      const response = await request(app)
        .get('/tickets')
        .expect(400)

      expect(response.body).toMatchObject({
        message: 'Invalid userId',
        errors: expect.any(Object)
      })
    })
  })

  describe('POST /', () => {
    const validTicketData = {
      userId: 1,
      screeningId: 123
    }

    const mockScreening = {
      id: 123,
      ticketAllocation: 100
    }

    it('should create ticket successfully when tickets are available', async () => {
      const createdTicket = { id: 1, ...validTicketData }

      mockQueryBuilder.executeTakeFirst.mockResolvedValue(mockScreening)
      mockRepo.countTicketsByScreeningId.mockResolvedValue(50)
      mockRepo.createTicket.mockResolvedValue(createdTicket)

      const response = await request(app)
        .post('/tickets')
        .send(validTicketData)
        .expect(201)

      expect(mockRepo.countTicketsByScreeningId).toHaveBeenCalledWith(123)
      expect(mockRepo.createTicket).toHaveBeenCalledWith(validTicketData)
      expect(response.body).toEqual(createdTicket)
    })

    it('should return 400 for invalid request body', async () => {
      const invalidData = {
        userId: -1,
        screeningId: 123
      }

      const response = await request(app)
        .post('/tickets')
        .send(invalidData)
        .expect(400)

      expect(response.body).toMatchObject({
        message: 'Invalid request body',
        errors: expect.any(Object)
      })
    })

    it('should return 404 when screening not found', async () => {
      mockQueryBuilder.executeTakeFirst.mockResolvedValue(null)

      const response = await request(app)
        .post('/tickets')
        .send(validTicketData)
        .expect(404)

      expect(response.body).toEqual({
        message: 'Screening not found'
      })
    })

    it('should return 400 when no tickets left', async () => {
      mockQueryBuilder.executeTakeFirst.mockResolvedValue(mockScreening)
      mockRepo.countTicketsByScreeningId.mockResolvedValue(100)

      const response = await request(app)
        .post('/tickets')
        .send(validTicketData)
        .expect(400)

      expect(response.body).toEqual({
        message: 'No tickets left for this screening'
      })
    })

    it('should return 400 when tickets oversold', async () => {
      const oversoldScreening = { ...mockScreening, ticketAllocation: 50 }
      mockQueryBuilder.executeTakeFirst.mockResolvedValue(oversoldScreening)
      mockRepo.countTicketsByScreeningId.mockResolvedValue(60)

      const response = await request(app)
        .post('/tickets')
        .send(validTicketData)
        .expect(400)

      expect(response.body).toEqual({
        message: 'No tickets left for this screening'
      })
    })

    it('should handle missing required fields in request body', async () => {
      const incompleteData = {
        userId: 1
      }

      const response = await request(app)
        .post('/tickets')
        .send(incompleteData)
        .expect(400)

      expect(response.body).toMatchObject({
        message: 'Invalid request body',
        errors: expect.any(Object)
      })
    })
  })
})
