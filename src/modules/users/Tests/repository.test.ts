import type { Insertable } from 'kysely'
import { sql } from 'kysely'
import createDatabase from '@/database'
import repository from '../repository'
import type { User } from '../../../database/types'

describe('Users Repository', () => {
  let db: ReturnType<typeof createDatabase>
  let repo: ReturnType<typeof repository>

  const testUser: Insertable<User> = {
    userName: 'JohnDoe',
    role: 'user',
  }

  beforeAll(async () => {
    db = createDatabase(':memory:')
    repo = repository(db)

    await sql`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT NOT NULL,
        role TEXT NOT NULL
      )
    `.execute(db)
  })

  afterAll(async () => {
    if ('destroy' in db) {
      await (db as any).destroy()
    }
  })

  afterEach(async () => {
    await db.deleteFrom('users').execute()
  })

  it('should create a user and return it', async () => {
    const result = await repo.createUser(testUser)
    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toMatchObject(testUser)
    expect(result[0].id).toBeDefined()
  })

  it('should get a user by id', async () => {
    const [created] = await repo.createUser(testUser)
    const user = await repo.getUserById(created.id)
    expect(user).toBeDefined()
    expect(user?.id).toBe(created.id)
    expect(user).toMatchObject(testUser)
  })

  it('should return undefined for non-existing id', async () => {
    const user = await repo.getUserById(999999)
    expect(user).toBeUndefined()
  })

  it('should get all users', async () => {
    await repo.createUser(testUser)
    const allUsers = await repo.getUsers()
    expect(allUsers.length).toBeGreaterThan(0)
    expect(allUsers[0]).toMatchObject(testUser)
  })

  it('should update a user', async () => {
    const [created] = await repo.createUser(testUser)
    const updated = await repo.updateUser(created.id, { role: 'admin' })
    expect(updated).toBeDefined()
    expect(updated?.role).toBe('admin')
  })

  it('should delete a user by id and return deleted user', async () => {
    const [created] = await repo.createUser(testUser)
    const deleted = await repo.deleteUser(created.id)
    expect(deleted).toBeDefined()
    expect(deleted?.id).toBe(created.id)

    const userAfterDelete = await repo.getUserById(created.id)
    expect(userAfterDelete).toBeUndefined()
  })

  it('should return undefined when deleting a non-existing user', async () => {
    const deleted = await repo.deleteUser(999999)
    expect(deleted).toBeUndefined()
  })
})
