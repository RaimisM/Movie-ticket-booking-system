import type { Insertable, Selectable } from 'kysely'
import type { Database } from '@/database'
import type { Screenings } from '../../database/types'

const TABLE = 'screenings'
type RowInsert = Insertable<Screenings>
type RowSelectable = Selectable<Screenings>

export default (db: Database) => ({
  async createScreening(
    record: RowInsert | RowInsert[]
  ): Promise<RowSelectable[]> {
    const records = Array.isArray(record) ? record : [record]
    return db.insertInto(TABLE).values(records).returningAll().execute()
  },

  async getScreeningById(id: number): Promise<RowSelectable | undefined> {
    return db
      .selectFrom(TABLE)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
  },

  async getScreenings(): Promise<RowSelectable[]> {
    return db.selectFrom(TABLE).selectAll().execute()
  },

  async delete(id: number): Promise<RowSelectable | undefined> {
    return db
      .deleteFrom(TABLE)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  },
})
