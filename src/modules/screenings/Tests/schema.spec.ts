import { describe, it, expect } from 'vitest'
import { parse, parseId, parseInsertable, parseUpdatable } from '../schema'

describe('screenings schema', () => {
  const validRecord = {
    id: 1,
    movieId: 5,
    timestamp: '2025-08-05T12:30:00Z',
    ticketAllocation: 50,
  }

  it('should parse a valid record', () => {
    const result = parse(validRecord)
    expect(result).toEqual(validRecord)
  })

  it('should reject a negative id', () => {
    expect(() => parse({ ...validRecord, id: -1 })).toThrow()
  })

  it('should reject ticketAllocation over 100', () => {
    expect(() => parse({ ...validRecord, ticketAllocation: 101 })).toThrow()
  })

  it('should parse valid insertable without id', () => {
    const insertable = {
      movieId: 5,
      timestamp: '2025-08-05T12:30:00Z',
      ticketAllocation: 50,
    }
    const result = parseInsertable(insertable)
    expect(result).toEqual(insertable)
  })

  it('should reject invalid insertable', () => {
    const invalid = { movieId: 5 } // missing fields
    expect(() => parseInsertable(invalid)).toThrow()
  })

  it('should parse a valid ID', () => {
    expect(parseId('42')).toBe(42)
  })

  it('should reject invalid ID', () => {
    expect(() => parseId('abc')).toThrow()
  })

  it('should parse partial update', () => {
    const result = parseUpdatable({ ticketAllocation: 90 })
    expect(result).toEqual({ ticketAllocation: 90 })
  })

  it('should reject invalid update', () => {
    expect(() => parseUpdatable({ ticketAllocation: 200 })).toThrow()
  })

  it('should reject negative movieId', () => {
    expect(() => parse({ ...validRecord, movieId: -1 })).toThrow()
  })

  it('should reject zero ticketAllocation', () => {
    expect(() => parse({ ...validRecord, ticketAllocation: 0 })).toThrow()
  })

  it('should coerce string id to number', () => {
    const result = parse({ ...validRecord, id: '123' })
    expect(result.id).toBe(123)
  })
})
