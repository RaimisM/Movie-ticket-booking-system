import type { Insertable, Selectable } from 'kysely'
import { Database } from '@/database'
import { Screenings } from '../../database/types'

const TABLE = 'screenings'
type RowInsert = Insertable<Screenings>
type RowSelectable = Selectable<Screenings>

export default (db: Database) => ({
  // create screening
  async createScreening(record: RowInsert | RowInsert[]) {
    const screening = await db
      .insertInto(TABLE)
      .values(record)
      .returningAll()
      .execute()

    return screening
  },

  // get screening by Id
  async getScreeningById(id: number): Promise<RowSelectable | undefined> {
    const screening = await db
      .selectFrom(TABLE)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()

    return screening
  },

  // get all screenings
  async getScreenings(): Promise<RowSelectable[]> {
    return db.selectFrom(TABLE).selectAll().execute()
  },

  // delete screening
  async delete(id: number): Promise<RowSelectable | undefined> {
    return db
      .deleteFrom(TABLE)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  },
})
