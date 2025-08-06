import type { Insertable } from 'kysely'
import { sql } from 'kysely'
import createDatabase from '@/database'
import repository from '../repository'
import type { Screening } from '../../../database/types'

describe('Screenings Repository', () => {
  let db: ReturnType<typeof createDatabase>
  let repo: ReturnType<typeof repository>

  const testScreening: Insertable<Screening> = {
    movieId: 1,
    timestamp: new Date().toISOString(),
    ticketAllocation: 100,
  }

  beforeAll(async () => {
    db = createDatabase(':memory:')
    repo = repository(db)

    // Table names and column names in DB remain snake_case
    // Typescript uses camelCase via Kysely mapping
    await sql`
      CREATE TABLE screenings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movie_id INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        ticket_allocation INTEGER NOT NULL CHECK (ticket_allocation > 0)
      )
    `.execute(db)
  })

  afterAll(async () => {
    if ('destroy' in db) {
      await (db as any).destroy()
    }
  })

  afterEach(async () => {
    await db.deleteFrom('screenings').execute()
  })

  it('should create a screening and return it', async () => {
    const result = await repo.createScreening(testScreening)
    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toMatchObject(testScreening)
    expect(result[0].id).toBeDefined()
  })

  it('should get a screening by id', async () => {
    const [created] = await repo.createScreening(testScreening)
    const screening = await repo.getScreeningById(created.id)
    expect(screening).toBeDefined()
    expect(screening?.id).toBe(created.id)
    expect(screening).toMatchObject(testScreening)
  })

  it('should return undefined for non-existing id', async () => {
    const screening = await repo.getScreeningById(999999)
    expect(screening).toBeUndefined()
  })

  it('should get all screenings', async () => {
    await repo.createScreening(testScreening)
    const allScreenings = await repo.getScreenings()
    expect(allScreenings.length).toBeGreaterThan(0)
    expect(allScreenings[0]).toMatchObject(testScreening)
  })

  it('should delete a screening by id and return deleted screening', async () => {
    const [created] = await repo.createScreening(testScreening)
    const deleted = await repo.delete(created.id)
    expect(deleted).toBeDefined()
    expect(deleted?.id).toBe(created.id)

    const screeningAfterDelete = await repo.getScreeningById(created.id)
    expect(screeningAfterDelete).toBeUndefined()
  })

  it('should return undefined when deleting a non-existing screening', async () => {
    const deleted = await repo.delete(999999)
    expect(deleted).toBeUndefined()
  })
})
