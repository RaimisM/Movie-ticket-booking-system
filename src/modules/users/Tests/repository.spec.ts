import { describe, it, beforeEach, expect } from 'vitest'
import { Kysely, SqliteDialect } from 'kysely'
import Database from 'better-sqlite3'
import repository from '../repository'
import type { Users } from '@/database/types'

let db: Kysely<any>
let repo: ReturnType<typeof repository>

const testUser: Omit<Users, 'id'> = {
  userName: 'JohnDoe',
  role: 'user',
}

describe('Users Repository', () => {
  beforeEach(async () => {
    const sqlite = new Database(':memory:')
    db = new Kysely<any>({
      dialect: new SqliteDialect({
        database: sqlite,
      }),
    })

    await db.schema
      .createTable('users')
      .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
      .addColumn('userName', 'text', (col) => col.notNull())
      .addColumn('role', 'text', (col) => col.notNull())
      .execute()

    repo = repository(db)
  })

  it('should create a user and return it', async () => {
    const result = await repo.createUser(testUser)
    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].userName).toBe(testUser.userName)
  })

  it('should get a user by id', async () => {
    const [created] = await repo.createUser(testUser)
    const user = await repo.getUserById(created.id)
    expect(user).toBeDefined()
    expect(user?.userName).toBe(testUser.userName)
  })

  it('should return undefined for non-existing id', async () => {
    const user = await repo.getUserById(999999)
    expect(user).toBeUndefined()
  })

  it('should get all users', async () => {
    await repo.createUser(testUser)
    const allUsers = await repo.getUsers()
    expect(allUsers.length).toBeGreaterThan(0)
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
  })

  it('should return undefined when deleting a non-existing user', async () => {
    const deleted = await repo.deleteUser(999999)
    expect(deleted).toBeUndefined()
  })
})
