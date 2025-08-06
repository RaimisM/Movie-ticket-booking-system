import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import express, { Express } from 'express'
import controller from '../controller'

const mockDb = {
  selectFrom: vi.fn(),
  insertInto: vi.fn(),
  deleteFrom: vi.fn(),
  updateTable: vi.fn(),
}

function createSelectFromMock(returnValue: any) {
  return {
    select: vi.fn().mockReturnThis(),
    selectAll: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue(returnValue),
    executeTakeFirst: vi
      .fn()
      .mockResolvedValue(
        Array.isArray(returnValue) ? returnValue[0] : returnValue
      ),
  }
}
function createInsertIntoMock(returnValue: any) {
  return {
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue(returnValue),
  }
}
function createDeleteFromMock(returnValue: any) {
  return {
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    executeTakeFirst: vi.fn().mockResolvedValue(returnValue),
  }
}
function createUpdateTableMock(returnValue: any) {
  return {
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    executeTakeFirst: vi.fn().mockResolvedValue(returnValue),
  }
}

describe('Users Controller', () => {
  let app: Express

  function errorHandler(err: any, _req: any, res: any, _next: any) {
    if (err.status) {
      res.status(err.status).json({ message: err.message })
    } else {
      res.status(500).json({ message: 'Internal Server Error' })
    }
  }

  beforeEach(() => {
    vi.resetAllMocks()
    app = express()
    app.use(express.json())
    app.use('/users', controller(mockDb as any))
    app.use(errorHandler)
  })

  it('GET /users - success', async () => {
    const usersList = [{ id: 1, userName: 'Alice', role: 'user' }]
    mockDb.selectFrom.mockReturnValue(createSelectFromMock(usersList))

    const res = await request(app).get('/users')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(usersList)
  })

  it('GET /users - no users found', async () => {
    mockDb.selectFrom.mockReturnValue(createSelectFromMock([]))

    const res = await request(app).get('/users')

    expect(res.status).toBe(404)
    expect(res.body.message).toBe('No users found')
  })

  it('POST /users - success', async () => {
    const newUser = { userName: 'Bob', role: 'user' }
    const createdUser = [{ id: 1, ...newUser }]

    mockDb.insertInto.mockReturnValue(createInsertIntoMock(createdUser))

    const res = await request(app).post('/users').send(newUser)

    expect(res.status).toBe(201)
    expect(res.body).toEqual(createdUser)
  })

  it('GET /users/:id - success', async () => {
    const user = { id: 1, userName: 'Alice', role: 'user' }
    mockDb.selectFrom.mockReturnValue(createSelectFromMock(user))

    const res = await request(app).get('/users/1')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(user)
  })

  it('PATCH /users/:id - success', async () => {
    const updatedUser = { id: 1, userName: 'Alice', role: 'admin' }
    mockDb.updateTable.mockReturnValue(createUpdateTableMock(updatedUser))

    const res = await request(app).patch('/users/1').send({ role: 'admin' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual(updatedUser)
  })

  it('DELETE /users/:id - success', async () => {
    const deletedUser = { id: 1, userName: 'Alice', role: 'user' }
    mockDb.deleteFrom.mockReturnValue(createDeleteFromMock(deletedUser))

    const res = await request(app).delete('/users/1')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(deletedUser)
  })
})
