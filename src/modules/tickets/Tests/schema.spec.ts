import { describe, it, expect } from 'vitest'
import { 
  CreateTicketSchema, 
  GetUserTicketsQuerySchema,
  type CreateTicketInput,
  type GetUserTicketsQuery
} from '../schema'

describe('CreateTicketSchema', () => {
  it('should validate valid input', () => {
    const validInput = {
      userId: 1,
      screeningId: 123
    }
    
    const result = CreateTicketSchema.parse(validInput)
    expect(result).toEqual(validInput)
  })

  it('should reject negative userId', () => {
    const invalidInput = {
      userId: -1,
      screeningId: 123
    }
    
    expect(() => CreateTicketSchema.parse(invalidInput)).toThrow('userId must be a positive integer')
  })

  it('should reject zero userId', () => {
    const invalidInput = {
      userId: 0,
      screeningId: 123
    }
    
    expect(() => CreateTicketSchema.parse(invalidInput)).toThrow('userId must be a positive integer')
  })

  it('should reject negative screeningId', () => {
    const invalidInput = {
      userId: 1,
      screeningId: -5
    }
    
    expect(() => CreateTicketSchema.parse(invalidInput)).toThrow('screeningId must be a positive integer')
  })

  it('should reject non-integer userId', () => {
    const invalidInput = {
      userId: 1.5,
      screeningId: 123
    }
    
    expect(() => CreateTicketSchema.parse(invalidInput)).toThrow()
  })

  it('should reject missing fields', () => {
    const invalidInput = {
      userId: 1
    }
    
    expect(() => CreateTicketSchema.parse(invalidInput)).toThrow()
  })
})

describe('GetUserTicketsQuerySchema', () => {
  it('should validate valid numeric input', () => {
    const validInput = {
      userId: 1
    }
    
    const result = GetUserTicketsQuerySchema.parse(validInput)
    expect(result).toEqual(validInput)
  })

  it('should coerce string numbers to integers', () => {
    const stringInput = {
      userId: '123'
    }
    
    const result = GetUserTicketsQuerySchema.parse(stringInput)
    expect(result).toEqual({ userId: 123 })
  })

  it('should reject negative userId', () => {
    const invalidInput = {
      userId: -1
    }
    
    expect(() => GetUserTicketsQuerySchema.parse(invalidInput)).toThrow('userId must be a positive integer')
  })

  it('should reject zero userId', () => {
    const invalidInput = {
      userId: 0
    }
    
    expect(() => GetUserTicketsQuerySchema.parse(invalidInput)).toThrow('userId must be a positive integer')
  })

  it('should reject non-numeric strings', () => {
    const invalidInput = {
      userId: 'abc'
    }
    
    expect(() => GetUserTicketsQuerySchema.parse(invalidInput)).toThrow()
  })

  it('should reject decimal numbers after coercion', () => {
    const invalidInput = {
      userId: '1.5'
    }
    
    expect(() => GetUserTicketsQuerySchema.parse(invalidInput)).toThrow()
  })
})

describe('Type inference', () => {
  it('should have correct TypeScript types', () => {
    const createTicketInput: CreateTicketInput = {
      userId: 1,
      screeningId: 123
    }
    
    const getUserTicketsQuery: GetUserTicketsQuery = {
      userId: 1
    }
    
    expect(createTicketInput.userId).toBe(1)
    expect(getUserTicketsQuery.userId).toBe(1)
  })
})