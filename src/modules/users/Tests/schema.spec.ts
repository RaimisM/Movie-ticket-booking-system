import { describe, it, expect } from 'vitest'
import * as schema from '../schema'

describe('Users Schema', () => {
  it('should parse a valid user', () => {
    const user = { id: 1, userName: 'Alice', role: 'user' }
    const parsed = schema.parse(user)
    expect(parsed).toEqual(user)
  })

  it('should parse insertable user', () => {
    const insertableUser = { userName: 'Bob', role: 'admin' }
    const parsed = schema.parseInsertable(insertableUser)
    expect(parsed).toEqual(insertableUser)
  })

  it('should reject invalid role', () => {
    const invalidUser = { id: 1, userName: 'Charlie', role: 'superuser' }
    expect(() => schema.parse(invalidUser as any)).toThrow()
  })

  it('should parse ID', () => {
    const id = schema.parseId('123')
    expect(id).toBe(123)
  })

  it('should parse updateable user', () => {
    const updateUser = { role: 'admin' }
    const parsed = schema.parseUpdateable(updateUser)
    expect(parsed).toEqual(updateUser)
  })
})
