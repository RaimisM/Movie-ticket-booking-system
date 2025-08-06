import type { Insertable, Selectable } from 'kysely'
import type { Database } from '@/database'
import type { Screening } from '../../database/types'

const TABLE = 'screenings'
type RowInsert = Insertable<Screening>
type RowSelectable = Selectable<Screening>

export default (db: Database) => ({
  // Create screening(s)
  async createScreening(
    record: RowInsert | RowInsert[]
  ): Promise<RowSelectable[]> {
    const screening = await db
      .insertInto(TABLE)
      .values(record)
      .returningAll() // return all columns for test match
      .execute()
    return screening
  },

  // Get screening by ID
  async getScreeningById(id: number): Promise<RowSelectable | undefined> {
    const screening = await db
      .selectFrom(TABLE)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
    return screening
  },

  // Get all screenings
  async getScreenings(): Promise<RowSelectable[]> {
    return db.selectFrom(TABLE).selectAll().execute()
  },

  // Delete screening and return deleted row
  async delete(id: number): Promise<RowSelectable | undefined> {
    const deleted = await db
      .deleteFrom(TABLE)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
    return deleted
  },
})
