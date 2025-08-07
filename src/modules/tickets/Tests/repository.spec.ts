import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Database } from '@/database'
import repository from '../repository'

// Mock database
const mockDb = {
  insertInto: vi.fn(),
  selectFrom: vi.fn(),
  deleteFrom: vi.fn(),
} as unknown as Database

// Mock query builder methods
const mockQueryBuilder = {
  values: vi.fn().mockReturnThis(),
  returningAll: vi.fn().mockReturnThis(),
  execute: vi.fn(),
  executeTakeFirst: vi.fn(),
  selectAll: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
}

describe('Repository', () => {
  const repo = repository(mockDb)

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb.insertInto = vi.fn().mockReturnValue(mockQueryBuilder)
    mockDb.selectFrom = vi.fn().mockReturnValue(mockQueryBuilder)
    mockDb.deleteFrom = vi.fn().mockReturnValue(mockQueryBuilder)
  })

  describe('createTicket', () => {
    it('should create a single ticket with valid data', async () => {
      const ticketData = { userId: 1, screeningId: 123 }
      const expectedResult = [{ id: 1, ...ticketData }]
      
      mockQueryBuilder.execute.mockResolvedValue(expectedResult)

      const result = await repo.createTicket(ticketData)

      expect(mockDb.insertInto).toHaveBeenCalledWith('tickets')
      expect(mockQueryBuilder.values).toHaveBeenCalledWith([ticketData])
      expect(result).toEqual(expectedResult)
    })

    it('should create multiple tickets with bulk insert', async () => {
      const ticketsData = [
        { userId: 1, screeningId: 123 },
        { userId: 2, screeningId: 456 }
      ]
      const expectedResult = [
        { id: 1, ...ticketsData[0] },
        { id: 2, ...ticketsData[1] }
      ]
      
      mockQueryBuilder.execute.mockResolvedValue(expectedResult)

      const result = await repo.createTicket(ticketsData)

      expect(mockQueryBuilder.values).toHaveBeenCalledWith(ticketsData)
      expect(result).toEqual(expectedResult)
    })

    it('should throw error for invalid ticket data', async () => {
      const invalidData = { userId: -1, screeningId: 123 }

      await expect(repo.createTicket(invalidData)).rejects.toThrow('Invalid ticket data')
    })
  })

  describe('getTicketById', () => {
    it('should get ticket by valid ID', async () => {
      const ticketId = 1
      const expectedResult = { id: 1, userId: 1, screeningId: 123 }
      
      mockQueryBuilder.executeTakeFirst.mockResolvedValue(expectedResult)

      const result = await repo.getTicketById(ticketId)

      expect(mockDb.selectFrom).toHaveBeenCalledWith('tickets')
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id', '=', ticketId)
      expect(result).toEqual(expectedResult)
    })

    it('should throw error for invalid ticket ID', async () => {
      const invalidId = -1

      await expect(repo.getTicketById(invalidId)).rejects.toThrow('Invalid ticket ID')
    })
  })

  describe('getTicketsByUserId', () => {
    it('should get tickets by valid user ID', async () => {
      const userId = 1
      const expectedResult = [
        { id: 1, userId: 1, screeningId: 123 },
        { id: 2, userId: 1, screeningId: 456 }
      ]
      
      mockQueryBuilder.execute.mockResolvedValue(expectedResult)

      const result = await repo.getTicketsByUserId(userId)

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('userId', '=', userId)
      expect(result).toEqual(expectedResult)
    })

    it('should throw error for invalid user ID', async () => {
      const invalidUserId = 0

      await expect(repo.getTicketsByUserId(invalidUserId)).rejects.toThrow('Invalid user ID')
    })
  })

  describe('deleteTicket', () => {
    it('should delete ticket by valid ID', async () => {
      const ticketId = 1
      const expectedResult = { id: 1, userId: 1, screeningId: 123 }
      
      mockQueryBuilder.executeTakeFirst.mockResolvedValue(expectedResult)

      const result = await repo.deleteTicket(ticketId)

      expect(mockDb.deleteFrom).toHaveBeenCalledWith('tickets')
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id', '=', ticketId)
      expect(result).toEqual(expectedResult)
    })

    it('should throw error for invalid delete ID', async () => {
      const invalidId = -5

      await expect(repo.deleteTicket(invalidId)).rejects.toThrow('Invalid ticket ID')
    })
  })

  describe('countTicketsByScreeningId', () => {
    it('should count tickets by valid screening ID', async () => {
      const screeningId = 123
      const mockCountResult = { count: '5' }
      
      mockQueryBuilder.executeTakeFirst.mockResolvedValue(mockCountResult)

      const result = await repo.countTicketsByScreeningId(screeningId)

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('screeningId', '=', screeningId)
      expect(result).toBe(5)
    })

    it('should throw error for invalid screening ID', async () => {
      const invalidScreeningId = 0

      await expect(repo.countTicketsByScreeningId(invalidScreeningId)).rejects.toThrow('Invalid screening ID')
    })
  })
})